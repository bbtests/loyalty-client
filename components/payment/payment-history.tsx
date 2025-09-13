"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Banknote, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useGetUserCashbackPaymentsQuery } from "@/store/loyalty"

export function PaymentHistory() {
  const { data: session } = useSession()
  const userId = parseInt(session?.user?.id || "0")
  
  const { 
    data: paymentsResponse, 
    isLoading, 
    error 
  } = useGetUserCashbackPaymentsQuery(userId, {
    skip: !session?.user?.id,
  })

  const cashbackPayments = paymentsResponse?.data || []
  const pagination = paymentsResponse?.pagination

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
        return <Banknote className="w-4 h-4 text-secondary" />
      default:
        return <CreditCard className="w-4 h-4 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Failed to load payment history
          </div>
        </CardContent>
      </Card>
    )
  }

  const paymentList = cashbackPayments

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {paymentList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payment history found. Request cashback to see your payment history.
          </div>
        ) : (
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
                {paymentList.map((payment) => (
                  <TableRow key={payment.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon('cashback')}
                        <span className="capitalize text-foreground">Cashback</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">Cashback Payment</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        +₦{parseFloat(payment.amount).toFixed(2)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{new Date(payment.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleTimeString()}</p>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                        {payment.provider_transaction_id || 'N/A'}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
