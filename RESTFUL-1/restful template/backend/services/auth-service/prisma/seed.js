import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

const users = [
  {
    email: "admin@fire.com",
    password: "Admin@123456",
    role: "ADMIN",
    firstName: "System",
    lastName: "Administrator",
  },
  {
    email: "inspector1@fire.com",
    password: "Inspector@123456",
    role: "INSPECTOR",
    firstName: "Joyeuse",
    lastName: "Inspector",
  },
  {
    email: "inspector2@fire.com",
    password: "Inspector@123456",
    role: "INSPECTOR",
    firstName: "Iradukunda",
    lastName: "Inspector",
  },
];

async function main() {
  console.log("🌱 Seeding auth database...");

  for (const user of users) {
    const existing = await prisma.userCredential.findUnique({
      where: { email: user.email },
    });

    if (existing) {
      console.log(`✓ ${user.email} already exists, skipping...`);
      continue;
    }

    const credential = await prisma.userCredential.create({
      data: {
        email: user.email,
        passwordHash: await hashPassword(user.password),
      },
    });

    console.log(`✓ Created credential for ${user.email} (ID: ${credential.id})`);
    console.log(`  Password: ${user.password}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✅ Auth database seeded successfully!");
  })
  .catch(async (e) => {
    console.error("❌ Error seeding auth database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
