import { sql } from "drizzle-orm"
import { dbHttp } from "@/database"

const resetDatabase = async () => {
  try {
    const typesResult = await dbHttp.execute<{ typname: string }>(sql`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `)
    for (const type of typesResult.rows || []) {
      await dbHttp.execute(
        sql`DROP TYPE IF EXISTS "${sql.raw(type.typname)}" CASCADE;`,
      )
      console.log(`Dropped type: ${type.typname}`)
    }

    const tablesResult = await dbHttp.execute<{ table_name: string }>(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `)

    for (const table of tablesResult.rows || []) {
      await dbHttp.execute(
        sql`DROP TABLE IF EXISTS "${sql.raw(table.table_name)}" CASCADE;`,
      )
      console.log(`Dropped table: ${table.table_name}`)
    }

    console.log("Database reset successfully: all tables and types dropped")
  } catch (error) {
    console.error("Error resetting database:", error)
    throw error
  }
}

resetDatabase().catch(console.error)
