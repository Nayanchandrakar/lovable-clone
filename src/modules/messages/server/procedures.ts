import { desc } from "drizzle-orm"
import z from "zod"
import { dbHttp } from "@/database"
import { message } from "@/database/schema"
import { inngest } from "@/inngest/client"
import { baseProcedure, createTRPCRouter } from "@/trpc/init"

export const messageRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const messages = await dbHttp
      .select()
      .from(message)
      .orderBy(desc(message.updatedAt))
    return messages
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Message is Required" }),
      }),
    )
    .mutation(async ({ input }) => {
      const createdMessage = await dbHttp
        .insert(message)
        .values({
          content: input.value,
          role: "USER",
          type: "RESULT",
        })
        .returning()

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
        },
      })

      return createdMessage
    }),
})
