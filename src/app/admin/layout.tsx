'use client';

import { ToastProvider } from '@/hooks/useToast';

// Note: Metadata must be in a server component, so we'll handle that differently
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}