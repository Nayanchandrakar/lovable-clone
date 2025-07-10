import { auth } from "@clerk/nextjs/server"
import { RateLimiterPostgres } from "rate-limiter-flexible"

const FREE_POINTS = 5
const DURATION = 30 * 24 * 60 * 60
const GENERATION_COST = 1
const PRO_POINTS = 100

export async function getUsageTracker() {
  const { has } = await auth()
  const hasProAccess = has({ plan: "pro" })

  const usageTracker = new RateLimiterPostgres({
    storeClient: () => {},
    tableName: "usage",
    points: hasProAccess ? PRO_POINTS : FREE_POINTS,
    duration: DURATION,
  })

  return usageTracker
}

export async function consumeCredits() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const usageTracker = await getUsageTracker()
  const result = await usageTracker.consume(userId, GENERATION_COST)
  return result
}

export async function getUsageStatus() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const usageTracker = await getUsageTracker()
  const result = await usageTracker.get(userId)
  return result
}
