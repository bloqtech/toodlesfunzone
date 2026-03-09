import "../server/env";
import { db } from "../server/db";
import { timeSlots } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Creates hourly time slots based on operating hours:
 * - Monday: 16:00 - 20:30
 * - Tuesday to Sunday: 11:00 - 20:30
 *
 * Since time slots don't have a day field, we create all slots
 * from 11:00 to 20:30. The application can filter by day when booking.
 */
async function createHourlyTimeSlots() {
  console.log("🕐 Creating hourly time slots...\n");

  const slots = [
    { start: "11:00:00", end: "12:00:00" },
    { start: "12:00:00", end: "13:00:00" },
    { start: "13:00:00", end: "14:00:00" },
    { start: "14:00:00", end: "15:00:00" },
    { start: "15:00:00", end: "16:00:00" },
    { start: "16:00:00", end: "17:00:00" },
    { start: "17:00:00", end: "18:00:00" },
    { start: "18:00:00", end: "19:00:00" },
    { start: "19:00:00", end: "20:00:00" },
    { start: "20:00:00", end: "20:30:00" },
  ];

  let created = 0;
  let skipped = 0;
  let updated = 0;

  console.log("📋 Deactivating existing time slots...");
  const existingSlots = await db.select().from(timeSlots);
  for (const slot of existingSlots) {
    await db.update(timeSlots).set({ isActive: false }).where(eq(timeSlots.id, slot.id));
  }
  console.log(`   Deactivated ${existingSlots.length} existing slots\n`);

  for (const slot of slots) {
    const existing = await db.select().from(timeSlots).where(eq(timeSlots.startTime, slot.start));

    if (existing.length > 0) {
      await db
        .update(timeSlots)
        .set({ endTime: slot.end, maxCapacity: 15, isActive: true })
        .where(eq(timeSlots.id, existing[0].id));
      console.log(`   ✅ Updated: ${slot.start} - ${slot.end}`);
      updated++;
    } else {
      await db.insert(timeSlots).values({
        startTime: slot.start,
        endTime: slot.end,
        maxCapacity: 15,
        isActive: true,
      });
      console.log(`   ✨ Created: ${slot.start} - ${slot.end}`);
      created++;
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   Created: ${created} new time slots`);
  console.log(`   Updated: ${updated} existing time slots`);
  console.log(`   Skipped: ${skipped} time slots`);
  console.log(`\n✅ Total active time slots: ${created + updated}`);
  console.log("\n📅 Operating Hours:");
  console.log("   Monday: 16:00 - 20:30 (uses slots from 16:00)");
  console.log("   Tuesday-Sunday: 11:00 - 20:30 (uses slots from 11:00)");
}

async function main() {
  try {
    await createHourlyTimeSlots();
    console.log("\n✅ Hourly time slots created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating time slots:", error);
    if (error instanceof Error) console.error("Error message:", error.message);
    process.exit(1);
  }
}

main();
