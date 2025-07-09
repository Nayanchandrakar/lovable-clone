import { Suspense } from "react"
import { ProjectView } from "@/modules/projects/ui/views/project-view"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"

type pageProps = {
  params: Promise<{ projectId: string }>
}

const ProjectPage = async ({ params }: pageProps) => {
  const { projectId } = await params

  void prefetch(trpc.messages.getMany.queryOptions({ projectId }))
  void prefetch(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    }),
  )

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading.....</div>}>
        <ProjectView projectId={projectId} />
      </Suspense>
    </HydrateClient>
  )
}

export default ProjectPage
