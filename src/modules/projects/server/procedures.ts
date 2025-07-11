import { TRPCError } from "@trpc/server"
import { generateSlug } from "random-word-slugs"
import z from "zod"
import { inngest } from "@/inngest/client"
import { prisma } from "@/lib/db"
import { consumeCredits } from "@/lib/usage"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const projectsRouer = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Id is required" }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const projects = await prisma.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      })

      if (!projects) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" })
      }
      return projects
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
    return projects
  }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Message is Required" })
          .max(10000, { message: "Prompt is too long." }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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

      const query = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: "kebab",
          }),
          userId: ctx.auth.userId,
          Message: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      })

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: query?.id,
        },
      })

      return query
    }),
})
