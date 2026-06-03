#!/bin/bash

# Fire Extinguisher Management System - User Setup Script
# This script seeds the auth and user databases with admin and inspector users

set -e

echo "🔥 Fire Extinguisher Management System - Database Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
AUTH_SERVICE_DIR="./services/auth-service"
USER_SERVICE_DIR="./services/user-service"

# Check if we're in the backend directory
if [ ! -d "$AUTH_SERVICE_DIR" ]; then
    echo -e "${RED}❌ Error: Must run this script from the backend directory${NC}"
    echo "Usage: cd backend && bash setup-users.sh"
    exit 1
fi

echo -e "${YELLOW}Step 1: Seeding Auth Service Database...${NC}"
echo ""

cd "$AUTH_SERVICE_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run auth seed
npm run seed

echo ""
echo -e "${YELLOW}Step 2: Seeding User Service Database...${NC}"
echo ""

cd "../../$USER_SERVICE_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Get the auth credentials from auth DB and seed user DB
# For now, we'll run the user seed which creates profiles

# We need to get the authUserIds from the auth database
# Create a temporary script to do this

cat > temp-seed.js << 'EOF'
import { PrismaClient } from "@prisma/client";

const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:user@localhost:5432/auth_db",
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
  console.log("🌱 Syncing user profiles with auth credentials...\n");

  for (const user of userData) {
    try {
      // Get authUserId from auth DB
      const authCredential = await authPrisma.userCredential.findUnique({
        where: { email: user.email },
      });

      if (!authCredential) {
        console.log(`⚠️  Auth credential not found for ${user.email}, skipping...`);
        continue;
      }

      // Check if profile already exists
      const existingProfile = await userPrisma.userProfile.findUnique({
        where: { email: user.email },
      });

      if (existingProfile) {
        console.log(`✓ Profile already exists for ${user.email}`);
        continue;
      }

      // Create profile in user DB
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

      console.log(`✓ Created profile for ${user.email}`);
      console.log(`  Profile ID: ${profile.id}`);
      console.log(`  Auth ID: ${authCredential.id}`);
      console.log(`  Role: ${profile.role}\n`);
    } catch (error) {
      console.error(`✗ Error for ${user.email}: ${error.message}`);
    }
  }
}

main()
  .then(async () => {
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
    console.log("✅ User profiles synced successfully!");
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
    process.exit(1);
  });
EOF

# Run the sync script
node temp-seed.js
rm temp-seed.js

echo ""
echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
echo ""
echo "📝 Created Users:"
echo "   1. admin@fire.com (ADMIN) - Password: Admin@123456"
echo "   2. inspector1@fire.com (INSPECTOR) - Password: Inspector@123456"
echo "   3. inspector2@fire.com (INSPECTOR) - Password: Inspector@123456"
echo ""
echo "🚀 Next steps:"
echo "   1. Ensure all services are running"
echo "   2. Login to http://localhost:5175 with admin@fire.com"
echo "   3. Create additional users as needed"
echo ""
