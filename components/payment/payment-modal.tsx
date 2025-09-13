"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Banknote, Gift, Loader2 } from "lucide-react"
import { usePayment } from "@/hooks/use-payment"
import { useGetPaymentProvidersQuery } from "@/store/loyalty"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (transaction: any) => void
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [provider, setProvider] = useState("mock")
  const { processPayment, loading, error } = usePayment()
  
  // Use store query to fetch payment providers
  const { 
    data: providers = {}, 
    isLoading: loadingProviders, 
    error: providersError 
  } = useGetPaymentProvidersQuery(undefined, {
    skip: !isOpen, // Only fetch when modal is open
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await processPayment({
      amount: Number.parseFloat(amount),
      description: description || "Purchase with loyalty points",
      provider: provider,
    })

    if (result.success) {
      if (result.redirect) {
        // For redirect-based payments (Paystack, Flutterwave), the user will be redirected
        // The payment will be processed when they return from the payment provider
        // We don't close the modal here as the redirect will handle the flow
        console.log('Redirecting to payment provider:', result.authorization_url)
      } else {
        // For non-redirect payments (mock), handle success normally
        onSuccess(result.transaction)
        onClose()
        setAmount("")
        setDescription("")
        setProvider("mock")
      }
    }
  }

  const handleClose = () => {
    setAmount("")
    setDescription("")
    setProvider("mock")
    onClose()
  }

  const pointsToEarn = amount ? Math.floor(Number.parseFloat(amount) * 10) : 0
  const cashbackAmount = amount ? (Number.parseFloat(amount) * 0.02).toFixed(2) : "0.00"

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                Amount (₦)
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
              <Label htmlFor="provider" className="text-card-foreground">
                Payment Provider
              </Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select payment provider" />
                </SelectTrigger>
                <SelectContent>
                  {loadingProviders ? (
                    <SelectItem value="loading" disabled>
                      Loading providers...
                    </SelectItem>
                  ) : Object.keys(providers).length === 0 ? (
                    <SelectItem value="no-providers" disabled>
                      No providers available
                    </SelectItem>
                  ) : (
                    Object.entries(providers).map(([key, p]) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                        disabled={!p.available}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize">{p.name}</span>
                          {!p.available && (
                            <span className="text-xs text-muted-foreground ml-2">(Unavailable)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
                    <Banknote className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">₦{cashbackAmount}</p>
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
              onClick={handleClose}
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
                  Pay ₦{amount || "0.00"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
