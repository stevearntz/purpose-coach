import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim Your Account | Campfire',
  description: 'Create your Campfire account and start your leadership development journey.',
};

export default function ClaimAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}