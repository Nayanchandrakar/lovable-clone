"use client"

import { Suspense, useState } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { FragmentWeb } from "@/modules/projects/ui/components/fragment-web"
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container"
import { ProjectHeader } from "@/modules/projects/ui/components/project-header"
import type { Fragment } from "@/types"

type Props = {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<div>Loading project</div>}>
            <ProjectHeader projectId={projectId!} />
          </Suspense>
          <Suspense fallback={<div>Loading messages....</div>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50}>
          {!!activeFragment && <FragmentWeb data={activeFragment} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
