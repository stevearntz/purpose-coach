import { redirect } from 'next/navigation'

// Redirect from old HR Partnership results route to new People Leadership Needs results route
export default function HRPartnershipResultsRedirect() {
  redirect('/people-leader-needs/results')
}