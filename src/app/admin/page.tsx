'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminAuthGuard from '@/components/auth/AdminAuthGuard';

export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AdminAuthGuard>
  );
}