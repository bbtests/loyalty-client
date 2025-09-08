"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, BarChart3, Settings, LogOut } from "lucide-react"
import { AdminOverview } from "@/components/admin/admin-overview"
import { UserManagement } from "@/components/admin/user-management"
import { AdminAnalytics } from "@/components/admin/admin-analytics"
import { AdminSettings } from "@/components/admin/admin-settings"

export function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    
    if (!session) {
      router.push("/auth/login")
      return
    }

    // Check if user has admin role
    const user = session.user as any
    const hasAdminRole = user?.roles?.some((role: any) => 
      role.name === "super admin" || role.name === "admin"
    )
    
    if (!hasAdminRole) {
      router.push("/")
      return
    }
  }, [session, status, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Loyalty Program Admin</h1>
              <p className="text-muted-foreground">Manage customers and program performance</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-border text-card-foreground hover:bg-muted bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card border-border">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-card-foreground">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 text-card-foreground">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-card-foreground">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-card-foreground">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
