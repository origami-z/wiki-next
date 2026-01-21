/**
 * Admin Layout
 * Wraps admin pages with the AdminLayout component
 * Only accessible in development mode
 */

import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Check if admin mode is enabled
  if (process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  return <AdminLayout>{children}</AdminLayout>;
}
