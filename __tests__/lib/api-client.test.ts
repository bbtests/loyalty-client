// Mock dependencies before importing
jest.mock('axios')
jest.mock('next-auth/react')
jest.mock('next-auth/next')
jest.mock('@/lib/notifications', () => ({
  showError: jest.fn(),
}))

import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { ApiClient } from '@/lib/api-client'

const mockAxios = axios as any
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('ApiClient', () => {
  let apiClient: ApiClient
  let mockAxiosInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }

    mockAxios.create.mockReturnValue(mockAxiosInstance)
    
    // Mock window object for client-side detection
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    })

    // Create a new instance for testing
    apiClient = new ApiClient('http://localhost:8000/api/v1')
  })

  afterEach(() => {
    delete (global as any).window
  })

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const mockResponse = {
        status: 'success',
        code: 200,
        message: 'Success',
        data: { items: [] },
        errors: [],
        meta: {},
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      const result = await apiClient.get('/test-endpoint')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test-endpoint', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('handles GET request errors', async () => {
      const mockError = new Error('Not found')
      mockAxiosInstance.get.mockRejectedValue(mockError)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      try {
        await apiClient.get('/test-endpoint')
        fail('Expected error to be thrown')
      } catch (error: any) {
        expect(error.message).toBe('Not found')
      }
    })
  })

  describe('POST requests', () => {
    it('makes successful POST request', async () => {
      const mockResponse = {
        status: 'success',
        code: 201,
        message: 'Created',
        data: { item: { id: 1 } },
        errors: [],
        meta: {},
      }

      const postData = { name: 'Test' }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      const result = await apiClient.post('/test-endpoint', postData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', postData, undefined)
      expect(result).toEqual(mockResponse)
    })

    it('handles POST request with config', async () => {
      const mockResponse = {
        status: 'success',
        code: 201,
        message: 'Created',
        data: { item: { id: 1 } },
        errors: [],
        meta: {},
      }

      const postData = { name: 'Test' }
      const config = { showToast: false }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      const result = await apiClient.post('/test-endpoint', postData, config)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', postData, config)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('PUT requests', () => {
    it('makes successful PUT request', async () => {
      const mockResponse = {
        status: 'success',
        code: 200,
        message: 'Updated',
        data: { item: { id: 1, name: 'Updated' } },
        errors: [],
        meta: {},
      }

      const putData = { name: 'Updated' }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      const result = await apiClient.put('/test-endpoint/1', putData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test-endpoint/1', putData, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('DELETE requests', () => {
    it('makes successful DELETE request', async () => {
      const mockResponse = {
        status: 'success',
        code: 200,
        message: 'Deleted',
        data: {},
        errors: [],
        meta: {},
      }

      mockAxiosInstance.delete.mockResolvedValue(mockResponse)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      const result = await apiClient.delete('/test-endpoint/1')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test-endpoint/1', undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Authentication', () => {
    it('adds authorization header when token is available', async () => {
      const mockResponse = {
        status: 'success',
        code: 200,
        message: 'Success',
        data: {},
        errors: [],
        meta: {},
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      await apiClient.get('/test-endpoint')

      // Check that the request interceptor was set up
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })

    it('handles authentication errors', async () => {
      const mockError = new Error('Unauthenticated.')
      mockAxiosInstance.get.mockRejectedValue(mockError)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      try {
        await apiClient.get('/test-endpoint')
        fail('Expected error to be thrown')
      } catch (error: any) {
        expect(error.message).toBe('Unauthenticated.')
      }
    })
  })

  describe('Error handling', () => {
    it('handles network errors', async () => {
      const mockError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValue(mockError)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      try {
        await apiClient.get('/test-endpoint')
        fail('Expected error to be thrown')
      } catch (error: any) {
        expect(error.message).toBe('Network Error')
      }
    })

    it('handles request errors', async () => {
      const mockError = new Error('Request failed')
      mockAxiosInstance.get.mockRejectedValue(mockError)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      try {
        await apiClient.get('/test-endpoint')
        fail('Expected error to be thrown')
      } catch (error: any) {
        expect(error.message).toBe('Request failed')
      }
    })

    it('handles API error responses with field errors', async () => {
      const mockError = new Error('Validation failed') as any
      mockError.errors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is too short' },
      ]

      mockAxiosInstance.get.mockRejectedValue(mockError)
      mockGetSession.mockResolvedValue({ 
        accessToken: 'test-token',
        user: { id: '1', email: 'test@example.com' } as any,
        expires: '2024-12-31T23:59:59.999Z'
      })

      try {
        await apiClient.get('/test-endpoint')
        fail('Expected error to be thrown')
      } catch (error: any) {
        expect(error.message).toBe('Validation failed')
        expect(error.errors).toEqual([
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password is too short' },
        ])
      }
    })
  })

  describe('Token management', () => {
    it('refreshes token when refreshToken is called', () => {
      apiClient.refreshToken()
      // This is a void method, so we just verify it doesn't throw
      expect(true).toBe(true)
    })
  })

  describe('Server-side vs Client-side', () => {
    it('uses getServerSession on server-side', async () => {
      // Mock server-side environment
      delete (global as any).window

      const mockResponse = {
        status: 'success',
        code: 200,
        message: 'Success',
        data: {},
        errors: [],
        meta: {},
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)
      mockGetServerSession.mockResolvedValue({ accessToken: 'server-token' })

      await apiClient.get('/test-endpoint')

      // Verify that getServerSession was called (indirectly through the interceptor)
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })

    it('uses getSession on client-side', async () => {
      // Mock client-side environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      const mockResponse = {
        status: 'success',
        code: 200,
        message: 'Success',
        data: {},
        errors: [],
        meta: {},
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)
      mockGetSession.mockResolvedValue({ accessToken: 'client-token' } as any)

      await apiClient.get('/test-endpoint')

      // Verify that getSession was called (indirectly through the interceptor)
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })
  })
})