import { defineConfig } from "drizzle-kit"
import { serverEnv } from "@/lib/env/server"

export default defineConfig({
  out: "./src/database/drizzle",
  schema: "./src/database/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
})
