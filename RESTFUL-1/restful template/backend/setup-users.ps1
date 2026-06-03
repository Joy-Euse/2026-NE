cd "c:\Users\Tishok\Documents\Projects\2026 NE\RESTFUL-1\restful template\backend\services\auth-service"

Write-Host "Step 1: Seeding Auth Service Database..."

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing auth-service dependencies..."
    npm install
}

Write-Host "Running auth seed..."
npm run seed

cd "..\user-service"

Write-Host ""
Write-Host "Step 2: Seeding User Service Database..."

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing user-service dependencies..."
    npm install
}

$syncScript = 'import { PrismaClient } from "@prisma/client";

const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:user@localhost:5432/auth_db",
    },
  },
});

const userPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:user@localhost:5432/user_db",
    },
  },
});

const userData = [
  {
    email: "admin@fire.com",
    firstName: "System",
    lastName: "Administrator",
    role: "ADMIN",
  },
  {
    email: "inspector1@fire.com",
    firstName: "John",
    lastName: "Inspector",
    role: "INSPECTOR",
  },
  {
    email: "inspector2@fire.com",
    firstName: "Jane",
    lastName: "Inspector",
    role: "INSPECTOR",
  },
];

async function main() {
  console.log("Syncing user profiles with auth credentials...\n");

  for (const user of userData) {
    try {
      const authCredential = await authPrisma.userCredential.findUnique({
        where: { email: user.email },
      });

      if (!authCredential) {
        console.log(`Skipping ${user.email}, auth credential not found`);
        continue;
      }

      const existingProfile = await userPrisma.userProfile.findUnique({
        where: { email: user.email },
      });

      if (existingProfile) {
        console.log(`Profile already exists for ${user.email}`);
        continue;
      }

      const profile = await userPrisma.userProfile.create({
        data: {
          authUserId: authCredential.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: "ACTIVE",
        },
      });

      console.log(`Created profile for ${user.email}`);
      console.log(`  Profile ID: ${profile.id}`);
      console.log(`  Role: ${profile.role}\n`);
    } catch (error) {
      console.error(`Error for ${user.email}: ${error.message}`);
    }
  }
}

main()
  .then(async () => {
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
    console.log("User profiles synced successfully!");
  })
  .catch(async (e) => {
    console.error("Error:", e);
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
    process.exit(1);
  });'

$syncScript | Out-File "temp-seed.js" -Encoding UTF8

Write-Host "Running user profile sync..."
node temp-seed.js

Remove-Item "temp-seed.js" -Force

Write-Host ""
Write-Host "Database setup completed successfully!"
Write-Host ""
Write-Host "Created Users:"
Write-Host "   1. admin@fire.com (ADMIN) - Password: Admin@123456"
Write-Host "   2. inspector1@fire.com (INSPECTOR) - Password: Inspector@123456"
Write-Host "   3. inspector2@fire.com (INSPECTOR) - Password: Inspector@123456"
