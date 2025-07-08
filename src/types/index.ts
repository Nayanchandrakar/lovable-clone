import type { Casing } from "drizzle-orm"
import type { NeonHttpDatabase } from "drizzle-orm/neon-http"
import type { NeonDatabase } from "drizzle-orm/neon-serverless"
import type { fragment } from "@/database/schema"
import type { messageRole, messageType } from "@/database/utils"

export type HttpConnectionType = NeonHttpDatabase
export type WsConnectionType = NeonDatabase
export type MessageRole = (typeof messageRole)[number]
export type MessageType = (typeof messageType)[number]
export type Fragment = typeof fragment.$inferSelect

export type ConfigOptions = {
  connectionString: string
  case: Casing
}
