import { asc, eq } from "drizzle-orm"
import z from "zod"
import { dbHttp } from "@/database"
import { fragment, message } from "@/database/schema"
import { inngest } from "@/inngest/client"
import { baseProcedure, createTRPCRouter } from "@/trpc/init"

export const messageRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "ProjectId is required" }),
      }),
    )
    .query(async ({ input }) => {
      const messages = await dbHttp
        .select({
          id: message.id,
          content: message.content,
          role: message.role,
          type: message.type,
          projectId: message.projectId,
          createdAt: message.createdAt,
          fragment: fragment,
        })
        .from(message)
        .leftJoin(fragment, eq(message.id, fragment.messageId))
        .where(eq(message.projectId, input.projectId))
        .orderBy(asc(message.updatedAt))
      return messages
    }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Message is Required" })
          .max(10000, { message: "Value is too long." }),
        projectId: z.string().min(1, { message: "projectId is required" }),
      }),
    )
    .mutation(async ({ input }) => {
      const [createdMessage] = await dbHttp
        .insert(message)
        .values({
          projectId: input.projectId,
          content: input.value,
          role: "USER",
          type: "RESULT",
        })
        .returning()

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      })

      return createdMessage
    }),
})
