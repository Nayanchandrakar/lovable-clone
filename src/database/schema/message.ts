import { createId } from "@paralleldrive/cuid2"
import { pgTable, text } from "drizzle-orm/pg-core"
import {
  dateCreation,
  messageRoleEnum,
  messageTypeEnum,
} from "@/database/utils"

export const message = pgTable("message", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  content: text(),
  role: messageRoleEnum(),
  type: messageTypeEnum(),
  ...dateCreation,
})

export { messageRoleEnum, messageTypeEnum }
