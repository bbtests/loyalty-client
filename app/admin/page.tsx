import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <main className="min-h-screen admin-theme bg-background">
      <AdminDashboard />
    </main>
  )
}
