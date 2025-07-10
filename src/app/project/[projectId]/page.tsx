import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
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
      <ErrorBoundary fallback={<p>Error...</p>}>
        <Suspense fallback={<div>Loading.....</div>}>
          <ProjectView projectId={projectId} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
}

export default ProjectPage
