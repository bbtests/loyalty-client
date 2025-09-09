"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"

interface PaymentData {
  amount: number
  description: string
}

interface PaymentTransaction {
  id: number
  amount: number
  description: string
  points_earned?: number
  reference: string
  status: string
  created_at: string
  authorization_url: string
  access_code: string
  provider: string
}

export function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const processPayment = async (paymentData: PaymentData) => {
    setLoading(true)
    setError("")

    try {
      // Call the actual payment API
      const response = await apiClient.post<{ item: PaymentTransaction }>("/payments/initialize", {
        amount: paymentData.amount,
        description: paymentData.description,
      })

      if (response.status === "success") {
        // Redirect to payment URL
        window.location.href = response.data.item.authorization_url

        const transaction = {
          id: response.data.item.id,
          amount: response.data.item.amount,
          description: response.data.item.description,
          points_earned: response.data.item.points_earned || Math.floor(paymentData.amount * 10),
          reference: response.data.item.reference,
          status: response.data.item.status,
          created_at: response.data.item.created_at,
        }

        return {
          success: true,
          transaction,
        }
      } else {
        throw new Error(response.message || "Payment initialization failed")
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
