import Sandbox from "@e2b/code-interpreter"
import type { AgentResult, Message, TextMessage } from "@inngest/agent-kit"
import { SANDBOX_TIMEOUT } from "."

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId)
  await sandbox.setTimeout(SANDBOX_TIMEOUT)
  return sandbox
}

export function lastAssitantTextMessageContent(result: AgentResult) {
  const lastAssitantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant",
  )

  const message = result.output[lastAssitantTextMessageIndex] as
    | TextMessage
    | undefined

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined
}

export function parseAgentOutput(value: Message[]) {
  const output = value[0]

  if (output?.type !== "text") {
    return "Fragment"
  }

  if (Array.isArray(output.content)) {
    return output.content.map((txt) => txt).join("")
  }

  return output.content
}
