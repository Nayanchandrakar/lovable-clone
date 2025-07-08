import { createId } from "@paralleldrive/cuid2"
import { pgTable, text } from "drizzle-orm/pg-core"
import {
  dateCreation,
  messageRoleEnum,
  messageTypeEnum,
} from "@/database/utils"
import { project } from "./projects"

export const message = pgTable("message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  content: text("content"),
  role: messageRoleEnum("role"),
  type: messageTypeEnum("type"),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  ...dateCreation,
})

export { messageRoleEnum, messageTypeEnum }
