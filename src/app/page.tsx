"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTRPC } from "@/trpc/client"

export default function HomePage() {
  const [value, setValue] = useState("")

  const trpc = useTRPC()
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions())
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message created")
      },
    }),
  )

  return (
    <div className="p-4 max-w-7xl  mx-auto">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={createMessage.isPending}
        onClick={() => createMessage.mutateAsync({ value })}
      >
        Invoke background job
      </Button>
      {JSON.stringify(messages, null, 3)}
    </div>
  )
}
