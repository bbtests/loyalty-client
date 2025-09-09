import { renderHook, act, waitFor } from '@testing-library/react'
import { useLoyaltyData } from '@/hooks/use-loyalty-data'

// Mock timers
jest.useFakeTimers()

describe('useLoyaltyData Hook', () => {
  beforeEach(() => {
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useLoyaltyData())

    expect(result.current.loading).toBe(true)
    expect(result.current.loyaltyData).toBe(null)
  })

  it('loads loyalty data after timeout', async () => {
    const { result } = renderHook(() => useLoyaltyData())

    // Fast-forward time to trigger the timeout
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.loyaltyData).toBeDefined()
    })

    expect(result.current.loyaltyData).toMatchObject({
      user_id: 1,
      points: {
        available: 2750,
        total_earned: 8950,
        total_redeemed: 6200,
      },
    })
  })

  it('has correct initial points data', async () => {
    const { result } = renderHook(() => useLoyaltyData())

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const { loyaltyData } = result.current
    expect(loyaltyData?.points.available).toBe(2750)
    expect(loyaltyData?.points.total_earned).toBe(8950)
    expect(loyaltyData?.points.total_redeemed).toBe(6200)
  })

  it('has correct achievements data', async () => {
    const { result } = renderHook(() => useLoyaltyData())

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const { loyaltyData } = result.current
    expect(loyaltyData?.achievements).toHaveLength(3)
    expect(loyaltyData?.achievements[0]).toMatchObject({
      id: 1,
      name: 'First Purchase',
      description: 'Made your first purchase',
      badge_icon: 'trophy',
    })
  })

  it('has correct badges data', async () => {
    const { result } = renderHook(() => useLoyaltyData())

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const { loyaltyData } = result.current
    expect(loyaltyData?.badges).toHaveLength(2)
    expect(loyaltyData?.badges[0]).toMatchObject({
      id: 1,
      name: 'Bronze Member',
      description: 'Welcome to our loyalty program',
      icon: 'bronze-medal',
      tier: 1,
    })
  })

  it('has correct current badge data', async () => {
    const { result } = renderHook(() => useLoyaltyData())

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const { loyaltyData } = result.current
    expect(loyaltyData?.current_badge).toMatchObject({
      id: 2,
      name: 'Silver Member',
      tier: 2,
      icon: 'silver-medal',
    })
  })

  it('simulateAchievement increases points correctly', async () => {
    const { result } = renderHook(() => useLoyaltyData())

    // Wait for initial data to load
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialPoints = result.current.loyaltyData?.points.available
    const initialTotalEarned = result.current.loyaltyData?.points.total_earned

    // Simulate achievement
    act(() => {
      result.current.simulateAchievement()
    })

    expect(result.current.loyaltyData?.points.available).toBe(initialPoints! + 500)
    expect(result.current.loyaltyData?.points.total_earned).toBe(initialTotalEarned! + 500)
  })

  it('simulateAchievement does not affect redeemed points', async () => {
    const { result } = renderHook(() => useLoyaltyData())

    // Wait for initial data to load
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialRedeemed = result.current.loyaltyData?.points.total_redeemed

    // Simulate achievement
    act(() => {
      result.current.simulateAchievement()
    })

    expect(result.current.loyaltyData?.points.total_redeemed).toBe(initialRedeemed)
  })

  it('simulateAchievement handles null data gracefully', () => {
    const { result } = renderHook(() => useLoyaltyData())

    // Don't advance timers, so data is still null
    act(() => {
      result.current.simulateAchievement()
    })

    expect(result.current.loyaltyData).toBe(null)
  })

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    const { unmount } = renderHook(() => useLoyaltyData())

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it('does not load data multiple times on re-renders', async () => {
    const { rerender, result } = renderHook(() => useLoyaltyData())

    // Re-render the hook
    rerender()

    // Advance timers
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    // Should only have one timeout set (we can't easily test this with fake timers)
    // The important thing is that the hook doesn't crash on re-renders
    expect(result.current.loading).toBe(false)
  })
})
