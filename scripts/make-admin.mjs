// Run with: node scripts/make-admin.mjs your@email.com
import pg from "pg";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin.mjs your@email.com");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const res = await client.query(
  `UPDATE users SET role = 'ADMIN' WHERE email = $1 RETURNING id, email, role`,
  [email]
);

if (res.rowCount === 0) {
  console.error(`No user found with email: ${email}`);
  console.error("Register at /register first, then run this script.");
} else {
  console.log("Done:", res.rows[0]);
}

await client.end();
