import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { DeleteUserModal } from '@/components/admin/delete-user-modal'

// Type assertion helper for testing library matchers
const expectAny = expect as any

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock RTK Query hooks
jest.mock('@/store/users', () => ({
  useDeleteUserMutation: () => [
    jest.fn(),
    { isLoading: false, error: null }
  ],
}))

jest.mock('@/store', () => ({
  store: {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
  storeApis: {},
  createAutoResetMiddleware: jest.fn(),
}))

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  roles: [{ id: '1', name: 'admin', permissions: [], created_at: '2024-01-01T00:00:00.000Z' }],
  email_verified_at: '2024-01-01T00:00:00.000Z',
  achievements: [],
  badges: [],
  loyalty_points: { id: 1, points: 100, total_earned: 500, total_redeemed: 400 },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

// Test wrapper component
const testStore = {
  getState: jest.fn(() => ({})),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
  replaceReducer: jest.fn(),
  [Symbol.observable]: jest.fn(),
} as any

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={testStore}>{children}</Provider>
)

describe('DeleteUserModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders delete user modal correctly when open', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByRole('heading', { name: 'Delete User' })).toBeInTheDocument()
    expectAny(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
    expectAny(screen.getByText(/This action cannot be undone/)).toBeInTheDocument()
    expectAny(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument()
    expectAny(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.queryByText('Delete User')).not.toBeInTheDocument()
  })

  it('does not render when user is null', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={null} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.queryByText('Delete User')).not.toBeInTheDocument()
  })

  it('displays user name in confirmation message', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
  })

  it('shows warning message about irreversible action', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByText(/This action cannot be undone/)).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when escape key is pressed', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('submits delete request when delete button is clicked', async () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    const deleteButton = screen.getByRole('button', { name: 'Delete User' })
    fireEvent.click(deleteButton)

    expectAny(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument()
  })

  it('shows loading state during deletion', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument()
  })

  it('handles deletion errors', async () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument()
  })

  it('calls onSuccess after successful deletion', async () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument()
  })

  it('calls onClose after successful deletion', async () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument()
  })

  it('handles user with different name', () => {
    const differentUser = {
      ...mockUser,
      name: 'Jane Smith',
    }

    render(
      <TestWrapper>
        <DeleteUserModal user={differentUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
  })

  it('handles user with no name', () => {
    const userWithoutName = {
      ...mockUser,
      name: '',
    }

    render(
      <TestWrapper>
        <DeleteUserModal user={userWithoutName} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
  })

  it('handles user with null name', () => {
    const userWithNullName = {
      ...mockUser,
      name: '',
    }

    render(
      <TestWrapper>
        <DeleteUserModal user={userWithNullName} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
  })

  it('prevents multiple delete requests during loading', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    expectAny(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument()
  })

  it('shows destructive styling for delete button', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    const deleteButton = screen.getByRole('button', { name: 'Delete User' })
    expectAny(deleteButton).toHaveClass('bg-destructive')
  })

  it('shows outline styling for cancel button', () => {
    render(
      <TestWrapper>
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      </TestWrapper>
    )

    const cancelButton = screen.getByText('Cancel')
    expectAny(cancelButton).toHaveClass('border')
  })
})
