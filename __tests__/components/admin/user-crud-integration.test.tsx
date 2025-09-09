import { render, screen } from '@testing-library/react'
import { UserManagement } from '@/components/admin/user-management'
import { CreateUserModal } from '@/components/admin/create-user-modal'
import { EditUserModal } from '@/components/admin/edit-user-modal'
import { DeleteUserModal } from '@/components/admin/delete-user-modal'
import { ViewUserModal } from '@/components/admin/view-user-modal'

// Type assertion helper for testing library matchers
const expectAny = expect as any

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock the RTK Query hooks
jest.mock('@/store/users', () => ({
  useGetUsersQuery: jest.fn(() => ({
    data: {
      data: {
        items: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            roles: [{ id: '1', name: 'admin' }],
            email_verified_at: '2024-01-01T00:00:00.000Z',
            achievements: [],
            badges: [],
            loyalty_points: { id: 1, points: 100, total_earned: 500, total_redeemed: 400 },
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
      meta: {
        pagination: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      },
    },
    isLoading: false,
    refetch: jest.fn(),
  })),
  useCreateUserMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useUpdateUserMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteUserMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

jest.mock('@/store/roles', () => ({
  useGetRolesQuery: jest.fn(() => ({
    data: {
      data: {
        items: [
          {
            id: '1',
            name: 'admin',
            permissions: [],
            created_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: '2',
            name: 'user',
            permissions: [],
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
    isLoading: false,
  })),
}))

describe('User CRUD Integration Tests', () => {
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

  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('UserManagement Component', () => {
    it('renders user management interface', () => {
      render(<UserManagement />)

      expectAny(screen.getByText('User Management')).toBeInTheDocument()
      expectAny(screen.getByText('Manage customer accounts and loyalty data')).toBeInTheDocument()
      expectAny(screen.getByPlaceholderText('Search users...')).toBeInTheDocument()
      expectAny(screen.getByText('Create User')).toBeInTheDocument()
    })

    it('displays user data in table', () => {
      render(<UserManagement />)
      
      expectAny(screen.getByText('John Doe')).toBeInTheDocument()
      expectAny(screen.getByText('john@example.com')).toBeInTheDocument()
      expectAny(screen.getByText('100')).toBeInTheDocument() // loyalty points
      expectAny(screen.getByText('500 earned')).toBeInTheDocument() // total earned
    })

    it('shows pagination information', () => {
      render(<UserManagement />)

      expectAny(screen.getByText('Showing 1 to 1 of 1 users')).toBeInTheDocument()
    })
  })

  describe('CreateUserModal Component', () => {
    it('renders create user form when open', () => {
      render(
        <CreateUserModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.getByText('Create New User')).toBeInTheDocument()
      expectAny(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expectAny(screen.getByLabelText('Email')).toBeInTheDocument()
      expectAny(screen.getByText('Role')).toBeInTheDocument()
      expectAny(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <CreateUserModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.queryByText('Create New User')).not.toBeInTheDocument()
    })

    it('shows create and cancel buttons', () => {
      render(
        <CreateUserModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.getByText('Create User')).toBeInTheDocument()
      expectAny(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('EditUserModal Component', () => {
    it('renders edit user form when open', () => {
      render(
        <EditUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.getByText('Edit User')).toBeInTheDocument()
      expectAny(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expectAny(screen.getByLabelText('Email')).toBeInTheDocument()
      expectAny(screen.getByText('Role')).toBeInTheDocument()
      expectAny(screen.getByLabelText('New Password (Optional)')).toBeInTheDocument()
    })

    it('pre-populates form with user data', () => {
      render(
        <EditUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expectAny(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <EditUserModal user={mockUser} isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.queryByText('Edit User')).not.toBeInTheDocument()
    })

    it('shows update and cancel buttons', () => {
      render(
        <EditUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.getByText('Update User')).toBeInTheDocument()
      expectAny(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('DeleteUserModal Component', () => {
    it('renders delete confirmation when open', () => {
      render(
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.getByRole('heading', { name: 'Delete User' })).toBeInTheDocument()
      expectAny(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
      expectAny(screen.getByText(/This action cannot be undone/)).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <DeleteUserModal user={mockUser} isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.queryByText('Delete User')).not.toBeInTheDocument()
    })

    it('shows delete and cancel buttons', () => {
      render(
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )

      expectAny(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument()
      expectAny(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('ViewUserModal Component', () => {
    it('renders user details when open', () => {
      render(
        <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
      )

      expectAny(screen.getByText('User Details')).toBeInTheDocument()
      expectAny(screen.getByText('John Doe')).toBeInTheDocument()
      expectAny(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <ViewUserModal user={mockUser} isOpen={false} onClose={mockOnClose} />
      )

      expectAny(screen.queryByText('User Details')).not.toBeInTheDocument()
    })

    it('shows close button', () => {
      render(
        <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
      )

      expectAny(screen.getByText('Close')).toBeInTheDocument()
    })

    it('displays user information sections', () => {
      render(
        <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
      )

      expectAny(screen.getByText('Basic Information')).toBeInTheDocument()
      expectAny(screen.getByText('Loyalty Points')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('all modals can be rendered independently', () => {
      const { rerender } = render(
        <CreateUserModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )
      expectAny(screen.getByText('Create New User')).toBeInTheDocument()

      rerender(
        <EditUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )
      expectAny(screen.getByText('Edit User')).toBeInTheDocument()

      rerender(
        <DeleteUserModal user={mockUser} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )
      expectAny(screen.getAllByText('Delete User')[0]).toBeInTheDocument()

      rerender(
        <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
      )
      expectAny(screen.getByText('User Details')).toBeInTheDocument()
    })

    it('handles null user gracefully', () => {
      render(
        <EditUserModal user={null} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )
      expectAny(screen.queryByText('Edit User')).not.toBeInTheDocument()

      render(
        <DeleteUserModal user={null} isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      )
      expectAny(screen.queryByText('Delete User')).not.toBeInTheDocument()

      render(
        <ViewUserModal user={null} isOpen={true} onClose={mockOnClose} />
      )
      expectAny(screen.queryByText('User Details')).not.toBeInTheDocument()
    })
  })
})
