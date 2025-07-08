import { createId } from "@paralleldrive/cuid2"
import { pgTable, text } from "drizzle-orm/pg-core"
import { dateCreation } from "@/database/utils"

export const project = pgTable("project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text(),
  ...dateCreation,
})
