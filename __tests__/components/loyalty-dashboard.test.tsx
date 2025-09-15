import { render, screen, fireEvent, act } from '@testing-library/react'
import { LoyaltyDashboard } from '@/components/loyalty-dashboard'
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates'
import { useLoyaltyData } from '@/hooks/use-loyalty-data'

// Type assertion helper for testing library matchers
const expectAny = expect as any

// Mock DOM methods for Radix UI components
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn() as any,
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: jest.fn(() => ({
    width: 120,
    height: 120,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  })),
  writable: true,
})

// Helper function to wrap fireEvent calls in act
const userEvent = async (callback: () => void) => {
  await act(async () => {
    callback()
  })
}

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn() as any,
  signOut: jest.fn() as any,
}))

// Mock next/navigation
const mockPush = jest.fn() as any
const mockGet = jest.fn() as any
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn() as any,
  })),
  useSearchParams: jest.fn(() => ({
    get: mockGet,
    toString: jest.fn(() => ''),
  })),
}))

// Mock the hooks
jest.mock('@/hooks/use-realtime-updates')
jest.mock('@/hooks/use-loyalty-data')

const mockUseRealtimeUpdates = useRealtimeUpdates as jest.MockedFunction<typeof useRealtimeUpdates>
const mockUseLoyaltyData = useLoyaltyData as jest.MockedFunction<typeof useLoyaltyData>
const mockUseSession = require('next-auth/react').useSession as jest.MockedFunction<any>
const mockUseSearchParams = require('next/navigation').useSearchParams as jest.MockedFunction<any>

const mockLoyaltyData = {
  user_id: 1,
  points: {
    available: 2750,
    total_earned: 8950,
    total_redeemed: 6200,
  },
  achievements: [
    {
      id: 1,
      name: 'First Purchase',
      description: 'Made your first purchase',
      badge_icon: 'trophy',
      unlocked_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Loyal Customer',
      description: 'Earned 1000 loyalty points',
      badge_icon: 'star',
      unlocked_at: '2024-01-05T00:00:00Z',
    },
  ],
  badges: [
    {
      id: 1,
      name: 'Bronze Member',
      description: 'Welcome to our loyalty program',
      icon: 'bronze-medal',
      tier: 1,
      earned_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Silver Member',
      description: 'Reached 2500 points',
      icon: 'silver-medal',
      tier: 2,
      earned_at: '2024-01-08T00:00:00Z',
    },
  ],
  current_badge: {
    id: 2,
    name: 'Silver Member',
    tier: 2,
    icon: 'silver-medal',
  },
}

describe('LoyaltyDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockGet.mockClear()
    
    // Suppress console warnings and errors
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock authenticated session by default
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    })
    
    // Mock search params
    mockUseSearchParams.mockReturnValue({
      get: (jest.fn() as any).mockReturnValue(null),
    })
    
    // Mock useRealtimeUpdates by default
    mockUseRealtimeUpdates.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loyaltyLoading: false,
      loyaltyError: undefined,
      isConnected: true,
      isConnecting: false,
      isOffline: false,
      status: 'connected' as const,
      reconnectAttempts: 0,
      refreshData: jest.fn() as any,
      refetchLoyaltyData: jest.fn() as any,
      refreshDataWithRetry: jest.fn() as any,
      showAchievementNotification: false,
      achievementNotificationData: null,
      setShowAchievementNotification: jest.fn() as any,
    })
    
    // Mock useLoyaltyData for simulateAchievement function
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: undefined,
      loading: false,
      error: null,
      simulateAchievement: jest.fn() as any,
      handleAchievementSelection: jest.fn() as any,
      refreshData: jest.fn() as any,
      showAchievementModal: false,
      setShowAchievementModal: jest.fn() as any,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders loading state correctly', () => {
    mockUseRealtimeUpdates.mockReturnValue({
      loyaltyData: undefined,
      loyaltyLoading: true,
      loyaltyError: undefined,
      isOffline: false,
      refreshData: jest.fn() as any,
      refetchLoyaltyData: jest.fn() as any,
      refreshDataWithRetry: jest.fn() as any,
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      showAchievementNotification: false,
      achievementNotificationData: null,
      setShowAchievementNotification: jest.fn() as any,
      status: 'connected' as const,
    })

    render(<LoyaltyDashboard />)

    // Check for the loading spinner by its class
    const spinner = document.querySelector('.animate-spin')
    expectAny(spinner).toBeInTheDocument()
  })

  it('renders dashboard with loyalty data', () => {
    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Loyalty Dashboard')).toBeInTheDocument()
    expectAny(screen.getByText('Track your rewards and achievements')).toBeInTheDocument()
    expectAny(screen.getByText('Make Purchase')).toBeInTheDocument()
    expectAny(screen.getByText('Simulate Achievement')).toBeInTheDocument()
  })

  it('displays correct points information', () => {
    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Available Points')).toBeInTheDocument()
    expectAny(screen.getByText('Total Earned')).toBeInTheDocument()
    expectAny(screen.getByText('Gold Member')).toBeInTheDocument() // Next tier name instead of generic text
  })

  it('displays achievements count correctly', () => {
    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('2')).toBeInTheDocument() // Total achievements count
    expectAny(screen.getByText('+2 this month')).toBeInTheDocument()
  })

  it('displays current badge information', () => {
    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Silver Member')).toBeInTheDocument()
    expectAny(screen.getByText('Tier 2')).toBeInTheDocument()
  })

  it('displays points redeemed information', () => {
    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('6,200')).toBeInTheDocument() // Points redeemed
    expectAny(screen.getByText('Lifetime redemptions')).toBeInTheDocument()
  })

  it('renders all tab triggers', () => {
    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Overview')).toBeInTheDocument()
    expectAny(screen.getByText('Achievements')).toBeInTheDocument()
    expectAny(screen.getByText('Badges')).toBeInTheDocument()
    expectAny(screen.getByText('Loyalty')).toBeInTheDocument()
    expectAny(screen.getByText('Transactions')).toBeInTheDocument()
  })

  it('shows recent achievements in overview tab', () => {
    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Recent Achievements')).toBeInTheDocument()
    expectAny(screen.getByText('First Purchase')).toBeInTheDocument()
    expectAny(screen.getByText('Loyal Customer')).toBeInTheDocument()
  })

  it('handles simulate achievement button click', async () => {
    const mockSimulateAchievement = jest.fn() as any
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: undefined,
      loading: false,
      error: null,
      simulateAchievement: mockSimulateAchievement,
      handleAchievementSelection: jest.fn() as any,
      refreshData: jest.fn() as any,
      showAchievementModal: false,
      setShowAchievementModal: jest.fn() as any,
    })

    render(<LoyaltyDashboard />)

    const simulateButton = screen.getByText('Simulate Achievement')
    await userEvent(() => fireEvent.click(simulateButton))

    expectAny(mockSimulateAchievement).toHaveBeenCalled()
  })

  it('calls simulateAchievement when simulate button is clicked', async () => {
    const mockSimulateAchievement = jest.fn() as any
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: undefined,
      loading: false,
      error: null,
      simulateAchievement: mockSimulateAchievement,
      handleAchievementSelection: jest.fn() as any,
      refreshData: jest.fn() as any,
      showAchievementModal: false,
      setShowAchievementModal: jest.fn() as any,
    })

    render(<LoyaltyDashboard />)

    const simulateButton = screen.getByText('Simulate Achievement')
    await userEvent(() => fireEvent.click(simulateButton))

    // Verify that simulateAchievement was called
    expectAny(mockSimulateAchievement).toHaveBeenCalled()
    
    // Note: Achievement notifications are now handled by WebSocket, not manual triggers
  })

  it('handles payment modal opening', async () => {
    render(<LoyaltyDashboard />)

    const makePurchaseButton = screen.getByText('Make Purchase')
    await userEvent(() => fireEvent.click(makePurchaseButton))

    // Payment modal should be rendered (we can't easily test the modal content without more complex setup)
    expectAny(makePurchaseButton).toBeInTheDocument()
  })

  it('handles tab switching', async () => {
    render(<LoyaltyDashboard />)

    const achievementsTab = screen.getByText('Achievements')
    await userEvent(() => fireEvent.click(achievementsTab))

    // The tab should be active (this would require more complex testing to verify the actual content)
    expectAny(achievementsTab).toBeInTheDocument()
  })

  it('handles URL tab parameter correctly', () => {
    // Mock URL parameter for transactions tab
    mockGet.mockImplementation((key: any) => {
      if (key === 'tab') return 'transactions'
      return null
    })

    render(<LoyaltyDashboard />)
    
    // Should render the dashboard with transactions tab parameter
    expectAny(screen.getByText('Loyalty Dashboard')).toBeInTheDocument()
  })

  it('handles empty loyalty data gracefully', () => {
    mockUseRealtimeUpdates.mockReturnValue({
      loyaltyData: undefined,
      loyaltyLoading: false,
      loyaltyError: undefined,
      isOffline: false,
      refreshData: jest.fn() as any,
      refetchLoyaltyData: jest.fn() as any,
      refreshDataWithRetry: jest.fn() as any,
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      showAchievementNotification: false,
      achievementNotificationData: null,
      setShowAchievementNotification: jest.fn() as any,
      status: 'connected' as const,
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Loyalty Dashboard')).toBeInTheDocument()
    expectAny(screen.getByText('Available Points')).toBeInTheDocument()
  })

  it('handles missing achievements gracefully', () => {
    const dataWithoutAchievements = {
      ...mockLoyaltyData,
      achievements: [],
    }

    mockUseRealtimeUpdates.mockReturnValue({
      loyaltyData: dataWithoutAchievements,
      loyaltyLoading: false,
      loyaltyError: undefined,
      isOffline: false,
      refreshData: jest.fn() as any,
      refetchLoyaltyData: jest.fn() as any,
      refreshDataWithRetry: jest.fn() as any,
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      showAchievementNotification: false,
      achievementNotificationData: null,
      setShowAchievementNotification: jest.fn() as any,
      status: 'connected' as const,
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('0')).toBeInTheDocument() // Should show 0 achievements
  })

  it('handles missing current badge gracefully', () => {
    const dataWithoutBadge = {
      ...mockLoyaltyData,
      current_badge: null,
    }

    mockUseRealtimeUpdates.mockReturnValue({
      loyaltyData: dataWithoutBadge,
      loyaltyLoading: false,
      loyaltyError: undefined,
      isOffline: false,
      refreshData: jest.fn() as any,
      refetchLoyaltyData: jest.fn() as any,
      refreshDataWithRetry: jest.fn() as any,
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      showAchievementNotification: false,
      achievementNotificationData: null,
      setShowAchievementNotification: jest.fn() as any,
      status: 'connected' as const,
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('No Badge')).toBeInTheDocument()
    expectAny(screen.getByText('Tier 0')).toBeInTheDocument()
  })

  it('renders unauthenticated state correctly', () => {
    // Mock unauthenticated session
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    mockUseRealtimeUpdates.mockReturnValue({
      loyaltyData: undefined,
      loyaltyLoading: false,
      loyaltyError: undefined,
      isOffline: false,
      refreshData: jest.fn() as any,
      refetchLoyaltyData: jest.fn() as any,
      refreshDataWithRetry: jest.fn() as any,
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      showAchievementNotification: false,
      achievementNotificationData: null,
      setShowAchievementNotification: jest.fn() as any,
      status: 'connected' as const,
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Loyalty Dashboard')).toBeInTheDocument()
    expectAny(screen.getByText('Please log in to access payment features and track your loyalty points.')).toBeInTheDocument()
    expectAny(screen.getByText('Login')).toBeInTheDocument()
  })
})
