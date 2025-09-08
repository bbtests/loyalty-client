"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { useGetUsersQuery } from "@/store/users"
import { useGetTransactionsQuery } from "@/store/transactions"
import { useGetLoyaltyPointsQuery } from "@/store/loyalty-points"
import { useGetBadgesQuery } from "@/store/badges"

// Mock analytics data
const monthlyData = [
  { month: "Jan", users: 1200, points: 45000, revenue: 12500 },
  { month: "Feb", users: 1350, points: 52000, revenue: 14200 },
  { month: "Mar", users: 1480, points: 58000, revenue: 15800 },
  { month: "Apr", users: 1620, points: 64000, revenue: 17500 },
  { month: "May", users: 1750, points: 71000, revenue: 19200 },
  { month: "Jun", users: 1890, points: 78000, revenue: 21000 },
]

const badgeData = [
  { name: "Bronze", value: 45, color: "#d97706" },
  { name: "Silver", value: 30, color: "#6b7280" },
  { name: "Gold", value: 20, color: "#f59e0b" },
  { name: "Platinum", value: 5, color: "#8b5cf6" },
]

export function AdminAnalytics() {
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery()
  const { data: transactionsResponse, isLoading: transactionsLoading } = useGetTransactionsQuery()
  const { data: loyaltyPointsResponse, isLoading: loyaltyPointsLoading } = useGetLoyaltyPointsQuery()
  const { data: badgesResponse, isLoading: badgesLoading } = useGetBadgesQuery()

  const loading = usersLoading || transactionsLoading || loyaltyPointsLoading || badgesLoading

  // Extract data from API responses
  const users = (usersResponse as any)?.data?.items || []
  const transactions = (transactionsResponse as any)?.data?.items || []
  const loyaltyPoints = (loyaltyPointsResponse as any)?.data?.items || []
  const badges = (badgesResponse as any)?.data?.items || []

  // Get pagination metadata for accurate counts
  const usersPagination = (usersResponse as any)?.meta?.pagination
  const transactionsPagination = (transactionsResponse as any)?.meta?.pagination
  const loyaltyPointsPagination = (loyaltyPointsResponse as any)?.meta?.pagination
  const badgesPagination = (badgesResponse as any)?.meta?.pagination

  // Calculate analytics data from real data using pagination totals
  const totalUsers = usersPagination?.total || users.length
  const totalRevenue = transactions.reduce((sum: number, transaction: any) => {
    const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  const totalPointsIssued = loyaltyPoints.reduce((sum: number, point: any) => {
    const earned = typeof point.total_earned === 'string' ? parseFloat(point.total_earned) : point.total_earned
    return sum + (isNaN(earned) ? 0 : earned)
  }, 0)
  const avgPointsPerUser = totalUsers > 0 ? Math.round(totalPointsIssued / totalUsers) : 0

  // Mock monthly data for charts (in real app, this would come from aggregated data)
  const monthlyData = [
    { month: "Jan", users: Math.floor(totalUsers * 0.8), points: Math.floor(totalPointsIssued * 0.7), revenue: Math.floor(totalRevenue * 0.6) },
    { month: "Feb", users: Math.floor(totalUsers * 0.85), points: Math.floor(totalPointsIssued * 0.75), revenue: Math.floor(totalRevenue * 0.65) },
    { month: "Mar", users: Math.floor(totalUsers * 0.9), points: Math.floor(totalPointsIssued * 0.8), revenue: Math.floor(totalRevenue * 0.7) },
    { month: "Apr", users: Math.floor(totalUsers * 0.95), points: Math.floor(totalPointsIssued * 0.85), revenue: Math.floor(totalRevenue * 0.75) },
    { month: "May", users: totalUsers, points: totalPointsIssued, revenue: totalRevenue },
    { month: "Jun", users: Math.floor(totalUsers * 1.05), points: Math.floor(totalPointsIssued * 1.1), revenue: Math.floor(totalRevenue * 1.05) },
  ]

  // Badge distribution based on actual badges
  const badgeData = badges.map((badge: any) => ({
    name: badge.name,
    value: Math.floor(Math.random() * 100), // Mock distribution
    color: badge.tier === 1 ? "#d97706" : badge.tier === 2 ? "#6b7280" : badge.tier === 3 ? "#f59e0b" : "#8b5cf6"
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Detailed insights into program performance</p>
        </div>
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
          Last 6 Months
        </Badge>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#0891b2" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Points Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Points Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="points" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Badge Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Badge Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={badgeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {badgeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">Avg. Points per User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{avgPointsPerUser.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">Achievement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">73%</div>
            <p className="text-xs text-muted-foreground">Users with achievements</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">89%</div>
            <p className="text-xs text-muted-foreground">30-day retention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
