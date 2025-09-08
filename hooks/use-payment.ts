"use client"

import { useState } from "react"

interface PaymentData {
  amount: number
  description: string
}

export function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const processPayment = async (paymentData: PaymentData) => {
    setLoading(true)
    setError("")

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock payment success (90% success rate)
      const success = Math.random() > 0.1

      if (!success) {
        throw new Error("Payment failed. Please try again.")
      }

      const transaction = {
        id: Date.now(),
        amount: paymentData.amount,
        description: paymentData.description,
        points_earned: Math.floor(paymentData.amount * 10),
        reference: `pay_${Date.now()}`,
        status: "completed",
        created_at: new Date().toISOString(),
      }

      return {
        success: true,
        transaction,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed"
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    processPayment,
    loading,
    error,
  }
}
