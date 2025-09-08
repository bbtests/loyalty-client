"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useCashback } from "@/hooks/use-cashback"

interface CashbackRequestProps {
  availablePoints: number
  totalSpent: number
}

export function CashbackRequest({ availablePoints, totalSpent }: CashbackRequestProps) {
  const [amount, setAmount] = useState("")
  const { requestCashback, loading, error, success } = useCashback()

  const maxCashback = Math.min(totalSpent * 0.02, availablePoints * 0.01)
  const isEligible = totalSpent >= 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cashbackAmount = Number.parseFloat(amount)
    if (cashbackAmount > maxCashback) {
      return
    }

    await requestCashback(cashbackAmount)
    if (success) {
      setAmount("")
    }
  }

  if (!isEligible) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            Cashback Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              You need to spend at least $100 to be eligible for cashback. Current spending: ${totalSpent.toFixed(2)}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <DollarSign className="w-5 h-5 text-secondary" />
          Request Cashback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-background border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Available Cashback</span>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                ${maxCashback.toFixed(2)} max
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on 2% of your total spending (${totalSpent.toFixed(2)})
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashback-amount" className="text-card-foreground">
              Cashback Amount ($)
            </Label>
            <Input
              id="cashback-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxCashback}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-input border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">Maximum: ${maxCashback.toFixed(2)}</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Cashback request submitted successfully! Processing time: 5-10 minutes.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!amount || loading || Number.parseFloat(amount) > maxCashback}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Request...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Request ${amount || "0.00"} Cashback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
