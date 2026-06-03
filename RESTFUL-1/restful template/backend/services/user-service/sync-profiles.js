import pg from "pg";

const { Client } = pg;

const authClient = new Client("postgresql://postgres:user@localhost:5432/auth_db");
const userClient = new Client("postgresql://postgres:user@localhost:5432/user_db");

const users = [
  { email: "admin@fire.com", firstName: "System", lastName: "Administrator", role: "ADMIN" },
  { email: "inspector1@fire.com", firstName: "John", lastName: "Inspector", role: "INSPECTOR" },
  { email: "inspector2@fire.com", firstName: "Jane", lastName: "Inspector", role: "INSPECTOR" },
];

async function main() {
  try {
    console.log("Connecting to databases...");
    await authClient.connect();
    await userClient.connect();

    console.log("Syncing user profiles...\n");

    for (const user of users) {
      try {
        // Get authUserId from auth DB
        const authRes = await authClient.query('SELECT id FROM "UserCredential" WHERE email = $1', [
          user.email,
        ]);

        if (authRes.rows.length === 0) {
          console.log(`✗ Auth credential not found for ${user.email}`);
          continue;
        }

        const authUserId = authRes.rows[0].id;

        // Check if profile already exists
        const existingProfile = await userClient.query('SELECT id FROM "UserProfile" WHERE email = $1', [
          user.email,
        ]);

        if (existingProfile.rows.length > 0) {
          console.log(`✓ Profile already exists for ${user.email}`);
          continue;
        }

        // Create profile
        const profileId = crypto.randomUUID ? crypto.randomUUID() : require("crypto").randomUUID();
        await userClient.query(
          `INSERT INTO "UserProfile" (id, "authUserId", "firstName", "lastName", email, role, status, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())`,
          [profileId, authUserId, user.firstName, user.lastName, user.email, user.role, "ACTIVE"]
        );

        console.log(`✓ Created profile for ${user.email}`);
        console.log(`  Profile ID: ${profileId}`);
        console.log(`  Auth ID: ${authUserId}`);
        console.log(`  Role: ${user.role}\n`);
      } catch (error) {
        console.error(`✗ Error for ${user.email}: ${error.message}\n`);
      }
    }

    console.log("✅ User profiles synced successfully!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await authClient.end();
    await userClient.end();
  }
}

main();
