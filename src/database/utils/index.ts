import { pgEnum, timestamp } from "drizzle-orm/pg-core"

export const dateCreation = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const messageRole = ["USER", "ASSISTANT"] as const
export const messageType = ["RESULT", "ERROR"] as const

export const messageRoleEnum = pgEnum("role", messageRole)
export const messageTypeEnum = pgEnum("result", messageType)
