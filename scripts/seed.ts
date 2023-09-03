const { PrismaClient } = require("@prisma/client");
// use require because its pure JS <NOT A NEXTJS STUFF>

const db = new PrismaClient();

async function main() {
  try {
    await db.category.createMany({
      data: [
        { name: "Famous People" },
        { name: "Movies & TV" },
        { name: "Musicians" },
        { name: "Games" },
        { name: "Animals" },
        { name: "Scientists" },
        { name: "Philosophy" },
      ],
    });
  } catch (err) {
    console.error("Error seeding default", err);
  } finally {
    await db.$disconnect();
  }
}

main();
