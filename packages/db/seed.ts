import { currencies } from "./schema";
import type { PersonalSpaceDB } from "./index";

export const seedCurrencies = async (db: PersonalSpaceDB) => {
  console.log("🌱 Seeding currencies...");

  await db
    .insert(currencies)
    .values([
      { name: "Peso Argentino", symbol: "ARS$" },
      { name: "Dólar Estadounidense", symbol: "US$" },
      { name: "Euro", symbol: "€" },
      { name: "Real Brasileño", symbol: "R$" },
      { name: "Peso Mexicano", symbol: "MX$" },
      { name: "Peso Chileno", symbol: "CLP$" },
      { name: "Peso Colombiano", symbol: "COP$" },
      { name: "Libra Esterlina", symbol: "£" },
      { name: "Yen Japonés", symbol: "¥" },
      { name: "Yuan Chino", symbol: "¥" },
    ])
    .onConflictDoNothing({
      target: currencies.name, // Relies on the .unique() constraint in schema.ts
    });

  console.log("✅ Currencies seeded successfully!");
};

// A master function in case you want to add more seeds later (like a default project)
export const seedDatabase = async (db: PersonalSpaceDB) => {
  try {
    await seedCurrencies(db);
    // await seedDefaultCategories(db);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};
