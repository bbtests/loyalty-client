import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Login } from '@/components/login'

// Type assertion helper for testing library matchers
const expectAny = expect as any

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}))

const mockPush = jest.fn()
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })
  })

  it('renders login form correctly', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    render(<Login />)

    expectAny(screen.getByText('Login')).toBeInTheDocument()
    expectAny(screen.getByText('Sign in to access your account')).toBeInTheDocument()
    expectAny(screen.getByLabelText('Email')).toBeInTheDocument()
    expectAny(screen.getByLabelText('Password')).toBeInTheDocument()
    expectAny(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('redirects to admin page when user has admin role', () => {
  const mockSession = {
    user: {
      roles: [{ name: 'admin' }],
    },
    accessToken: 'mock-token',
    expires: '2024-12-31T23:59:59.999Z',
  }

    mockUseSession.mockReturnValue({
      data: mockSession as any,
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    render(<Login />)

    expectAny(mockPush).toHaveBeenCalledWith('/admin')
  })

  it('redirects to home page when user has no admin role', () => {
    const mockSession = {
      user: {
        roles: [{ name: 'user' }],
      },
    }

    mockUseSession.mockReturnValue({
      data: mockSession as any,
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    render(<Login />)

    expectAny(mockPush).toHaveBeenCalledWith('/')
  })

  it('redirects to admin page when user has super admin role', () => {
    const mockSession = {
      user: {
        roles: [{ name: 'super admin' }],
      },
    }

    mockUseSession.mockReturnValue({
      data: mockSession as any,
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    render(<Login />)

    expectAny(mockPush).toHaveBeenCalledWith('/admin')
  })

  it('handles form submission with valid credentials', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null,
    })

    render(<Login />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expectAny(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
    })
  })

  it('displays error message on invalid credentials', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'Invalid credentials',
      status: 401,
      url: null,
    })

    render(<Login />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expectAny(screen.getByText('Invalid credentials. Please check your email and password.')).toBeInTheDocument()
    })
  })

  it('displays error message on network error', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(<Login />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expectAny(screen.getByText('An error occurred during login. Please try again.')).toBeInTheDocument()
    })
  })

  it('toggles password visibility', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    render(<Login />)

    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

    expectAny(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)
    expectAny(passwordInput).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expectAny(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows loading state during form submission', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    // Create a promise that we can control
    let resolveSignIn: (value: any) => void
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve
    })
    mockSignIn.mockReturnValue(signInPromise as any)

    render(<Login />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Check loading state
    expectAny(screen.getByText('Signing in...')).toBeInTheDocument()
    expectAny(submitButton).toBeDisabled()

    // Resolve the promise
    resolveSignIn!({
      ok: true,
      error: null,
      status: 200,
      url: null,
    })

    await waitFor(() => {
      expectAny(screen.getByText('Sign In')).toBeInTheDocument()
      expectAny(submitButton).not.toBeDisabled()
    })
  })

  it('validates required fields', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    render(<Login />)

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission
    expectAny(mockSignIn).not.toHaveBeenCalled()
  })
})
