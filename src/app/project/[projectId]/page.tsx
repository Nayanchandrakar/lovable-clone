type pageProps = {
  params: Promise<{ projectId: string }>
}

const ProjectPage = async ({ params }: pageProps) => {
  const { projectId } = await params
  return <div>Project Id: {projectId}</div>
}

export default ProjectPage
