"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Gift, TrendingUp, Loader2, ChevronLeft, ChevronRight, Banknote } from "lucide-react"
import { useSession } from "next-auth/react"
import { useGetUserTransactionsQuery } from "@/store/loyalty"
import { CashbackRequestModal } from "@/components/cashback-request-modal"
import type { TransactionData } from "@/types/api"

export function TransactionHistory() {
  const { data: session } = useSession()
  const userId = parseInt(session?.user?.id || "0")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | undefined>()
  const [isCashbackModalOpen, setIsCashbackModalOpen] = useState(false)
  
  const { 
    data: transactionsResponse, 
    isLoading, 
    error 
  } = useGetUserTransactionsQuery({ userId, page: currentPage }, {
    skip: !session?.user?.id,
  })

  const transactions = transactionsResponse?.data || []
  const pagination = transactionsResponse?.pagination

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

  const isEligibleForCashback = (transaction: TransactionData): boolean => {
    // Only purchase transactions are eligible for cashback
    if (transaction.transaction_type !== 'purchase') return false
    
    // Must have a valid amount
    if (!transaction.amount || parseFloat(transaction.amount) <= 0) return false
    
    // Must be completed status
    if (transaction.status !== 'completed') return false
    
    // Must be within last 30 days
    const transactionDate = new Date(transaction.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return transactionDate >= thirtyDaysAgo
  }

  const handleRequestCashback = (transaction: TransactionData) => {
    setSelectedTransaction(transaction)
    setIsCashbackModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
          <Badge variant="destructive">Error</Badge>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              Failed to load transaction history
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const transactionList = transactions

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found. Make a purchase to see your transaction history.
            </div>
          ) : (
            <div className="space-y-4">
              {transactionList.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background border border-border"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">{getTransactionIcon(transaction.transaction_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {transaction.transaction_type === 'purchase' ? 'Purchase' : 
                         transaction.transaction_type === 'redemption' ? 'Points Redemption' :
                         transaction.transaction_type === 'bonus' ? 'Bonus Points' :
                         transaction.transaction_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {transaction.amount && parseFloat(transaction.amount) > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          ₦{parseFloat(transaction.amount).toFixed(2)}
                        </p>
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

                    <div className="flex items-center space-x-2">
                      {isEligibleForCashback(transaction) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestCashback(transaction)}
                          className="h-8 px-3 text-xs"
                        >
                          <Banknote className="w-3 h-3 mr-1" />
                          Cashback
                        </Button>
                      )}
                      <div className="flex-shrink-0">{getTransactionBadge(transaction.transaction_type)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} transactions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                let pageNum;
                if (pagination.last_page <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.last_page - 2) {
                  pageNum = pagination.last_page - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.last_page}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Cashback Request Modal */}
      <CashbackRequestModal
        isOpen={isCashbackModalOpen}
        onClose={() => {
          setIsCashbackModalOpen(false)
          setSelectedTransaction(undefined)
        }}
        transaction={selectedTransaction}
      />
    </div>
  )
}
