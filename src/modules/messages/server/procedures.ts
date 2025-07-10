import { TRPCError } from "@trpc/server"
import z from "zod"
import { inngest } from "@/inngest/client"
import { prisma } from "@/lib/db"
import { consumeCredits } from "@/lib/usage"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const messageRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "ProjectId is required" }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          Project: {
            userId: ctx.auth.userId,
          },
        },
        orderBy: {
          updatedAt: "asc",
        },
        include: {
          Fragment: true,
        },
      })
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
      const existingProject = await prisma.project.findFirst({
        where: {
          userId: ctx.auth.userId,
          id: input.projectId,
        },
      })

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        })
      }

      try {
        await consumeCredits()
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Somthing went wrong",
          })
        }

        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have run out of credits",
        })
      }

      const createdMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: "USER",
          type: "RESULT",
        },
      })

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
