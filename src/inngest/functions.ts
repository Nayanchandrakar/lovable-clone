import Sandbox from "@e2b/code-interpreter"
import {
  createAgent,
  createNetwork,
  createTool,
  gemini,
  type Tool,
} from "@inngest/agent-kit"
import z from "zod"
import { PROMPT } from "@/constants/prompt"
import { dbHttp, dbWs } from "@/database"
import { fragment, message } from "@/database/schema"
import { inngest } from "./client"
import { getSandbox, lastAssitantTextMessageContent } from "./utils"

type AgentState = {
  summary: string
  files: {
    [path: string]: string
  }
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-coder-template")
      return sandbox.sandboxId
    })

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      system: PROMPT,
      description: "an expert coding agent",
      model: gemini({
        model: "gemini-2.5-flash",
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run command",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" }

              try {
                const sandbox = await getSandbox(sandboxId)
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data
                  },
                })
                return result.stdout
              } catch (error) {
                console.log(
                  `Command Failed: ${error}\nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`,
                )
                return `Command Failed: ${error}\nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`
              }
            })
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>,
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {}
                  const sandbox = await getSandbox(sandboxId)
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content)
                    updatedFiles[file.path] = file.content
                  }
                  return updatedFiles
                } catch (error) {
                  return `Error: ${error}`
                }
              },
            )

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles
            }
          },
        }),

        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId)
                const contents: { path: string; content: string }[] = []

                for (const file of files) {
                  const content = await sandbox.files.read(file)
                  contents.push({ path: file, content })
                }

                return JSON.stringify(contents)
              } catch (error) {
                return `Error: ${error}`
              }
            })
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssitantMessageText = lastAssitantTextMessageContent(result)

          if (lastAssitantMessageText && network) {
            if (lastAssitantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssitantMessageText
            }
          }

          return result
        },
      },
    })

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary
        if (summary) return

        return codeAgent
      },
    })

    const result = await network.run(event.data.value)
    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `https://${host}`
    })

    await step.run("save-result", async () => {
      if (isError) {
        const [createdMessage] = await dbHttp
          .insert(message)
          .values({
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again",
            role: "ASSISTANT",
            type: "ERROR",
          })
          .returning()

        return createdMessage
      }

      const res = await dbWs.transaction(async (tx) => {
        const [createdMessage] = await tx
          .insert(message)
          .values({
            projectId: event.data.projectId,
            content: result.state.data.summary,
            role: "ASSISTANT",
            type: "RESULT",
          })
          .returning()

        const [createdFragment] = await tx
          .insert(fragment)
          .values({
            sandboxUrl,
            title: "Fragment",
            files: result.state.data.files,
          })
          .returning()

        return { createdMessage, createdFragment }
      })

      return res
    })

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    }
  },
)
