import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const serverEnv = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    DATABASE_URL: z.string({
      required_error: "DATABASE_URL is required in environment variables",
    }),

    OPEN_API_KEY: z.string({
      required_error: "OPEN_API_KEY is required in environment variables",
    }),
  },
  experimental__runtimeEnv: process.env,
})
