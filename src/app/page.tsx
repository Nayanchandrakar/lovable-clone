"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTRPC } from "@/trpc/client"

export default function HomePage() {
  const [value, setValue] = useState("")
  const router = useRouter()

  const trpc = useTRPC()
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message)
      },
      onSuccess: (data) => {
        router.push(`/project/${data.projectResult?.id}`)
      },
    }),
  )

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col gap-3">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button
          disabled={createProject.isPending}
          onClick={() => createProject.mutateAsync({ value })}
        >
          create a project
        </Button>
      </div>
    </div>
  )
}
