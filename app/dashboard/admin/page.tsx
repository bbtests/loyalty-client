import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <AdminDashboard />
    </main>
  )
}


