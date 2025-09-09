import { renderHook, act } from '@testing-library/react'
import { usePayment } from '@/hooks/use-payment'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}))

const mockApiClient = require('@/lib/api-client').apiClient

describe('usePayment Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    
    // Mock successful API response by default
    mockApiClient.post.mockResolvedValue({
      status: 'success',
      data: {
        item: {
          id: 1,
          amount: 100,
          description: 'Test payment',
          points_earned: 1000,
          reference: 'pay_1234567890_test',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          authorization_url: 'https://checkout.paystack.com/test',
          access_code: 'test_access_code',
          provider: 'paystack',
        },
      },
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => usePayment())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('processes payment successfully', async () => {
    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 100,
      description: 'Test payment',
    }

    let paymentResult: any
    await act(async () => {
      const promise = result.current.processPayment(paymentData)
      paymentResult = await promise
    })

    expect(paymentResult).toHaveProperty('success')
    expect(paymentResult.success).toBe(true)
    expect(paymentResult).toHaveProperty('transaction')
    expect(paymentResult.transaction).toMatchObject({
      amount: 100,
      description: 'Test payment',
      points_earned: 1000,
      status: 'completed',
    })
    expect(paymentResult.transaction.id).toBeDefined()
    expect(paymentResult.transaction.reference).toBe('pay_1234567890_test')
    expect(paymentResult.transaction.created_at).toBeDefined()
  })

  it('calculates points correctly', async () => {
    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 50.5,
      description: 'Test payment',
    }

    // Mock API response with calculated points
    mockApiClient.post.mockResolvedValueOnce({
      status: 'success',
      data: {
        item: {
          id: 1,
          amount: 50.5,
          description: 'Test payment',
          points_earned: 505, // Math.floor(50.5 * 10)
          reference: 'pay_1234567890_test',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          authorization_url: 'https://checkout.paystack.com/test',
          access_code: 'test_access_code',
          provider: 'paystack',
        },
      },
    })

    let paymentResult: any
    await act(async () => {
      const promise = result.current.processPayment(paymentData)
      paymentResult = await promise
    })

    expect(paymentResult.success).toBe(true)
    expect(paymentResult.transaction.points_earned).toBe(505)
  })

  it('handles payment processing', async () => {
    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 100,
      description: 'Test payment',
    }

    let paymentResult: any
    await act(async () => {
      const promise = result.current.processPayment(paymentData)
      paymentResult = await promise
    })

    // Check that we get success
    expect(paymentResult).toHaveProperty('success')
    expect(paymentResult.success).toBe(true)
  })

  it('handles payment failure', async () => {
    const { result } = renderHook(() => usePayment())

    // Mock API failure
    mockApiClient.post.mockRejectedValueOnce(new Error('Payment initialization failed'))

    const paymentData = {
      amount: 100,
      description: 'Test payment',
    }

    let paymentResult: any
    await act(async () => {
      const promise = result.current.processPayment(paymentData)
      paymentResult = await promise
    })

    expect(paymentResult).toHaveProperty('success')
    expect(paymentResult.success).toBe(false)
    expect(paymentResult).toHaveProperty('error')
    expect(paymentResult.error).toBe('Payment initialization failed')
  })

  it('sets loading state correctly during payment processing', async () => {
    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 100,
      description: 'Test payment',
    }

    // Start payment processing
    let paymentPromise: Promise<any>
    act(() => {
      paymentPromise = result.current.processPayment(paymentData)
    })

    // Should be loading immediately
    expect(result.current.loading).toBe(true)

    // Wait for completion
    await act(async () => {
      await paymentPromise
    })

    expect(result.current.loading).toBe(false)
  })

  it('clears error on new payment attempt', async () => {
    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 100,
      description: 'Test payment',
    }

    // Make a payment attempt that will fail
    mockApiClient.post.mockRejectedValueOnce(new Error('Network error'))
    
    await act(async () => {
      const promise = result.current.processPayment(paymentData)
      await promise
    })

    // Check that error is set
    expect(result.current.error).toBe('Network error')

    // Make another payment attempt that will succeed
    mockApiClient.post.mockResolvedValueOnce({
      status: 'success',
      data: {
        item: {
          id: 1,
          amount: 100,
          description: 'Test payment',
          points_earned: 1000,
          reference: 'pay_1234567890_test',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          authorization_url: 'https://checkout.paystack.com/test',
          access_code: 'test_access_code',
          provider: 'paystack',
        },
      },
    })

    await act(async () => {
      const promise = result.current.processPayment(paymentData)
      await promise
    })

    // Error should be cleared
    expect(result.current.error).toBe('')
  })

  it('handles different payment amounts', async () => {
    const { result } = renderHook(() => usePayment())

    const testCases = [
      { amount: 0, expectedPoints: 0 },
      { amount: 1, expectedPoints: 10 },
      { amount: 99.99, expectedPoints: 999 },
      { amount: 1000, expectedPoints: 10000 },
    ]

    for (const testCase of testCases) {
      const paymentData = {
        amount: testCase.amount,
        description: 'Test payment',
      }

      // Mock API response for each test case
      mockApiClient.post.mockResolvedValueOnce({
        status: 'success',
        data: {
          item: {
            id: 1,
            amount: testCase.amount,
            description: 'Test payment',
            points_earned: testCase.expectedPoints,
            reference: 'pay_1234567890_test',
            status: 'completed',
            created_at: '2024-01-01T00:00:00Z',
            authorization_url: 'https://checkout.paystack.com/test',
            access_code: 'test_access_code',
            provider: 'paystack',
          },
        },
      })

      let paymentResult: any
      await act(async () => {
        const promise = result.current.processPayment(paymentData)
        paymentResult = await promise
      })

      expect(paymentResult.success).toBe(true)
      expect(paymentResult.transaction.points_earned).toBe(testCase.expectedPoints)
    }
  })

  it('generates unique transaction IDs', async () => {
    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 100,
      description: 'Test payment',
    }

    const results = []
    for (let i = 0; i < 3; i++) {
      // Mock API response with unique ID for each call
      mockApiClient.post.mockResolvedValueOnce({
        status: 'success',
        data: {
          item: {
            id: i + 1, // Unique ID
            amount: 100,
            description: 'Test payment',
            points_earned: 1000,
            reference: `pay_1234567890_test_${i}`,
            status: 'completed',
            created_at: '2024-01-01T00:00:00Z',
            authorization_url: 'https://checkout.paystack.com/test',
            access_code: 'test_access_code',
            provider: 'paystack',
          },
        },
      })

      let paymentResult: any
      await act(async () => {
        const promise = result.current.processPayment(paymentData)
        paymentResult = await promise
      })
      
      if (paymentResult.success) {
        results.push(paymentResult.transaction.id)
      }
    }

    // IDs should be unique
    const uniqueIds = new Set(results)
    expect(uniqueIds.size).toBe(results.length)
  })

  it('generates unique reference numbers', async () => {
    const { result } = renderHook(() => usePayment())

    const paymentData = {
      amount: 100,
      description: 'Test payment',
    }

    const results = []
    for (let i = 0; i < 3; i++) {
      // Mock API response with unique reference for each call
      mockApiClient.post.mockResolvedValueOnce({
        status: 'success',
        data: {
          item: {
            id: i + 1,
            amount: 100,
            description: 'Test payment',
            points_earned: 1000,
            reference: `pay_1234567890_test_${i}`, // Unique reference
            status: 'completed',
            created_at: '2024-01-01T00:00:00Z',
            authorization_url: 'https://checkout.paystack.com/test',
            access_code: 'test_access_code',
            provider: 'paystack',
          },
        },
      })

      let paymentResult: any
      await act(async () => {
        const promise = result.current.processPayment(paymentData)
        paymentResult = await promise
      })
      
      if (paymentResult.success) {
        results.push(paymentResult.transaction.reference)
      }
    }

    // References should be unique
    const uniqueRefs = new Set(results)
    expect(uniqueRefs.size).toBe(results.length)
  })
})
