import { getDb } from "./db";
import { plans } from "../drizzle/schema";

/**
 * Seed default plans into the database
 * Run this once to initialize plans
 */
export async function seedPlans() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    // Check if plans already exist
    const existingPlans = await db.select().from(plans);
    if (existingPlans.length > 0) {
      console.log("Plans already seeded");
      return;
    }

    // Insert default plans
    await db.insert(plans).values([
      {
        name: "خطة مجانية",
        description: "خطة مجانية للعيادات الصغيرة",
        price: 0,
        maxDoctors: 3,
        maxAppointmentsPerMonth: 100,
        features: JSON.stringify([
          "حتى 3 أطباء",
          "حتى 100 موعد شهري",
          "إدارة أساسية",
        ]),
        isActive: true,
      },
      {
        name: "خطة احترافية",
        description: "خطة احترافية للعيادات المتوسطة",
        price: 9900, // 99.00 in cents
        maxDoctors: 10,
        maxAppointmentsPerMonth: 500,
        features: JSON.stringify([
          "حتى 10 أطباء",
          "حتى 500 موعد شهري",
          "إدارة متقدمة",
          "تقارير وإحصائيات",
          "دعم أولوي",
        ]),
        isActive: true,
      },
      {
        name: "خطة مؤسسية",
        description: "خطة مؤسسية للعيادات الكبيرة",
        price: 29900, // 299.00 in cents
        maxDoctors: 50,
        maxAppointmentsPerMonth: 5000,
        features: JSON.stringify([
          "حتى 50 طبيب",
          "حتى 5000 موعد شهري",
          "إدارة شاملة",
          "تقارير متقدمة",
          "دعم 24/7",
          "تخصيص كامل",
        ]),
        isActive: true,
      },
    ]);

    console.log("Plans seeded successfully");
  } catch (error) {
    console.error("Error seeding plans:", error);
  }
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPlans().then(() => process.exit(0));
}
