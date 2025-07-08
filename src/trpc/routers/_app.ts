import { messageRouter } from "@/modules/messages/server/procedures"
import { createTRPCRouter } from "@/trpc/init"

export const appRouter = createTRPCRouter({
  messages: messageRouter,
})

export type AppRouter = typeof appRouter
