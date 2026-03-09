import "../server/env";
import { db } from "../server/db";
import { timeSlots, packages } from "../shared/schema";

async function checkDatabase() {
  console.log("🔍 Checking database for time slots...\n");

  try {
    // Check all time slots
    const allTimeSlots = await db.select().from(timeSlots);

    console.log(`📊 Total time slots in database: ${allTimeSlots.length}\n`);

    if (allTimeSlots.length === 0) {
      console.log("❌ No time slots found in the database!");
      console.log("💡 You need to seed the database. Run: npm run db:seed or npm run db:create-slots.\n");
    } else {
      console.log("✅ Time slots found:\n");
      allTimeSlots.forEach((slot, index) => {
        console.log(`${index + 1}. ID: ${slot.id}`);
        console.log(`   Time: ${slot.startTime} - ${slot.endTime}`);
        console.log(`   Max Capacity: ${slot.maxCapacity}`);
        console.log(`   Active: ${slot.isActive ? "✅ Yes" : "❌ No"}`);
        console.log("");
      });

      // Check active time slots
      const activeTimeSlots = allTimeSlots.filter((slot) => slot.isActive);
      console.log(`\n📈 Active time slots: ${activeTimeSlots.length}`);
      console.log(`📉 Inactive time slots: ${allTimeSlots.length - activeTimeSlots.length}`);
    }

    // Check if we can query packages too
    const allPackages = await db.select().from(packages);
    console.log(`\n📦 Total packages in database: ${allPackages.length}`);
  } catch (error) {
    console.error("❌ Error checking database:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
  } finally {
    process.exit(0);
  }
}

checkDatabase();
