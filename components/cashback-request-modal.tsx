"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Banknote, AlertCircle, CheckCircle } from "lucide-react"
import { useRequestCashbackMutation } from "@/store/loyalty"
import type { TransactionData } from "@/types/api"

interface CashbackRequestModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: TransactionData
}

export function CashbackRequestModal({ isOpen, onClose, transaction }: CashbackRequestModalProps) {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [requestCashback, { isLoading }] = useRequestCashbackMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    const cashbackAmount = parseFloat(amount)
    
    if (!cashbackAmount || cashbackAmount <= 0) {
      setError("Please enter a valid cashback amount greater than ₦0")
      return
    }

    if (cashbackAmount > 10000) {
      setError("Maximum cashback amount is ₦10,000,000")
      return
    }

    if (cashbackAmount < 0.01) {
      setError("Minimum cashback amount is ₦0.01")
      return
    }

    try {
      const result = await requestCashback({
        amount: cashbackAmount,
        transaction_id: transaction?.id,
      }).unwrap()

      if (result.status === "success") {
        setSuccess(true)
        // Auto-close modal after 3 seconds
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setAmount("")
        }, 3000)
      } else {
        setError(result.message || "Failed to request cashback")
      }
    } catch (err: any) {
      console.error('Cashback request error:', err);
      setError(err.data?.message || err.message || "Failed to request cashback")
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setAmount("")
      setError("")
      setSuccess(false)
    }
  }

  const maxCashbackAmount = transaction ? parseFloat(transaction.amount) * 0.1 : 1000000 // 10% of transaction amount or ₦1,000,000 max

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            Request Cashback
          </DialogTitle>
          <DialogDescription>
            {transaction ? (
              <>
                Request cashback for your purchase of <strong>₦{parseFloat(transaction.amount).toFixed(2)}</strong> on{" "}
                <strong>{new Date(transaction.created_at).toLocaleDateString()}</strong>
              </>
            ) : (
              "Request cashback for your recent transactions"
            )}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Cashback Request Submitted!</strong>
                <br />
                Your cashback request has been queued for processing. You&apos;ll receive the payment within 5-10 minutes.
              </AlertDescription>
            </Alert>
            <div className="text-center text-sm text-muted-foreground">
              This dialog will close automatically...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Cashback Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxCashbackAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter cashback amount"
                disabled={isLoading}
                required
              />
              <div className="text-xs text-muted-foreground">
                Maximum: ₦{maxCashbackAmount.toFixed(2)}
                {transaction && (
                  <span className="ml-2">
                    (10% of transaction amount)
                  </span>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Request Cashback"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
