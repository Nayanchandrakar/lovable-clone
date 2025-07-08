import { drizzle } from "drizzle-orm/neon-http"
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless"
import { serverEnv } from "@/lib/env/server"
import type {
  ConfigOptions,
  HttpConnectionType,
  WsConnectionType,
} from "@/types"

class Database {
  private static instance: Database | null = null
  private httpConnection: HttpConnectionType | null = null
  private wsConnection: WsConnectionType | null = null
  private config: ConfigOptions

  private constructor() {
    this.config = {
      connectionString: serverEnv.DATABASE_URL,
      case: "snake_case",
    }
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
      return Database.instance
    }
    return Database.instance
  }

  getHttpConnection() {
    if (!this.httpConnection) {
      this.httpConnection = drizzle({
        connection: this.config.connectionString,
        casing: this.config.case,
      })
    }

    return this.httpConnection
  }

  getWsConnection() {
    if (!this.wsConnection) {
      this.wsConnection = drizzleWs({
        connection: this.config.connectionString,
        casing: this.config.case,
      })
    }

    return this.wsConnection
  }
}

const database = Database.getInstance()
export const dbHttp = database.getHttpConnection()
export const dbWs = database.getWsConnection()
