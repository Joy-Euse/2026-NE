import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

// Auth Service Prisma Client (auth DB)
const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL || "postgresql://postgres:user@localhost:5432/auth_db",
    },
  },
});

// User Service Prisma Client (user DB)
const userPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.USER_DATABASE_URL || "postgresql://postgres:user@localhost:5432/user_db",
    },
  },
});

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
    firstName: "John",
    lastName: "Inspector",
  },
  {
    email: "inspector2@fire.com",
    password: "Inspector@123456",
    role: "INSPECTOR",
    firstName: "Jane",
    lastName: "Inspector",
  },
];

async function main() {
  console.log("🌱 Starting seed process...\n");

  for (const user of users) {
    try {
      // Check if user already exists
      const existingAuth = await authPrisma.userCredential.findUnique({
        where: { email: user.email },
      });

      if (existingAuth) {
        console.log(`✓ ${user.email} already exists in auth DB`);

        // Check if profile exists
        const existingProfile = await userPrisma.userProfile.findUnique({
          where: { email: user.email },
        });

        if (existingProfile) {
          console.log(`  ✓ Profile exists with role: ${existingProfile.role}\n`);
        } else {
          // Create missing profile
          const profile = await userPrisma.userProfile.create({
            data: {
              authUserId: existingAuth.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              status: "ACTIVE",
            },
          });

          console.log(`  ✓ Created missing profile`);
          console.log(`    ID: ${profile.id}`);
          console.log(`    Role: ${profile.role}\n`);
        }
        continue;
      }

      // Create credential in auth DB
      const credential = await authPrisma.userCredential.create({
        data: {
          email: user.email,
          passwordHash: await hashPassword(user.password),
        },
      });

      console.log(`✓ Created credential in auth DB`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Auth ID: ${credential.id}`);
      console.log(`  Password: ${user.password}`);

      // Create profile in user DB
      const profile = await userPrisma.userProfile.create({
        data: {
          authUserId: credential.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: "ACTIVE",
        },
      });

      console.log(`✓ Created profile in user DB`);
      console.log(`  Profile ID: ${profile.id}`);
      console.log(`  Role: ${profile.role}\n`);
    } catch (error) {
      console.error(`✗ Error processing ${user.email}:`, error.message);
      console.error("");
    }
  }
}

main()
  .then(async () => {
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
    console.log("✅ Seeding completed successfully!\n");
    console.log("📝 Created Users:");
    console.log("   1. admin@fire.com (ADMIN)");
    console.log("   2. inspector1@fire.com (INSPECTOR)");
    console.log("   3. inspector2@fire.com (INSPECTOR)\n");
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
    process.exit(1);
  });
