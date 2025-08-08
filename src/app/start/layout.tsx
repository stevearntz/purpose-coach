import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome to Campfire | Leadership & Team Development Platform',
  description: 'Get started with Campfire - your personal leadership and team development platform. Access evidence-based tools, guided workshops, and personalized recommendations.',
  openGraph: {
    title: 'Welcome to Campfire',
    description: 'Your personal leadership and team development platform is ready. Let\'s build stronger teams and better leaders, together.',
    url: 'https://tools.getcampfire.com/start',
    siteName: 'Campfire',
    images: [
      {
        url: '/og-campfire-welcome.png',
        width: 1200,
        height: 630,
        alt: 'Welcome to Campfire'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Welcome to Campfire',
    description: 'Your personal leadership and team development platform is ready.',
    images: ['/og-campfire-welcome.png'],
  }
};

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}