import { TRPCError } from "@trpc/server"
import { desc, eq } from "drizzle-orm"
import { generateSlug } from "random-word-slugs"
import z from "zod"
import { dbHttp, dbWs } from "@/database"
import { message, project } from "@/database/schema"
import { inngest } from "@/inngest/client"
import { baseProcedure, createTRPCRouter } from "@/trpc/init"

export const projectsRouer = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Id is required" }),
      }),
    )
    .query(async ({ input }) => {
      const [projects] = await dbHttp
        .select()
        .from(project)
        .where(eq(project.id, input.id))
        .orderBy(desc(project.updatedAt))

      if (!projects) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" })
      }
      return projects
    }),
  getMany: baseProcedure.query(async () => {
    const projects = await dbHttp
      .select()
      .from(project)
      .orderBy(desc(project.updatedAt))
    return projects
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Message is Required" })
          .max(10000, { message: "Prompt is too long." }),
      }),
    )
    .mutation(async ({ input }) => {
      console.log(input)
      const createdProject = await dbWs.transaction(async (tx) => {
        const [projectResult] = await tx
          .insert(project)
          .values({
            name: generateSlug(2, {
              format: "kebab",
            }),
          })
          .returning()

        const [messageResult] = await tx
          .insert(message)
          .values({
            projectId: projectResult?.id as string,
            content: input.value,
            role: "USER",
            type: "RESULT",
          })
          .returning()

        return { projectResult, messageResult }
      })

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createdProject?.projectResult?.id as string,
        },
      })

      return createdProject
    }),
})
