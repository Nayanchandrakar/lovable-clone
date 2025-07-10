import { getUsageStatus } from "@/lib/usage"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const usageRouter = createTRPCRouter({
  status: protectedProcedure.query(async () => {
    const result = await getUsageStatus()
    return result
  }),
})
