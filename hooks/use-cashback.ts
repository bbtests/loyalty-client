"use client"

import { useState } from "react"

export function useCashback() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const requestCashback = async (amount: number) => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock success (95% success rate)
      const isSuccess = Math.random() > 0.05

      if (!isSuccess) {
        throw new Error("Cashback request failed. Please try again later.")
      }

      setSuccess(true)

      // Reset success after 5 seconds
      setTimeout(() => setSuccess(false), 5000)

      return {
        success: true,
        message: "Cashback request submitted successfully",
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Cashback request failed"
      setError(errorMessage)

      // Reset error after 5 seconds
      setTimeout(() => setError(""), 5000)

      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    requestCashback,
    loading,
    error,
    success,
  }
}
