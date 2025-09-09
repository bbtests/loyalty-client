import { Suspense } from "react"
import { LoyaltyDashboard } from "@/components/loyalty-dashboard"

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <LoyaltyDashboard />
      </Suspense>
    </main>
  )
}
