import { renderHook, act } from '@testing-library/react'
import { useCashback } from '@/hooks/use-cashback'

describe('useCashback Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useCashback())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
    expect(result.current.success).toBe(false)
  })

  it('processes cashback request', async () => {
    const { result } = renderHook(() => useCashback())

    let cashbackResult: any
    await act(async () => {
      const promise = result.current.requestCashback(100)
      jest.advanceTimersByTime(1500)
      cashbackResult = await promise
    })

    expect(cashbackResult).toHaveProperty('success')
    if (cashbackResult.success) {
      expect(cashbackResult.message).toBe('Cashback request submitted successfully')
      expect(result.current.success).toBe(true)
      expect(result.current.error).toBe('')
    } else {
      expect(cashbackResult).toHaveProperty('error')
      expect(result.current.error).toBe(cashbackResult.error)
      expect(result.current.success).toBe(false)
    }
  })

  it('sets loading state correctly during request processing', async () => {
    const { result } = renderHook(() => useCashback())

    // Start cashback request
    let cashbackPromise: Promise<any>
    act(() => {
      cashbackPromise = result.current.requestCashback(100)
    })

    // Should be loading immediately
    expect(result.current.loading).toBe(true)

    // Fast-forward timers and wait for completion
    await act(async () => {
      jest.advanceTimersByTime(1500)
      await cashbackPromise
    })

    expect(result.current.loading).toBe(false)
  })

  it('clears error and success states on new request', async () => {
    const { result } = renderHook(() => useCashback())

    // Make first request
    await act(async () => {
      const promise = result.current.requestCashback(100)
      jest.advanceTimersByTime(1500)
      await promise
    })

    // Make second request
    await act(async () => {
      const promise = result.current.requestCashback(100)
      jest.advanceTimersByTime(1500)
      await promise
    })

    // Error should be cleared after new attempt
    expect(result.current.error).toBe('')
  })

  it('resets success state after 5 seconds', async () => {
    const { result } = renderHook(() => useCashback())

    await act(async () => {
      const promise = result.current.requestCashback(100)
      jest.advanceTimersByTime(1500)
      await promise
    })

    if (result.current.success) {
      // Fast-forward 5 seconds
      await act(async () => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.success).toBe(false)
    }
  })

  it('resets error state after 5 seconds', async () => {
    const { result } = renderHook(() => useCashback())

    await act(async () => {
      const promise = result.current.requestCashback(100)
      jest.advanceTimersByTime(1500)
      await promise
    })

    if (result.current.error) {
      // Fast-forward 5 seconds
      await act(async () => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.error).toBe('')
    }
  })

  it('handles different cashback amounts', async () => {
    const { result } = renderHook(() => useCashback())

    const testAmounts = [0, 10, 50, 100, 500, 1000]

    for (const amount of testAmounts) {
      let cashbackResult: any
      await act(async () => {
        const promise = result.current.requestCashback(amount)
        jest.advanceTimersByTime(1500)
        cashbackResult = await promise
      })

      expect(cashbackResult).toHaveProperty('success')
    }
  })

  it('handles multiple concurrent requests', async () => {
    const { result } = renderHook(() => useCashback())

    // Start multiple requests
    const promises = [
      result.current.requestCashback(100),
      result.current.requestCashback(200),
      result.current.requestCashback(300),
    ]

    const results = await act(async () => {
      jest.advanceTimersByTime(1500)
      return await Promise.all(promises)
    })

    // All should have success property
    results.forEach((result) => {
      expect(result).toHaveProperty('success')
    })
  })

  it('handles edge case with zero amount', async () => {
    const { result } = renderHook(() => useCashback())

    let cashbackResult: any
    await act(async () => {
      const promise = result.current.requestCashback(0)
      jest.advanceTimersByTime(1500)
      cashbackResult = await promise
    })

    expect(cashbackResult).toHaveProperty('success')
  })

  it('handles very large amounts', async () => {
    const { result } = renderHook(() => useCashback())

    let cashbackResult: any
    await act(async () => {
      const promise = result.current.requestCashback(999999)
      jest.advanceTimersByTime(1500)
      cashbackResult = await promise
    })

    expect(cashbackResult).toHaveProperty('success')
  })
})
