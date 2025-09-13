import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

// Make Jest globals available
global.jest = jest
global.describe = describe
global.it = it
global.test = test
global.expect = expect
global.beforeEach = beforeEach
global.afterEach = afterEach
global.beforeAll = beforeAll
global.afterAll = afterAll

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js session
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock Next.js server session
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
  },
}))

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock React Redux Provider with proper RTK Query support
jest.mock('react-redux', () => {
  const actualRedux = jest.requireActual('react-redux')
  return {
    ...actualRedux,
    Provider: ({ children }) => children,
    useDispatch: jest.fn(() => jest.fn()),
    useSelector: jest.fn((selector) => selector({})),
    useStore: jest.fn(() => ({
      getState: jest.fn(() => ({})),
      dispatch: jest.fn(),
      subscribe: jest.fn(),
    })),
  }
})

// Create a mock that can be controlled by tests
let mockLoyaltyData = {
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
      description: 'Made 10 purchases',
      badge_icon: 'heart',
      unlocked_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 3,
      name: 'Big Spender',
      description: 'Spent over ₦50,000',
      badge_icon: 'dollar-sign',
      unlocked_at: '2024-02-01T00:00:00Z',
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
      description: 'You are a valued customer',
      icon: 'silver-medal',
      tier: 2,
      earned_at: '2024-01-15T00:00:00Z',
    },
  ],
  current_badge: {
    id: 2,
    name: 'Silver Member',
    tier: 2,
    icon: 'silver-medal',
  },
}

let mockIsLoading = false
let mockRefetch = jest.fn()

// Function to simulate points increase
const simulatePointsIncrease = () => {
  if (mockLoyaltyData && mockLoyaltyData.points) {
    mockLoyaltyData = {
      ...mockLoyaltyData,
      points: {
        ...mockLoyaltyData.points,
        available: mockLoyaltyData.points.available + 500,
        total_earned: mockLoyaltyData.points.total_earned + 500,
      }
    }
  }
}

// Payment mutation mocks - can be controlled by tests
let mockInitializePaymentSuccess = true
let mockVerifyPaymentSuccess = true
let mockProcessPurchaseSuccess = true

const mockInitializePayment = jest.fn().mockReturnValue({
  unwrap: jest.fn().mockImplementation(() => {
    if (mockInitializePaymentSuccess) {
      return Promise.resolve({
        data: { reference: 'test_ref_123' },
        reference: 'test_ref_123'
      })
    } else {
      return Promise.reject(new Error('Payment initialization failed'))
    }
  })
})

const mockVerifyPayment = jest.fn().mockReturnValue({
  unwrap: jest.fn().mockImplementation(() => {
    if (mockVerifyPaymentSuccess) {
      return Promise.resolve({
        data: { 
          status: 'success', 
          amount: 100, 
          transaction_id: 'test_txn_123' 
        },
        status: 'success',
        amount: 100,
        transaction_id: 'test_txn_123'
      })
    } else {
      return Promise.reject(new Error('Payment verification failed'))
    }
  })
})

const mockProcessPurchase = jest.fn().mockReturnValue({
  unwrap: jest.fn().mockImplementation(() => {
    if (mockProcessPurchaseSuccess) {
      simulatePointsIncrease()
      return Promise.resolve({
        id: 1,
        amount: 100,
        points_earned: 500,
        transaction_type: 'purchase',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        reference: 'test_ref_123'
      })
    } else {
      return Promise.reject(new Error('Purchase processing failed'))
    }
  })
})

// Mock RTK Query hooks to prevent middleware warnings
jest.mock('@/store/loyalty', () => ({
  loyaltyApi: {
    reducerPath: 'loyaltyApi',
    reducer: jest.fn((state = {}, action) => state),
    middleware: jest.fn(() => (next) => (action) => next(action)),
  },
  useGetUserLoyaltyDataQuery: jest.fn(() => ({
    data: mockLoyaltyData,
    isLoading: mockIsLoading,
    error: null,
    refetch: mockRefetch,
  })),
  useGetPaymentProvidersQuery: jest.fn(() => ({
    data: { paystack: {}, flutterwave: {}, mock: {} },
    isLoading: false,
    error: null,
  })),
  useGetPaymentProviderPublicKeyQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useInitializePaymentMutation: jest.fn(() => [
    mockInitializePayment, 
    { isLoading: false, error: null }
  ]),
  useVerifyPaymentMutation: jest.fn(() => [
    mockVerifyPayment, 
    { isLoading: false, error: null }
  ]),
  useProcessPurchaseAfterPaymentMutation: jest.fn(() => [
    mockProcessPurchase, 
    { isLoading: false, error: null }
  ]),
  useGetUserTransactionsQuery: jest.fn(() => ({
    data: { data: [], pagination: {} },
    isLoading: false,
    error: null,
  })),
  useGetUserCashbackPaymentsQuery: jest.fn(() => ({
    data: { data: [], pagination: {} },
    isLoading: false,
    error: null,
  })),
  useRedeemPointsMutation: jest.fn(() => [jest.fn(), { isLoading: false, error: null }]),
}))

// Mock achievements store
jest.mock('@/store/achievements', () => ({
  achievements: {
    reducerPath: 'achievementsApi',
    reducer: jest.fn((state = {}, action) => state),
    middleware: jest.fn(() => (next) => (action) => next(action)),
    entityEndpoint: 'achievements',
  },
  useGetAchievementsQuery: jest.fn(() => ({
    data: [
      {
        id: 1,
        name: 'First Purchase',
        description: 'Made your first purchase',
        badge_icon: 'trophy',
        is_active: true,
        criteria: { transaction_count: 1 }
      },
      {
        id: 2,
        name: 'Loyal Customer',
        description: 'Made 10 purchases',
        badge_icon: 'heart',
        is_active: true,
        criteria: { transaction_count: 10 }
      },
      {
        id: 3,
        name: 'Big Spender',
        description: 'Spent over ₦50,000',
        badge_icon: 'dollar-sign',
        is_active: true,
        criteria: { single_transaction_amount: 50000 }
      }
    ],
    isLoading: false,
    error: null,
  })),
}))

// Mock badges store
jest.mock('@/store/badges', () => ({
  badges: {
    reducerPath: 'badgesApi',
    reducer: jest.fn((state = {}, action) => state),
    middleware: jest.fn(() => (next) => (action) => next(action)),
    entityEndpoint: 'badges',
  },
  useGetBadgesQuery: jest.fn(() => ({
    data: [
      {
        id: 1,
        name: 'Bronze Member',
        description: 'Welcome to our loyalty program',
        icon: 'medal',
        tier: 1,
        is_active: true,
        requirements: { points_minimum: 0, purchases_minimum: 0 }
      },
      {
        id: 2,
        name: 'Silver Member',
        description: 'Reach 2500 points',
        icon: 'star',
        tier: 2,
        is_active: true,
        requirements: { points_minimum: 2500, purchases_minimum: 0 }
      },
      {
        id: 3,
        name: 'Gold Member',
        description: 'Reach 10000 points',
        icon: 'crown',
        tier: 3,
        is_active: true,
        requirements: { points_minimum: 10000, purchases_minimum: 0 }
      },
      {
        id: 4,
        name: 'Platinum Member',
        description: 'Reach 25000 points',
        icon: 'award',
        tier: 4,
        is_active: true,
        requirements: { points_minimum: 25000, purchases_minimum: 0 }
      }
    ],
    isLoading: false,
    error: null,
  })),
}))

// Export mock control functions for tests
global.mockLoyaltyData = mockLoyaltyData
global.mockIsLoading = mockIsLoading
global.mockRefetch = mockRefetch
global.setMockLoyaltyData = (data) => { mockLoyaltyData = data }
global.setMockIsLoading = (loading) => { mockIsLoading = loading }
global.setMockRefetch = (refetchFn) => { mockRefetch = refetchFn }
global.simulatePointsIncrease = simulatePointsIncrease

// Payment mock controls
global.setMockInitializePaymentSuccess = (success) => { mockInitializePaymentSuccess = success }
global.setMockVerifyPaymentSuccess = (success) => { mockVerifyPaymentSuccess = success }
global.setMockProcessPurchaseSuccess = (success) => { mockProcessPurchaseSuccess = success }
global.resetPaymentMocks = () => {
  mockInitializePaymentSuccess = true
  mockVerifyPaymentSuccess = true
  mockProcessPurchaseSuccess = true
}
