// Script to set a user as admin
// Run with: node scripts/make-admin.js <email>

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.log("Usage: node scripts/make-admin.js <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    console.log(`✅ User ${user.email} is now an admin!`);
    console.log(`   Name: ${user.name || "N/A"}`);
    console.log(`   Role: ${user.role}`);
  } catch (error) {
    if (error.code === "P2025") {
      console.error(`❌ User with email "${email}" not found`);
    } else {
      console.error("Error:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
