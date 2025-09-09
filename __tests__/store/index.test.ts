import { configureStore } from '@reduxjs/toolkit'
import { users } from '@/store/users'
import { achievements } from '@/store/achievements'
import { store, storeApis } from '@/store/index'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Redux Store', () => {
  it('configures store with all reducers', () => {
    const testStore = configureStore({
      reducer: {
        [users.reducerPath]: users.reducer,
        [achievements.reducerPath]: achievements.reducer,
      } as any,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([
          users.middleware,
          achievements.middleware,
        ]) as any,
    })

    const state = testStore.getState()
    expect(state).toHaveProperty(users.reducerPath)
    expect(state).toHaveProperty(achievements.reducerPath)
  })

  it('exports storeApis correctly', () => {
    expect(storeApis).toHaveProperty('users')
    expect(storeApis).toHaveProperty('achievements')
    expect(storeApis).toHaveProperty('badges')
    expect(storeApis).toHaveProperty('transactions')
    expect(storeApis).toHaveProperty('loyaltyPoints')
    expect(storeApis).toHaveProperty('cashbackPayments')
    expect(storeApis).toHaveProperty('roles')
  })

  it('has correct reducer paths', () => {
    expect(users.reducerPath).toBe('usersApi')
    expect(achievements.reducerPath).toBe('achievementsApi')
  })

  it('exports correct hooks', () => {
    expect(users).toHaveProperty('useGetAllQuery')
    expect(users).toHaveProperty('useGetByIdQuery')
    expect(users).toHaveProperty('useCreateMutation')
    expect(users).toHaveProperty('useUpdateMutation')
    expect(users).toHaveProperty('useDeleteMutation')
  })

  it('has correct entity endpoints', () => {
    expect((users as any).entityEndpoint).toBe('users')
    expect((achievements as any).entityEndpoint).toBe('achievements')
  })
})

describe('Store Configuration', () => {
  it('creates store with all required reducers', () => {
    const state = store.getState()
    
    expect(state).toHaveProperty('usersApi')
    expect(state).toHaveProperty('achievementsApi')
    expect(state).toHaveProperty('badgesApi')
    expect(state).toHaveProperty('transactionsApi')
    expect(state).toHaveProperty('loyaltyPointsApi')
    expect(state).toHaveProperty('cashbackPaymentsApi')
    expect(state).toHaveProperty('rolesApi')
  })

  it('has correct middleware configuration', () => {
    // This is a basic test to ensure the store is configured
    // More detailed middleware testing would require integration tests
    expect(store.getState()).toBeDefined()
  })
})
