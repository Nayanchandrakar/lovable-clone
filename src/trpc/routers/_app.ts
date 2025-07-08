import { messageRouter } from "@/modules/messages/server/procedures"
import { projectsRouer } from "@/modules/projects/server/procedures"
import { createTRPCRouter } from "@/trpc/init"

export const appRouter = createTRPCRouter({
  messages: messageRouter,
  projects: projectsRouer,
})

export type AppRouter = typeof appRouter
