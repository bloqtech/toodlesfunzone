import "../server/env";
import { seedDatabase } from "../server/seed";

async function runSeed() {
  try {
    console.log("🌱 Starting database seeding...\n");
    await seedDatabase();
    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    process.exit(1);
  }
}

runSeed();
