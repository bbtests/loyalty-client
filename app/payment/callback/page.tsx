"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useVerifyPaymentMutation, useProcessPurchaseAfterPaymentMutation } from "@/store/loyalty"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [transaction, setTransaction] = useState<any>(null)
  const [countdown, setCountdown] = useState(5)

  const [verifyPayment] = useVerifyPaymentMutation()
  const [processPurchaseAfterPayment] = useProcessPurchaseAfterPaymentMutation()

  useEffect(() => {
    const handlePaymentCallback = async () => {
      // Wait for session to load
      if (sessionStatus === 'loading') {
        return
      }

      const reference = searchParams.get('reference')
      const trxref = searchParams.get('trxref')
      const paymentType = searchParams.get('payment_type') || 'paystack'

      // Use reference or trxref (Paystack uses trxref)
      const paymentReference = reference || trxref

      if (!paymentReference) {
        setStatus('error')
        setMessage('No payment reference found in callback URL')
        return
      }

      if (!session?.user?.id) {
        setStatus('error')
        setMessage('User not authenticated. Please log in and try again.')
        return
      }

      try {
        // Step 1: Verify payment
        const verification = await verifyPayment({
          reference: paymentReference,
          provider: paymentType
        }).unwrap()

        console.log('Payment verification result:', verification)

        // Extract verification data
        const verificationData = {
          status: verification?.data?.status || verification?.status,
          amount: verification?.data?.amount || verification?.amount,
          transaction_id: verification?.data?.transaction_id || verification?.transaction_id
        }

        if (!verificationData.status) {
          setStatus('error')
          setMessage('Invalid payment verification response: No status received. Please try again.')
          return
        }
        if (!verificationData.amount) {
          setStatus('error')
          setMessage('Invalid payment verification response: No amount received. Please try again.')
          return
        }
        if (!verificationData.transaction_id) {
          setStatus('error')
          setMessage('Invalid payment verification response: No transaction ID received. Please try again.')
          return
        }

        if (verificationData.status === 'success') {
          // Step 2: Process the purchase
          const purchaseResult = await processPurchaseAfterPayment({
            user_id: parseInt(session.user.id),
            amount: verificationData.amount,
            transaction_id: String(verificationData.transaction_id)
          }).unwrap()

          console.log('Purchase processed:', purchaseResult)

          setStatus('success')
          setMessage('Payment successful! Your loyalty points have been added.')
          setTransaction(purchaseResult)
        } else if (verificationData.status === 'abandoned') {
          setStatus('error')
          setMessage('Payment was cancelled. You can try again anytime.')
        } else if (verificationData.status === 'failed') {
          setStatus('error')
          setMessage('Payment failed. Please try again or contact support.')
        } else {
          setStatus('error')
          setMessage(`Payment verification failed with status: ${verificationData.status}. Please try again.`)
        }
      } catch (error: any) {
        console.error('Payment callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Payment processing failed. Please contact support.')
      }
    }

    handlePaymentCallback()
  }, [searchParams, session, sessionStatus, verifyPayment, processPurchaseAfterPayment])

  // Auto-redirect countdown effect
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === 'success' && countdown === 0) {
      router.push('/dashboard')
    }
  }, [status, countdown, router])

  const handleReturnToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            Payment Processing
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your payment...'}
            {status === 'success' && `Payment completed successfully! Redirecting in ${countdown}s...`}
            {status === 'error' && 'Payment processing failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your payment...
              </p>
            </div>
          )}

          {status === 'success' && transaction && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Transaction Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Amount:</span> ₦{parseFloat(transaction.amount).toFixed(2)}</p>
                  <p><span className="font-medium">Points Earned:</span> {transaction.points_earned}</p>
                  <p><span className="font-medium">Status:</span> {transaction.status}</p>
                  <p><span className="font-medium">Transaction ID:</span> {transaction.id}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button onClick={handleReturnToDashboard} className="w-full">
              {status === 'success' ? `Return to Dashboard (${countdown}s)` : 'Return to Dashboard'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
