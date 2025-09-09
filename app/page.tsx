"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, CreditCard, Gift, LogOut } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isAuthenticated = status === "authenticated" && session?.user
  const user = session?.user as any
  const hasAdminRole = user?.roles?.some((role: any) => 
    role.name === "super admin" || role.name === "admin"
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Logo size="md" />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Welcome to Bumpa</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                {isAuthenticated ? `Welcome back, ${user?.name || user?.email}!` : "Your loyalty rewards platform"}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link href={hasAdminRole ? "/dashboard/admin" : "/dashboard"}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto cursor-pointer">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="outline"
                  className="border-border text-card-foreground hover:bg-muted bg-transparent w-full sm:w-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto cursor-pointer">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {isAuthenticated ? (
            /* Authenticated user content */
            <div className="text-center space-y-4 py-12">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Welcome Back!</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Access your personalized dashboard to track your loyalty points, view achievements, and manage your account.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={hasAdminRole ? "/dashboard/admin" : "/dashboard"}>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Unauthenticated user content */
            <div className="text-center space-y-4 py-12">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Welcome to Bumpa</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Sign in to access your personalized loyalty dashboard, track your points, view achievements, and make payments.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
              </div>
            </div>
          )}
          
          {/* Feature preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Make Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Process payments and earn loyalty points automatically with our secure payment system.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Track Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Unlock achievements and badges as you reach milestones in your loyalty journey.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">Earn Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Accumulate points and redeem them for cashback and exclusive rewards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}