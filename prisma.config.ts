import path from "path";
import { defineConfig } from "prisma/config";

// Next.js loads .env.local automatically at runtime, but the Prisma CLI does not.
// This loads it explicitly so pnpm prisma commands can read DATABASE_URL.
if (typeof (process as NodeJS.Process & { loadEnvFile?: (path: string) => void }).loadEnvFile === "function") {
  try {
    (process as NodeJS.Process & { loadEnvFile: (path: string) => void }).loadEnvFile(
      path.join(import.meta.dirname, ".env.local")
    );
  } catch {
    // .env.local not found — fall back to environment
  }
}

export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma/schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
