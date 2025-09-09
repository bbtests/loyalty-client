"use client"

import { useState, useRef, useEffect } from "react"

export function useCashback() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const requestCashback = async (amount: number) => {
    setLoading(true)
    setError("")
    setSuccess(false)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

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
      timeoutRef.current = setTimeout(() => setSuccess(false), 5000)

      return {
        success: true,
        message: "Cashback request submitted successfully",
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Cashback request failed"
      setError(errorMessage)

      // Reset error after 5 seconds
      timeoutRef.current = setTimeout(() => setError(""), 5000)

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
