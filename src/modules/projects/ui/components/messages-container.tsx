"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { MessageCard } from "@/modules/projects/ui/components/message-card"
import { MessageForm } from "@/modules/projects/ui/components/message-form"
import { MessageLoading } from "@/modules/projects/ui/components/message-loading"
import { useTRPC } from "@/trpc/client"
import type { Fragment } from "@/types"

type Props = {
  projectId: string
  activeFragment: Fragment | null
  setActiveFragment: (fragment: Fragment | null) => void
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) => {
  const trpc = useTRPC()
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastAssitantMessageIdRef = useRef<string | null>(null)

  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      { projectId },
      {
        refetchInterval: 5000,
      },
    ),
  )

  useEffect(() => {
    const lastAssitantMessage = messages.findLast((message) => {
      message.role === "ASSISTANT"
    })

    if (
      lastAssitantMessage?.fragment &&
      lastAssitantMessage.id !== lastAssitantMessage.content
    ) {
      setActiveFragment(lastAssitantMessage.fragment)
      lastAssitantMessageIdRef.current = lastAssitantMessage.id
    }
  }, [messages, setActiveFragment])

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [])

  const lasMessage = messages[messages.length - 1]
  const isLastMessageUser = lasMessage?.role === "USER"

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content!}
              role={message.role!}
              fragment={message.fragment!}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message.fragment?.id}
              onFragmentClick={() => setActiveFragment(message.fragment)}
              type={message.type!}
            />
          ))}
          {isLastMessageUser && <MessageLoading />}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  )
}
