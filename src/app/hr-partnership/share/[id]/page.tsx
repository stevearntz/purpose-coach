interface Props {
  params: Promise<{ id: string }>
}

// Redirect from old HR Partnership share route to new People Leadership Needs share route
export default async function HRPartnershipShareRedirect({ params }: Props) {
  const { id } = await params
  const { redirect } = await import('next/navigation')
  redirect(`/people-leader-needs/share/${id}`)
}