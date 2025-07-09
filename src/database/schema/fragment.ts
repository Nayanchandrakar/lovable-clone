import { createId } from "@paralleldrive/cuid2"
import { json, pgTable, text } from "drizzle-orm/pg-core"
import { message } from "@/database/schema/message"
import { dateCreation } from "@/database/utils"

export const fragment = pgTable("fragment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  messageId: text("message_id")
    .notNull()
    .unique()
    .references(() => message.id, { onDelete: "cascade" }),
  sandboxUrl: text("sandbox_url").notNull(),
  title: text("title").notNull(),
  files: json("files").notNull(),
  ...dateCreation,
})
