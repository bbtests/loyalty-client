import { render, screen, fireEvent, act } from '@testing-library/react'
import { ViewUserModal } from '@/components/admin/view-user-modal'

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

// Helper function to wrap user interactions in act()
const userEvent = async (callback: () => void) => {
  await act(async () => {
    callback()
  })
}

// Type assertion helper for testing library matchers
const expectAny = expect as any

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  roles: [{ id: '1', name: 'admin', permissions: [], created_at: '2024-01-01T00:00:00.000Z' }],
  email_verified_at: '2024-01-01T00:00:00.000Z',
  achievements: [
    {
      id: 1,
      name: 'First Purchase',
      description: 'Made your first purchase',
      badge_icon: 'shopping-cart',
      unlocked_at: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Loyal Customer',
      description: 'Made 10 purchases',
      badge_icon: 'star',
      unlocked_at: '2024-01-02T00:00:00.000Z',
    },
  ],
  badges: [
    {
      id: 1,
      name: 'Bronze',
      description: 'Bronze tier customer',
      tier: 1,
      icon: 'medal',
      earned_at: '2024-01-01T00:00:00.000Z',
    },
  ],
  loyalty_points: { id: 1, points: 100, total_earned: 500, total_redeemed: 400 },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

describe('ViewUserModal Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders view user modal correctly when open', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('User Details')).toBeInTheDocument()
    expectAny(screen.getByText('John Doe')).toBeInTheDocument()
    expectAny(screen.getByText('john@example.com')).toBeInTheDocument()
    expectAny(screen.getByText('Close')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={false} onClose={mockOnClose} />
    )

    expectAny(screen.queryByText('User Details')).not.toBeInTheDocument()
  })

  it('does not render when user is null', () => {
    render(
      <ViewUserModal user={null} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.queryByText('User Details')).not.toBeInTheDocument()
  })

  it('displays basic user information', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Basic Information')).toBeInTheDocument()
    expectAny(screen.getByText('John Doe')).toBeInTheDocument()
    expectAny(screen.getByText('john@example.com')).toBeInTheDocument()
    expectAny(screen.getByText('admin')).toBeInTheDocument()
  })

  it('displays loyalty points information', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Loyalty Points')).toBeInTheDocument()
    expectAny(screen.getByText('100')).toBeInTheDocument() // Available points
    expectAny(screen.getByText('500')).toBeInTheDocument() // Total earned
    expectAny(screen.getByText('400')).toBeInTheDocument() // Total redeemed
  })

  it('displays achievements', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText(/Achievements/)).toBeInTheDocument()
    expectAny(screen.getByText('First Purchase')).toBeInTheDocument()
    expectAny(screen.getByText('Made your first purchase')).toBeInTheDocument()
    expectAny(screen.getByText('Loyal Customer')).toBeInTheDocument()
    expectAny(screen.getByText('Made 10 purchases')).toBeInTheDocument()
  })

  it('displays badges', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText(/Badges/)).toBeInTheDocument()
    expectAny(screen.getByText('Bronze')).toBeInTheDocument()
    expectAny(screen.getByText('Bronze tier customer')).toBeInTheDocument()
  })

  it('handles user with no achievements', () => {
    const userWithoutAchievements = {
      ...mockUser,
      achievements: [],
    }

    render(
      <ViewUserModal user={userWithoutAchievements} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText(/Achievements/)).toBeInTheDocument()
    expectAny(screen.getByText('No achievements yet')).toBeInTheDocument()
  })

  it('handles user with no badges', () => {
    const userWithoutBadges = {
      ...mockUser,
      badges: [],
    }

    render(
      <ViewUserModal user={userWithoutBadges} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText(/Badges/)).toBeInTheDocument()
    expectAny(screen.getByText('No badges earned yet')).toBeInTheDocument()
  })

  it('handles user with no loyalty points', () => {
    const userWithoutPoints = {
      ...mockUser,
      loyalty_points: undefined,
    }

    render(
      <ViewUserModal user={userWithoutPoints} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Loyalty Points')).toBeInTheDocument()
    expectAny(screen.getAllByText('0')[0]).toBeInTheDocument() // Should show 0 for all values
  })

  it('handles user with no roles', () => {
    const userWithoutRoles = {
      ...mockUser,
      roles: [],
    }

    render(
      <ViewUserModal user={userWithoutRoles} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Basic Information')).toBeInTheDocument()
    expectAny(screen.getByText('No roles assigned')).toBeInTheDocument()
  })

  it('displays multiple roles', () => {
    const userWithMultipleRoles = {
      ...mockUser,
      roles: [
        { id: '1', name: 'admin', permissions: [], created_at: '2024-01-01T00:00:00.000Z' },
        { id: '2', name: 'user', permissions: [], created_at: '2024-01-01T00:00:00.000Z' },
      ],
    }

    render(
      <ViewUserModal user={userWithMultipleRoles} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('admin')).toBeInTheDocument()
    expectAny(screen.getByText('user')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when escape key is pressed', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('formats dates correctly', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    // Check that dates are displayed (exact format may vary based on implementation)
    expectAny(screen.getAllByText(/1\/1\/2024/)[0]).toBeInTheDocument()
  })

  it('handles user with null loyalty points gracefully', () => {
    const userWithNullPoints = {
      ...mockUser,
      loyalty_points: undefined,
    }

    render(
      <ViewUserModal user={userWithNullPoints} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Loyalty Points')).toBeInTheDocument()
    // Should not crash and should show 0 values
    expectAny(screen.getAllByText('0')[0]).toBeInTheDocument()
  })

  it('handles user with undefined achievements', () => {
    const userWithUndefinedAchievements = {
      ...mockUser,
      achievements: undefined,
    }

    render(
      <ViewUserModal user={userWithUndefinedAchievements} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText(/Achievements/)).toBeInTheDocument()
    expectAny(screen.getByText('No achievements yet')).toBeInTheDocument()
  })

  it('handles user with undefined badges', () => {
    const userWithUndefinedBadges = {
      ...mockUser,
      badges: undefined,
    }

    render(
      <ViewUserModal user={userWithUndefinedBadges} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText(/Badges/)).toBeInTheDocument()
    expectAny(screen.getByText('No badges earned yet')).toBeInTheDocument()
  })

  it('displays user creation and update dates', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Created')).toBeInTheDocument()
    expectAny(screen.getByText('Updated')).toBeInTheDocument()
  })

  it('handles user with missing name', () => {
    const userWithoutName = {
      ...mockUser,
      name: '',
    }

    render(
      <ViewUserModal user={userWithoutName} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Basic Information')).toBeInTheDocument()
    // Should handle empty name gracefully
  })

  it('handles user with missing email', () => {
    const userWithoutEmail = {
      ...mockUser,
      email: '',
    }

    render(
      <ViewUserModal user={userWithoutEmail} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Basic Information')).toBeInTheDocument()
    // Should handle empty email gracefully
  })

  it('shows proper section headers', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    expectAny(screen.getByText('Basic Information')).toBeInTheDocument()
    expectAny(screen.getByText('Loyalty Points')).toBeInTheDocument()
    expectAny(screen.getByText(/Achievements/)).toBeInTheDocument()
    expectAny(screen.getByText(/Badges/)).toBeInTheDocument()
  })

  it('displays achievement unlock dates', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    // Should show unlock dates for achievements
    expectAny(screen.getByText(/Unlocked: 1\/1\/2024/)).toBeInTheDocument()
    expectAny(screen.getByText(/Unlocked: 1\/2\/2024/)).toBeInTheDocument()
  })

  it('displays badge earn dates', () => {
    render(
      <ViewUserModal user={mockUser} isOpen={true} onClose={mockOnClose} />
    )

    // Should show earn dates for badges
    expectAny(screen.getByText(/Earned: 1\/1\/2024/)).toBeInTheDocument()
  })
})
