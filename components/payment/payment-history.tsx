"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"

// Mock payment history data
const mockPaymentHistory = [
  {
    id: 1,
    type: "payment",
    amount: 125.5,
    status: "completed",
    reference: "pay_abc123",
    date: "2024-01-15T10:30:00Z",
    description: "Online Purchase",
  },
  {
    id: 2,
    type: "cashback",
    amount: 5.0,
    status: "completed",
    reference: "cb_def456",
    date: "2024-01-14T16:45:00Z",
    description: "Cashback Payment",
  },
  {
    id: 3,
    type: "payment",
    amount: 89.99,
    status: "completed",
    reference: "pay_ghi789",
    date: "2024-01-12T09:15:00Z",
    description: "In-store Purchase",
  },
  {
    id: 4,
    type: "cashback",
    amount: 2.5,
    status: "pending",
    reference: "cb_jkl012",
    date: "2024-01-11T14:20:00Z",
    description: "Cashback Request",
  },
]

export function PaymentHistory() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-4 h-4 text-primary" />
      case "cashback":
        return <DollarSign className="w-4 h-4 text-secondary" />
      default:
        return <CreditCard className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-card-foreground">Type</TableHead>
                <TableHead className="text-card-foreground">Description</TableHead>
                <TableHead className="text-card-foreground">Amount</TableHead>
                <TableHead className="text-card-foreground">Status</TableHead>
                <TableHead className="text-card-foreground">Date</TableHead>
                <TableHead className="text-card-foreground">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPaymentHistory.map((payment) => (
                <TableRow key={payment.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(payment.type)}
                      <span className="capitalize text-foreground">{payment.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-foreground">{payment.description}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {payment.type === "cashback" ? "+" : ""}${payment.amount.toFixed(2)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      {getStatusBadge(payment.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleTimeString()}</p>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {payment.reference}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
