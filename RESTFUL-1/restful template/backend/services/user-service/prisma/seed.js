import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  console.log("🌱 Seeding user database...\n");

  // Note: In a real scenario, you would get authUserIds from the auth service
  // For now, we'll create them with placeholder IDs
  // After running auth seed, update these manually or fetch from auth DB

  for (const user of users) {
    const existing = await prisma.userProfile.findUnique({
      where: { email: user.email },
    });

    if (existing) {
      console.log(`✓ ${user.email} already exists (ID: ${existing.id})`);
      console.log(`  Role: ${existing.role}, Status: ${existing.status}`);
      continue;
    }

    try {
      const profile = await prisma.userProfile.create({
        data: {
          authUserId: user.authUserId || `auth-${user.email}`, // Placeholder
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: "ACTIVE",
        },
      });

      console.log(`✓ Created profile for ${user.email}`);
      console.log(`  ID: ${profile.id}`);
      console.log(`  Role: ${profile.role}`);
      console.log(`  Status: ${profile.status}\n`);
    } catch (error) {
      console.error(`✗ Error creating profile for ${user.email}:`, error.message);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ User database seeded successfully!\n");
    console.log("📝 Note: authUserId values are placeholders.");
    console.log("   Update them after running the auth service seed.\n");
  })
  .catch(async (e) => {
    console.error("❌ Error seeding user database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
