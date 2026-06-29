import { neon } from "@neondatabase/serverless";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin-http.mjs your@email.com");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const updated = await sql`UPDATE users SET role = 'ADMIN' WHERE email = ${email} RETURNING id, email, role`;

if (updated.length === 0) {
  console.error(`No user found with email: ${email}`);
  console.error("Make sure you have registered on the site first.");
} else {
  console.log("Success! User promoted to ADMIN:");
  console.log(updated[0]);
}
