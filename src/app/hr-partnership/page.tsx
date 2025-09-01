import { redirect } from 'next/navigation'

// Redirect from old HR Partnership route to new People Leadership Needs route
export default function HRPartnershipRedirect() {
  redirect('/people-leader-needs')
}