"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Gift, TrendingUp } from "lucide-react"

// Mock transaction data - in real app, this would come from API
const mockTransactions = [
  {
    id: 1,
    type: "purchase",
    amount: 125.5,
    points_earned: 1255,
    date: "2024-01-15",
    description: "Online Purchase #12345",
  },
  {
    id: 2,
    type: "redemption",
    amount: 0,
    points_earned: -500,
    date: "2024-01-10",
    description: "Redeemed for $5 discount",
  },
  {
    id: 3,
    type: "purchase",
    amount: 89.99,
    points_earned: 900,
    date: "2024-01-08",
    description: "In-store Purchase",
  },
  {
    id: 4,
    type: "bonus",
    amount: 0,
    points_earned: 200,
    date: "2024-01-05",
    description: "Birthday Bonus Points",
  },
]

export function TransactionHistory() {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingBag className="w-5 h-5 text-primary" />
      case "redemption":
        return <Gift className="w-5 h-5 text-secondary" />
      case "bonus":
        return <TrendingUp className="w-5 h-5 text-accent" />
      default:
        return <ShoppingBag className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return (
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Purchase
          </Badge>
        )
      case "redemption":
        return (
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            Redemption
          </Badge>
        )
      case "bonus":
        return (
          <Badge variant="outline" className="border-accent text-accent">
            Bonus
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          {mockTransactions.length} Transactions
        </Badge>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background border border-border"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{getTransactionIcon(transaction.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {transaction.amount > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">${transaction.amount.toFixed(2)}</p>
                    </div>
                  )}

                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${transaction.points_earned >= 0 ? "text-primary" : "text-secondary"}`}
                    >
                      {transaction.points_earned >= 0 ? "+" : ""}
                      {transaction.points_earned} pts
                    </p>
                  </div>

                  <div className="flex-shrink-0">{getTransactionBadge(transaction.type)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
