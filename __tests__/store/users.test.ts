import { configureStore } from '@reduxjs/toolkit'
import { users } from '@/store/users'
import { createAutoResetMiddleware } from '@/store/index'
import { apiClient } from '@/lib/api-client'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    refreshToken: jest.fn(),
  },
}))

const mockApiClient = apiClient as any

describe('Users Store', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [users.reducerPath]: users.reducer,
      } as any,
      middleware: (getDefaultMiddleware) =>
        (getDefaultMiddleware() as any).concat([
          createAutoResetMiddleware({ users }),
          users.middleware,
        ]),
    })
    jest.clearAllMocks()
  })

  describe('getAll query', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          roles: [{ id: '1', name: 'admin' }],
          created_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          roles: [{ id: '2', name: 'user' }],
          created_at: '2024-01-01T00:00:00.000Z',
        },
      ]

      const mockResponse = {
        status: "success",
        code: 200,
        message: 'Users fetched successfully.',
        data: {
          items: mockUsers,
        },
        errors: [],
        meta: {
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 2,
            from: 1,
            to: 2,
          },
        },
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await store.dispatch(users.endpoints.getAll.initiate({ page: 1 }))

      expect(result.data).toEqual(mockResponse)
      expect(mockApiClient.get).toHaveBeenCalledWith('/users?page=1')
    })

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        status: "success",
        code: 200,
        message: 'Users fetched successfully.',
        data: { items: [] },
        errors: [],
        meta: { pagination: { current_page: 2, last_page: 3, per_page: 10, total: 25 } },
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      await store.dispatch(users.endpoints.getAll.initiate({ page: 2, per_page: 10 }))

      expect(mockApiClient.get).toHaveBeenCalledWith('/users?page=2&per_page=10')
    })

    it('should handle search parameters', async () => {
      const mockResponse = {
        status: "success",
        code: 200,
        message: 'Users fetched successfully.',
        data: { items: [] },
        errors: [],
        meta: { pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 } },
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      await store.dispatch(users.endpoints.getAll.initiate({ search: 'john' }))

      expect(mockApiClient.get).toHaveBeenCalledWith('/users?search=john')
    })

    it('should handle API errors', async () => {
      const mockError = new Error('Failed to fetch users')
      mockApiClient.get.mockRejectedValue(mockError)

      const result = await store.dispatch(users.endpoints.getAll.initiate({ page: 1 }))

      expect(result.error).toBeDefined()
    })
  })

  describe('getById query', () => {
    it('should fetch single user successfully', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        roles: [{ id: '1', name: 'admin' }],
        created_at: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        status: "success",
        code: 200,
        message: 'User retrieved successfully.',
        data: {
          item: mockUser,
        },
        errors: [],
        meta: {},
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await store.dispatch(users.endpoints.getById.initiate('1'))

      expect(result.data).toEqual(mockUser)
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1')
    })

    it('should handle user not found', async () => {
      const mockError = new Error('User not found')
      mockApiClient.get.mockRejectedValue(mockError)

      const result = await store.dispatch(users.endpoints.getById.initiate('999'))

      expect(result.error).toBeDefined()
    })
  })

  describe('create mutation', () => {
    it('should create user successfully', async () => {
      const newUser: any = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role_id: '1',
      }

      const mockCreatedUser = {
        id: '3',
        name: 'New User',
        email: 'new@example.com',
        roles: [{ id: '1', name: 'admin' }],
        created_at: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        status: "success",
        code: 201,
        message: 'User created successfully.',
        data: {
          item: mockCreatedUser,
        },
        errors: [],
        meta: {},
      }

      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await store.dispatch(users.endpoints.create.initiate(newUser))

      expect(result.data).toEqual(mockCreatedUser)
      expect(mockApiClient.post).toHaveBeenCalledWith('/users', newUser)
    })

    it('should handle validation errors', async () => {
      const invalidUser: any = {
        name: '',
        email: 'invalid-email',
        password: '123',
        role_id: '1',
      }

      const mockError = {
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password must be at least 8 characters' },
        ],
      }

      mockApiClient.post.mockRejectedValue(mockError)

      const result = await store.dispatch(users.endpoints.create.initiate(invalidUser))

      expect(result.error).toBeDefined()
    })

    it('should handle duplicate email error', async () => {
      const duplicateUser: any = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role_id: '1',
      }

      const mockError = new Error('Email already exists')
      mockApiClient.post.mockRejectedValue(mockError)

      const result = await store.dispatch(users.endpoints.create.initiate(duplicateUser))

      expect(result.error).toBeDefined()
    })
  })

  describe('update mutation', () => {
    it('should update user successfully', async () => {
      const updateData = {
        id: '1',
        name: 'Updated User',
        email: 'updated@example.com',
        role_id: '2',
      }

      const mockUpdatedUser = {
        id: '1',
        name: 'Updated User',
        email: 'updated@example.com',
        roles: [{ id: '2', name: 'user' }],
        updated_at: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        status: "success",
        code: 200,
        message: 'User updated successfully.',
        data: {
          item: mockUpdatedUser,
        },
        errors: [],
        meta: {},
      }

      mockApiClient.put.mockResolvedValue(mockResponse)

      const result = await store.dispatch(users.endpoints.update.initiate({ id: '1', data: updateData }))

      expect(result.data).toEqual(mockUpdatedUser)
      expect(mockApiClient.put).toHaveBeenCalledWith('/users/1', {
        id: '1',
        name: 'Updated User',
        email: 'updated@example.com',
        role_id: '2',
      })
    })

    it('should update user with new password', async () => {
      const updateData: any = {
        id: '1',
        name: 'Updated User',
        email: 'updated@example.com',
        role_id: '1',
        password: 'newpassword123',
      }

      const mockResponse = {
        status: "success",
        code: 200,
        message: 'User updated successfully.',
        data: {
          item: {
            id: '1',
            name: 'Updated User',
            email: 'updated@example.com',
            roles: [{ id: '1', name: 'admin' }],
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        },
        errors: [],
        meta: {},
      }

      mockApiClient.put.mockResolvedValue(mockResponse)

      const result = await store.dispatch(users.endpoints.update.initiate({ id: '1', data: updateData }))

      expect(result.data).toEqual(mockResponse.data.item)
      expect(mockApiClient.put).toHaveBeenCalledWith('/users/1', {
        id: '1',
        name: 'Updated User',
        email: 'updated@example.com',
        role_id: '1',
        password: 'newpassword123',
      })
    })

    it('should handle update errors', async () => {
      const updateData = {
        id: '1',
        name: 'Updated User',
        email: 'invalid-email',
        role_id: '1',
      }

      const mockError = new Error('Invalid email format')
      mockApiClient.put.mockRejectedValue(mockError)

      const result = await store.dispatch(users.endpoints.update.initiate({ id: '1', data: updateData }))

      expect(result.error).toBeDefined()
    })
  })

  describe('delete mutation', () => {
    it('should delete user successfully', async () => {
      const mockResponse = {
        status: "success",
        code: 200,
        message: 'User deleted successfully.',
        data: { success: true },
        errors: [],
        meta: {},
      }

      mockApiClient.delete.mockResolvedValue(mockResponse)

      const result = await store.dispatch(users.endpoints.delete.initiate('1'))

      expect(result.data).toEqual({ success: true })
      expect(mockApiClient.delete).toHaveBeenCalledWith('/users/1')
    })

    it('should handle delete errors', async () => {
      const mockError = new Error('User not found')
      mockApiClient.delete.mockRejectedValue(mockError)

      const result = await store.dispatch(users.endpoints.delete.initiate('999'))

      expect(result.error).toBeDefined()
    })

    it('should handle unauthorized delete', async () => {
      const mockError = new Error('Unauthorized')
      mockApiClient.delete.mockRejectedValue(mockError)

      const result = await store.dispatch(users.endpoints.delete.initiate('1'))

      expect(result.error).toBeDefined()
    })
  })

  describe('caching behavior', () => {
    it('should cache successful queries', async () => {
      const mockResponse = {
        status: "success",
        code: 200,
        message: 'Users fetched successfully.',
        data: { items: [] },
        errors: [],
        meta: { pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 } },
      }

      mockApiClient.get.mockResolvedValue(mockResponse)

      // First call
      await store.dispatch(users.endpoints.getAll.initiate({ page: 1 }))
      
      // Second call should use cache
      const result = await store.dispatch(users.endpoints.getAll.initiate({ page: 1 }))

      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
      expect(result.data).toEqual(mockResponse)
    })

    it('should use cache for subsequent queries', async () => {
      const mockUsersResponse = {
        status: "success",
        code: 200,
        message: 'Users fetched successfully.',
        data: { items: [] },
        errors: [],
        meta: { pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 } },
      }

      const mockCreateResponse = {
        status: "success",
        code: 201,
        message: 'User created successfully.',
        data: {
          item: {
            id: '3',
            name: 'New User',
            email: 'new@example.com',
            roles: [{ id: '1', name: 'admin' }],
            created_at: '2024-01-01T00:00:00.000Z',
          },
        },
        errors: [],
        meta: {},
      }

      mockApiClient.get.mockResolvedValue(mockUsersResponse)
      mockApiClient.post.mockResolvedValue(mockCreateResponse)

      // Fetch users
      await store.dispatch(users.endpoints.getAll.initiate({ page: 1 }))
      
      // Create user
      await store.dispatch(users.endpoints.create.initiate({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role_id: '1',
      } as any))

      // Fetch users again - should use cache (no new API call)
      await store.dispatch(users.endpoints.getAll.initiate({ page: 1 }))

      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading states', () => {
    it('should track loading state for queries', async () => {
      const mockResponse = {
        status: "success",
        code: 200,
        message: 'Users fetched successfully.',
        data: { items: [] },
        errors: [],
        meta: { pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 } },
      }

      // Create a promise that we can control
      let resolvePromise: (value: any) => void
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockApiClient.get.mockReturnValue(controlledPromise as any)

      // Start the query
      const queryPromise = store.dispatch(users.endpoints.getAll.initiate({ page: 1 }))

      // Check loading state
      const state = store.getState()
      const queryState = state[users.reducerPath].queries['getAll({"page":1})']
      expect(queryState?.status).toBe('pending')

      // Resolve the promise
      resolvePromise!(mockResponse)
      await queryPromise

      // Check final state
      const finalState = store.getState()
      const finalQueryState = finalState[users.reducerPath].queries['getAll({"page":1})']
      expect(finalQueryState?.status).toBe('fulfilled')
    })

    it('should track loading state for mutations', async () => {
      const mockResponse = {
        status: "success",
        code: 201,
        message: 'User created successfully.',
        data: {
          item: {
            id: '3',
            name: 'New User',
            email: 'new@example.com',
            roles: [{ id: '1', name: 'admin' }],
            created_at: '2024-01-01T00:00:00.000Z',
          },
        },
        errors: [],
        meta: {},
      }

      // Create a promise that we can control
      let resolvePromise: (value: any) => void
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockApiClient.post.mockReturnValue(controlledPromise as any)

      // Start the mutation
      const mutationPromise = store.dispatch(users.endpoints.create.initiate({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role_id: '1',
      } as any))

      // Check loading state
      const state = store.getState()
      const mutationState = state[users.reducerPath].mutations[Object.keys(state[users.reducerPath].mutations)[0]]
      expect(mutationState?.status).toBe('pending')

      // Resolve the promise
      resolvePromise!(mockResponse)
      await mutationPromise

      // Check final state
      const finalState = store.getState()
      const finalMutationState = finalState[users.reducerPath].mutations[Object.keys(finalState[users.reducerPath].mutations)[0]]
      expect(finalMutationState?.status).toBe('fulfilled')
    })
  })
})
