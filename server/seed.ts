import { db } from "./db";
import {
  packages,
  timeSlots,
  users,
  holidayCalendar,
  discountVouchers,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Seed packages
    await seedPackages();
    
    // Seed time slots
    await seedTimeSlots();
    
    // Seed admin user
    await seedAdminUser();
    
    // Seed holiday calendar
    await seedHolidayCalendar();
    
    // Seed discount vouchers
    await seedDiscountVouchers();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function seedPackages() {
  const packageData = [
    {
      name: 'Walk-in Package',
      type: 'walk_in' as const,
      price: '299.00',
      duration: 2,
      description: 'Perfect for spontaneous fun visits',
      features: [
        'Access to all play zones',
        'Safety supervision included',
        'Free Wi-Fi for parents',
        'Complimentary water'
      ],
      maxChildren: 1,
      isActive: true
    },
    {
      name: 'Weekend Special',
      type: 'weekend' as const,
      price: '399.00',
      duration: 3,
      description: 'Extra fun for weekends and holidays',
      features: [
        'All walk-in benefits',
        'Extended play time',
        'Complimentary snacks',
        'Priority booking'
      ],
      maxChildren: 1,
      isActive: true
    },
    {
      name: 'Monthly Pass',
      type: 'monthly' as const,
      price: '2999.00',
      duration: 720, // 30 days * 24 hours
      description: 'Best value for regular visitors',
      features: [
        'Unlimited play sessions',
        'Bring a friend discount',
        'Birthday party discount',
        'Exclusive member events'
      ],
      maxChildren: 1,
      isActive: true
    },
    {
      name: 'Birthday Party Package',
      type: 'birthday' as const,
      price: '4999.00',
      duration: 3,
      description: 'Make your child\'s special day magical',
      features: [
        'Themed decorations',
        'Birthday cake included',
        'Party games & activities',
        'Dedicated party host',
        'Photography session',
        'Party favors for guests'
      ],
      maxChildren: 15,
      isActive: true
    }
  ];

  for (const pkg of packageData) {
    const existing = await db.select().from(packages).where(eq(packages.name, pkg.name));
    
    if (existing.length === 0) {
      await db.insert(packages).values(pkg);
      console.log(`Created package: ${pkg.name}`);
    } else {
      console.log(`Package already exists: ${pkg.name}`);
    }
  }
}

async function seedTimeSlots() {
  const timeSlotData = [
    { startTime: '10:00:00', endTime: '12:00:00', maxCapacity: 15, isActive: true },
    { startTime: '12:00:00', endTime: '14:00:00', maxCapacity: 15, isActive: true },
    { startTime: '14:00:00', endTime: '16:00:00', maxCapacity: 15, isActive: true },
    { startTime: '16:00:00', endTime: '18:00:00', maxCapacity: 15, isActive: true },
    { startTime: '18:00:00', endTime: '20:00:00', maxCapacity: 15, isActive: true }
  ];

  for (const slot of timeSlotData) {
    const existing = await db.select().from(timeSlots).where(eq(timeSlots.startTime, slot.startTime));
    
    if (existing.length === 0) {
      await db.insert(timeSlots).values(slot);
      console.log(`Created time slot: ${slot.startTime} - ${slot.endTime}`);
    } else {
      console.log(`Time slot already exists: ${slot.startTime} - ${slot.endTime}`);
    }
  }
}

async function seedAdminUser() {
  const adminId = "raspik2025";

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, adminId));

  if (existing) {
    console.log("Admin user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  await db.insert(users).values({
    id: adminId,
    email: "admin@toodlesfunzone.com",
    firstName: "Raspik",
    lastName: "Admin",
    profileImageUrl: null,
    phone: "+919876543210",
    isAdmin: true,
    role: "admin",
    permissions: [
      "manage_users",
      "manage_packages",
      "manage_bookings",
      "manage_birthdays",
      "view_analytics",
      "manage_content",
    ],
    passwordHash,
    registrationSource: "seed",
  });

  console.log("Created admin user (raspik2025)");
}

async function seedHolidayCalendar() {
  const currentYear = new Date().getFullYear();
  const holidayData = [
    {
      date: `${currentYear}-01-26`,
      name: 'Republic Day',
      type: 'holiday',
      description: 'National Holiday - Closed for celebrations',
      isActive: true
    },
    {
      date: `${currentYear}-08-15`,
      name: 'Independence Day',
      type: 'holiday',
      description: 'National Holiday - Closed for celebrations',
      isActive: true
    },
    {
      date: `${currentYear}-10-02`,
      name: 'Gandhi Jayanti',
      type: 'holiday',
      description: 'National Holiday - Closed for celebrations',
      isActive: true
    },
    {
      date: `${currentYear}-12-25`,
      name: 'Christmas Day',
      type: 'holiday',
      description: 'Festival Holiday - Closed for celebrations',
      isActive: true
    },
    {
      date: `${currentYear}-01-01`,
      name: 'New Year\'s Day',
      type: 'holiday',
      description: 'New Year Holiday - Closed for celebrations',
      isActive: true
    }
  ];

  for (const holiday of holidayData) {
    const existing = await db.select().from(holidayCalendar).where(eq(holidayCalendar.date, holiday.date));
    
    if (existing.length === 0) {
      await db.insert(holidayCalendar).values(holiday);
      console.log(`Created holiday: ${holiday.name}`);
    } else {
      console.log(`Holiday already exists: ${holiday.name}`);
    }
  }
}

async function seedDiscountVouchers() {
  const currentDate = new Date();
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const nextYear = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

  const voucherData = [
    {
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: '20.00',
      minAmount: '200.00',
      maxDiscount: '100.00',
      validFrom: currentDate.toISOString().split('T')[0],
      validTill: nextYear.toISOString().split('T')[0],
      usageLimit: 100,
      usedCount: 0,
      applicablePackages: ['walk_in', 'weekend'],
      isActive: true
    },
    {
      code: 'BIRTHDAY50',
      discountType: 'fixed',
      discountValue: '500.00',
      minAmount: '2000.00',
      maxDiscount: '500.00',
      validFrom: currentDate.toISOString().split('T')[0],
      validTill: nextYear.toISOString().split('T')[0],
      usageLimit: 50,
      usedCount: 0,
      applicablePackages: ['birthday'],
      isActive: true
    },
    {
      code: 'FIRSTVISIT',
      discountType: 'percentage',
      discountValue: '15.00',
      minAmount: '250.00',
      maxDiscount: '75.00',
      validFrom: currentDate.toISOString().split('T')[0],
      validTill: nextMonth.toISOString().split('T')[0],
      usageLimit: 200,
      usedCount: 0,
      applicablePackages: ['walk_in', 'weekend'],
      isActive: true
    },
    {
      code: 'SIBLING10',
      discountType: 'percentage',
      discountValue: '10.00',
      minAmount: '400.00',
      maxDiscount: '150.00',
      validFrom: currentDate.toISOString().split('T')[0],
      validTill: nextYear.toISOString().split('T')[0],
      usageLimit: 1000,
      usedCount: 0,
      applicablePackages: ['walk_in', 'weekend', 'monthly'],
      isActive: true
    }
  ];

  for (const voucher of voucherData) {
    const existing = await db.select().from(discountVouchers).where(eq(discountVouchers.code, voucher.code));
    
    if (existing.length === 0) {
      await db.insert(discountVouchers).values(voucher);
      console.log(`Created voucher: ${voucher.code}`);
    } else {
      console.log(`Voucher already exists: ${voucher.code}`);
    }
  }
}

// Function to run seeding
export async function runSeeding() {
  try {
    await seedDatabase();
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
// Using import.meta.url check for ES modules
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeding();
}
