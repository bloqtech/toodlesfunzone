# Operating Hours Code Documentation

## 📋 Overview
Complete implementation of operating hours management system for Toodles Funzone.

---

## 1. Database Schema

**File:** `shared/schema.ts`

```typescript
// Operating hours table
export const operatingHours = pgTable("operating_hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
  isOpen: boolean("is_open").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

**Day of Week Mapping:**
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

---

## 2. Storage/Database Operations

**File:** `server/storage.ts`

### Get All Operating Hours
```typescript
async getOperatingHours(): Promise<OperatingHours[]> {
  return await db.select().from(operatingHours).orderBy(asc(operatingHours.dayOfWeek));
}
```

### Update/Create Operating Hours
```typescript
async updateOperatingHours(hoursData: { 
  [key: number]: { 
    openTime: string; 
    closeTime: string; 
    isOpen: boolean 
  } 
}): Promise<OperatingHours[]> {
  const results: OperatingHours[] = [];
  
  for (const [dayOfWeek, hours] of Object.entries(hoursData)) {
    const dayNum = parseInt(dayOfWeek);
    
    // Check if record exists
    const existing = await db
      .select()
      .from(operatingHours)
      .where(eq(operatingHours.dayOfWeek, dayNum));
    
    if (existing.length > 0) {
      // Update existing record
      const [updated] = await db
        .update(operatingHours)
        .set({
          openTime: hours.openTime,
          closeTime: hours.closeTime,
          isOpen: hours.isOpen,
          updatedAt: new Date()
        })
        .where(eq(operatingHours.dayOfWeek, dayNum))
        .returning();
      results.push(updated);
    } else {
      // Create new record
      const [created] = await db
        .insert(operatingHours)
        .values({
          dayOfWeek: dayNum,
          openTime: hours.openTime,
          closeTime: hours.closeTime,
          isOpen: hours.isOpen
        })
        .returning();
      results.push(created);
    }
  }
  
  return results;
}
```

### Get Operating Hours by Day
```typescript
async getOperatingHoursByDay(dayOfWeek: number): Promise<OperatingHours | undefined> {
  const [hours] = await db
    .select()
    .from(operatingHours)
    .where(eq(operatingHours.dayOfWeek, dayOfWeek));
  return hours;
}
```

---

## 3. API Routes

**File:** `server/routes.ts`

### Admin: Get All Operating Hours
```typescript
app.get('/api/admin/operating-hours', isAuthenticated, adminAuth, async (req, res) => {
  try {
    const operatingHours = await storage.getOperatingHours();
    res.json(operatingHours);
  } catch (error) {
    console.error("Error fetching operating hours:", error);
    res.status(500).json({ message: "Failed to fetch operating hours" });
  }
});
```

### Admin: Update Operating Hours
```typescript
app.put('/api/admin/operating-hours', isAuthenticated, adminAuth, async (req, res) => {
  try {
    const hoursData = req.body;
    const updatedHours = await storage.updateOperatingHours(hoursData);
    res.json(updatedHours);
  } catch (error) {
    console.error("Error updating operating hours:", error);
    res.status(500).json({ message: "Failed to update operating hours" });
  }
});
```

### Public: Get Operating Hours by Day
```typescript
app.get('/api/operating-hours/:dayOfWeek', async (req, res) => {
  try {
    const dayOfWeek = parseInt(req.params.dayOfWeek);
    const hours = await storage.getOperatingHoursByDay(dayOfWeek);
    res.json(hours || { dayOfWeek, isOpen: false });
  } catch (error) {
    console.error("Error fetching operating hours by day:", error);
    res.status(500).json({ message: "Failed to fetch operating hours" });
  }
});
```

---

## 4. Update Script

**File:** `update-operating-hours.ts`

```typescript
import { db } from "./server/db";
import { operatingHours } from "./shared/schema";
import { eq } from "drizzle-orm";

async function updateOperatingHours() {
  console.log("🕐 Updating operating hours...\n");

  // Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hoursData = [
    { dayOfWeek: 0, name: 'Sunday', openTime: '11:00:00', closeTime: '20:30:00', isOpen: true },
    { dayOfWeek: 1, name: 'Monday', openTime: '16:00:00', closeTime: '20:30:00', isOpen: true },
    { dayOfWeek: 2, name: 'Tuesday', openTime: '11:00:00', closeTime: '20:30:00', isOpen: true },
    { dayOfWeek: 3, name: 'Wednesday', openTime: '11:00:00', closeTime: '20:30:00', isOpen: true },
    { dayOfWeek: 4, name: 'Thursday', openTime: '11:00:00', closeTime: '20:30:00', isOpen: true },
    { dayOfWeek: 5, name: 'Friday', openTime: '11:00:00', closeTime: '20:30:00', isOpen: true },
    { dayOfWeek: 6, name: 'Saturday', openTime: '11:00:00', closeTime: '20:30:00', isOpen: true },
  ];

  let created = 0;
  let updated = 0;

  for (const hour of hoursData) {
    const existing = await db
      .select()
      .from(operatingHours)
      .where(eq(operatingHours.dayOfWeek, hour.dayOfWeek));

    if (existing.length > 0) {
      await db
        .update(operatingHours)
        .set({
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen,
          updatedAt: new Date(),
        })
        .where(eq(operatingHours.dayOfWeek, hour.dayOfWeek));
      
      console.log(`   ✅ Updated ${hour.name}: ${hour.openTime} - ${hour.closeTime}`);
      updated++;
    } else {
      await db.insert(operatingHours).values({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isOpen: hour.isOpen,
      });
      
      console.log(`   ✨ Created ${hour.name}: ${hour.openTime} - ${hour.closeTime}`);
      created++;
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   Created: ${created} operating hour records`);
  console.log(`   Updated: ${updated} operating hour records`);
}

// Run: npm run db:update-hours
```

---

## 5. Frontend Admin Component

**File:** `client/src/pages/admin/operating-hours.tsx`

Key features:
- ✅ Visual UI for all 7 days
- ✅ Time picker for open/close times
- ✅ Toggle open/closed per day
- ✅ Duration calculation
- ✅ Weekly summary
- ✅ Real-time updates

**Main State:**
```typescript
const [operatingHours, setOperatingHours] = useState<{ 
  [key: number]: { 
    openTime: string; 
    closeTime: string; 
    isOpen: boolean 
  } 
}>({});
```

**Update Handler:**
```typescript
const updateHoursMutation = useMutation({
  mutationFn: async (hoursData) => {
    const response = await apiRequest('PUT', '/api/admin/operating-hours', hoursData);
    return response.json();
  },
  onSuccess: () => {
    toast({
      title: "Operating Hours Updated",
      description: "The operating hours have been saved successfully.",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/operating-hours"] });
  }
});
```

---

## 📍 API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/operating-hours` | Admin | Get all operating hours |
| PUT | `/api/admin/operating-hours` | Admin | Update operating hours |
| GET | `/api/operating-hours/:dayOfWeek` | Public | Get hours for specific day |

---

## 🔧 Usage Examples

### Get All Operating Hours (Admin)
```bash
curl http://localhost:5000/api/admin/operating-hours
```

### Update Operating Hours (Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/operating-hours \
  -H "Content-Type: application/json" \
  -d '{
    "1": { "openTime": "11:00", "closeTime": "20:30", "isOpen": true },
    "2": { "openTime": "11:00", "closeTime": "20:30", "isOpen": true }
  }'
```

### Get Hours for Monday (dayOfWeek = 1)
```bash
curl http://localhost:5000/api/operating-hours/1
```

### Run Update Script
```bash
npm run db:update-hours
```

---

## 📝 Current Schedule

- **Monday:** 16:00 - 20:30
- **Tuesday-Sunday:** 11:00 - 20:30

---

## 🎯 Integration Points

Operating hours are used to:
1. ✅ Determine booking availability
2. ✅ Generate time slots automatically
3. ✅ Validate booking dates/times
4. ✅ Display hours on public pages
5. ✅ Block bookings on closed days

---

**Access Admin UI:** http://localhost:5000/admin/operating-hours

