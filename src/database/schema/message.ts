import { createId } from "@paralleldrive/cuid2"
import { pgTable, text } from "drizzle-orm/pg-core"
import {
  dateCreation,
  messageRoleEnum,
  messageTypeEnum,
} from "@/database/utils"
import { project } from "./projects"

export const message = pgTable("message", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  content: text(),
  role: messageRoleEnum(),
  type: messageTypeEnum(),
  projectId: text()
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  ...dateCreation,
})

export { messageRoleEnum, messageTypeEnum }
