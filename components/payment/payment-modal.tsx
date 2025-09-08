"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, DollarSign, Gift, Loader2 } from "lucide-react"
import { usePayment } from "@/hooks/use-payment"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (transaction: any) => void
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const { processPayment, loading, error } = usePayment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await processPayment({
      amount: Number.parseFloat(amount),
      description: description || "Purchase with loyalty points",
    })

    if (result.success) {
      onSuccess(result.transaction)
      onClose()
      setAmount("")
      setDescription("")
    }
  }

  const pointsToEarn = amount ? Math.floor(Number.parseFloat(amount) * 10) : 0
  const cashbackAmount = amount ? (Number.parseFloat(amount) * 0.02).toFixed(2) : "0.00"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            <CreditCard className="w-5 h-5 text-primary" />
            Make a Purchase
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Process a payment and earn loyalty points automatically
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-card-foreground">
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-card-foreground">
                Description (Optional)
              </Label>
              <Input
                id="description"
                placeholder="What are you purchasing?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            {amount && (
              <div className="p-4 rounded-lg bg-background border border-border space-y-3">
                <h4 className="font-medium text-foreground">Loyalty Rewards</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{pointsToEarn} Points</p>
                      <p className="text-xs text-muted-foreground">You&apos;ll earn</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">${cashbackAmount}</p>
                      <p className="text-xs text-muted-foreground">Cashback eligible</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-card-foreground bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${amount || "0.00"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
