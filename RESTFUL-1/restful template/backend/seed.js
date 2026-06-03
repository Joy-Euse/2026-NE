import bcrypt from "./services/auth-service/node_modules/bcryptjs/index.js";
import { PrismaClient as AuthPrismaClient } from "./services/auth-service/node_modules/@prisma/client/index.js";
import { PrismaClient as UserPrismaClient } from "./services/user-service/node_modules/@prisma/client/index.js";

const SALT_ROUNDS = 12;

const authPrisma = new AuthPrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL || "postgresql://postgres:user@localhost:5432/auth_db",
    },
  },
});

const userPrisma = new UserPrismaClient({
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

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

const upsertCredential = async (user) => {
  const existing = await authPrisma.userCredential.findUnique({
    where: { email: user.email },
  });

  if (existing) {
    await authPrisma.userCredential.update({
      where: { id: existing.id },
      data: {
        passwordHash: await hashPassword(user.password),
        status: "ACTIVE",
      },
    });
    return { ...existing, created: false };
  }

  const credential = await authPrisma.userCredential.create({
    data: {
      email: user.email,
      passwordHash: await hashPassword(user.password),
      status: "ACTIVE",
    },
  });

  return { ...credential, created: true };
};

const upsertProfile = async (user, authUserId) => {
  const existingByEmail = await userPrisma.userProfile.findUnique({
    where: { email: user.email },
  });

  if (existingByEmail) {
    const profile = await userPrisma.userProfile.update({
      where: { id: existingByEmail.id },
      data: {
        authUserId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: "ACTIVE",
      },
    });

    return { ...profile, created: false };
  }

  const profile = await userPrisma.userProfile.create({
    data: {
      authUserId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: "ACTIVE",
    },
  });

  return { ...profile, created: true };
};

async function main() {
  console.log("Starting database seed...\n");

  for (const user of users) {
    const credential = await upsertCredential(user);
    const profile = await upsertProfile(user, credential.id);

    console.log(`${credential.created ? "Created" : "Updated"} auth credential: ${user.email}`);
    console.log(`  Auth ID: ${credential.id}`);
    console.log(`${profile.created ? "Created" : "Updated"} user profile: ${profile.role}`);
    console.log(`  Profile ID: ${profile.id}`);
    console.log(`  Password: ${user.password}\n`);
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
  });
