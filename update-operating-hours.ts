import { db } from "./server/db";
import { operatingHours } from "./shared/schema";
import { eq } from "drizzle-orm";

/**
 * Updates operating hours:
 * - Monday: 16:00 - 20:30
 * - Tuesday to Sunday: 11:00 - 20:30
 */
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
    // Check if record exists
    const existing = await db
      .select()
      .from(operatingHours)
      .where(eq(operatingHours.dayOfWeek, hour.dayOfWeek));

    if (existing.length > 0) {
      // Update existing record
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
      // Create new record
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
  console.log("\n📅 Operating Hours:");
  console.log("   Monday: 16:00 - 20:30");
  console.log("   Tuesday-Sunday: 11:00 - 20:30");
}

async function main() {
  try {
    await updateOperatingHours();
    console.log("\n✅ Operating hours updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error updating operating hours:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  }
}

main();

