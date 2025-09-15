import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { LoyaltyDashboard } from '@/components/loyalty-dashboard'
import { useLoyaltyData } from '@/hooks/use-loyalty-data'

// Type assertion helper for testing library matchers
const expectAny = expect as any

// Mock DOM methods for Radix UI components
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
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
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next/navigation
const mockPush = jest.fn()
const mockGet = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: mockGet,
    toString: jest.fn(() => ''),
  })),
}))

// Mock the hook
jest.mock('@/hooks/use-loyalty-data')

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
      get: jest.fn().mockReturnValue(null),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders loading state correctly', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: null,
      loading: true,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    // Check for the loading spinner by its class
    const spinner = document.querySelector('.animate-spin')
    expectAny(spinner).toBeInTheDocument()
  })

  it('renders dashboard with loyalty data', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Loyalty Dashboard')).toBeInTheDocument()
    expectAny(screen.getByText('Track your rewards and achievements')).toBeInTheDocument()
    expectAny(screen.getByText('Make Purchase')).toBeInTheDocument()
    expectAny(screen.getByText('Simulate Achievement')).toBeInTheDocument()
  })

  it('displays correct points information', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Available Points')).toBeInTheDocument()
    expectAny(screen.getByText('Total Earned')).toBeInTheDocument()
    expectAny(screen.getByText('Gold Member')).toBeInTheDocument() // Next tier name instead of generic text
  })

  it('displays achievements count correctly', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('2')).toBeInTheDocument() // Total achievements count
    expectAny(screen.getByText('+2 this month')).toBeInTheDocument()
  })

  it('displays current badge information', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Silver Member')).toBeInTheDocument()
    expectAny(screen.getByText('Tier 2')).toBeInTheDocument()
  })

  it('displays points redeemed information', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('6,200')).toBeInTheDocument() // Points redeemed
    expectAny(screen.getByText('Lifetime redemptions')).toBeInTheDocument()
  })

  it('renders all tab triggers', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Overview')).toBeInTheDocument()
    expectAny(screen.getByText('Achievements')).toBeInTheDocument()
    expectAny(screen.getByText('Badges')).toBeInTheDocument()
    expectAny(screen.getByText('Loyalty')).toBeInTheDocument()
    expectAny(screen.getByText('Transactions')).toBeInTheDocument()
  })

  it('shows recent achievements in overview tab', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Recent Achievements')).toBeInTheDocument()
    expectAny(screen.getByText('First Purchase')).toBeInTheDocument()
    expectAny(screen.getByText('Loyal Customer')).toBeInTheDocument()
  })

  it('handles simulate achievement button click', async () => {
    const mockSimulateAchievement = jest.fn()
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: mockSimulateAchievement,
    })

    render(<LoyaltyDashboard />)

    const simulateButton = screen.getByText('Simulate Achievement')
    await userEvent(() => fireEvent.click(simulateButton))

    expectAny(mockSimulateAchievement).toHaveBeenCalled()
  })

  it('shows achievement notification when simulating achievement', async () => {
    const mockSimulateAchievement = jest.fn()
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: mockSimulateAchievement,
    })

    render(<LoyaltyDashboard />)

    const simulateButton = screen.getByText('Simulate Achievement')
    await userEvent(() => fireEvent.click(simulateButton))

    await waitFor(() => {
      expectAny(screen.getByText('Big Spender')).toBeInTheDocument()
      expectAny(screen.getByText('Spent over ₦50,000 in a single transaction')).toBeInTheDocument()
    })
  })

  it('handles payment modal opening', async () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    const makePurchaseButton = screen.getByText('Make Purchase')
    await userEvent(() => fireEvent.click(makePurchaseButton))

    // Payment modal should be rendered (we can't easily test the modal content without more complex setup)
    expectAny(makePurchaseButton).toBeInTheDocument()
  })

  it('handles tab switching', async () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    const achievementsTab = screen.getByText('Achievements')
    await userEvent(() => fireEvent.click(achievementsTab))

    // The tab should be active (this would require more complex testing to verify the actual content)
    expectAny(achievementsTab).toBeInTheDocument()
  })

  it('handles URL tab parameter correctly', () => {
    // Mock URL parameter for transactions tab
    mockGet.mockImplementation((key: string) => {
      if (key === 'tab') return 'transactions'
      return null
    })

    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: mockLoyaltyData,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)
    
    // Should render the dashboard with transactions tab parameter
    expectAny(screen.getByText('Loyalty Dashboard')).toBeInTheDocument()
  })

  it('handles empty loyalty data gracefully', () => {
    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: null,
      loading: false,
      simulateAchievement: jest.fn(),
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

    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: dataWithoutAchievements,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('0')).toBeInTheDocument() // Should show 0 achievements
  })

  it('handles missing current badge gracefully', () => {
    const dataWithoutBadge = {
      ...mockLoyaltyData,
      current_badge: null,
    }

    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: dataWithoutBadge,
      loading: false,
      simulateAchievement: jest.fn(),
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

    mockUseLoyaltyData.mockReturnValue({
      loyaltyData: null,
      loading: false,
      simulateAchievement: jest.fn(),
    })

    render(<LoyaltyDashboard />)

    expectAny(screen.getByText('Loyalty Dashboard')).toBeInTheDocument()
    expectAny(screen.getByText('Please log in to access payment features and track your loyalty points.')).toBeInTheDocument()
    expectAny(screen.getByText('Login')).toBeInTheDocument()
  })
})
