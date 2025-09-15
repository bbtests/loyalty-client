import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { CreateUserModal } from '@/components/admin/create-user-modal'

// Mock DOM methods that Radix UI needs
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: jest.fn(() => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
  })),
  writable: true,
})

// Mock RTK Query hooks
jest.mock('@/store/users', () => ({
  useCreateUserMutation: () => [
    jest.fn(),
    { isLoading: false, error: null }
  ],
}))

jest.mock('@/store/roles', () => ({
  useGetRolesQuery: () => ({
    data: {
      data: {
        items: [
          { id: '1', name: 'admin', permissions: [], created_at: '2024-01-01T00:00:00.000Z' },
          { id: '2', name: 'user', permissions: [], created_at: '2024-01-01T00:00:00.000Z' },
          { id: '3', name: 'super admin', permissions: [], created_at: '2024-01-01T00:00:00.000Z' },
        ]
      }
    },
    isLoading: false,
    error: null
  }),
}))

// Mock the store for component tests
jest.mock('@/store', () => ({
  store: {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
  storeApis: {},
  createAutoResetMiddleware: jest.fn(),
}))

import { store } from '@/store'

// Type assertion helper for testing library matchers
const expectAny = expect as any

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Use the real store
const testStore = store

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={testStore}>{children}</Provider>
)

describe('CreateUserModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders create user modal correctly when open', () => {
    render(
      <TestWrapper>
        <CreateUserModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByText('Create New User')).toBeInTheDocument()
    expectAny(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expectAny(screen.getByLabelText('Email')).toBeInTheDocument()
    expectAny(screen.getByText('Role')).toBeInTheDocument()
    expectAny(screen.getByLabelText('Password')).toBeInTheDocument()
    expectAny(screen.getByText('Create User')).toBeInTheDocument()
    expectAny(screen.getByText('Cancel')).toBeInTheDocument()
  }, 10000) // 10 second timeout

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <CreateUserModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.queryByText('Create New User')).not.toBeInTheDocument()
  }, 10000) // 10 second timeout

  it('calls onClose when cancel button is clicked', async () => {
    render(
      <TestWrapper>
        <CreateUserModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    const cancelButton = screen.getByText('Cancel')
    
    await act(async () => {
      fireEvent.click(cancelButton)
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  }, 10000) // 10 second timeout

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <CreateUserModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    const submitButton = screen.getByText('Create User')
    
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Check for validation messages
    await waitFor(() => {
      expectAny(screen.getByText('Name is required')).toBeInTheDocument()
    }, { timeout: 5000 })
  }, 10000) // 10 second timeout

  it('validates password minimum length', async () => {
    render(
      <TestWrapper>
        <CreateUserModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText('Password')
    
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: '123' } })
    })

    const submitButton = screen.getByText('Create User')
    
    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expectAny(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    }, { timeout: 5000 })
  }, 10000) // 10 second timeout
})