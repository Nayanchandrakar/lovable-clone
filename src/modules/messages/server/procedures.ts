import { TRPCError } from "@trpc/server"
import { and, asc, eq } from "drizzle-orm"
import z from "zod"
import { dbHttp } from "@/database"
import { fragment, message, project } from "@/database/schema"
import { inngest } from "@/inngest/client"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const messageRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "ProjectId is required" }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const messages = await dbHttp
        .select({
          id: message.id,
          content: message.content,
          role: message.role,
          projectId: message.projectId,
          createdAt: message.createdAt,
          type: message.type,
          updatedAt: message.updatedAt,
          fragment: fragment,
        })
        .from(message)
        .leftJoin(project, eq(message.projectId, project.id))
        .leftJoin(fragment, eq(message.id, fragment.messageId))
        .where(
          and(
            eq(message.projectId, input.projectId),
            eq(project.userId, ctx.auth.userId),
          ),
        )
        .orderBy(asc(message.updatedAt))
      return messages
    }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Message is Required" })
          .max(10000, { message: "Value is too long." }),
        projectId: z.string().min(1, { message: "projectId is required" }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await dbHttp
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.userId, ctx.auth.userId),
          ),
        )

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        })
      }

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
