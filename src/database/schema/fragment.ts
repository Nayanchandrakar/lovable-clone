import { createId } from "@paralleldrive/cuid2"
import { json, pgTable, text } from "drizzle-orm/pg-core"
import { message } from "@/database/schema/message"
import { dateCreation } from "@/database/utils"

export const fragment = pgTable("fragment", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  messageId: text()
    .unique()
    .references(() => message.id, { onDelete: "cascade" }),
  sandboxUrl: text(),
  title: text(),
  files: json(),
  ...dateCreation,
})
