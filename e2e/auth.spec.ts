import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login')
  })

  test('displays login form correctly', async ({ page }) => {
    // Check if login form elements are present
    await expect(page.getByText('Login')).toBeVisible()
    await expect(page.getByText('Sign in to access your account')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('shows validation errors for empty form submission', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Check for HTML5 validation (browser will show required field messages)
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password')
    
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Wait for error message
    await expect(page.getByText('Invalid credentials. Please check your email and password.')).toBeVisible()
  })

  test('toggles password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('Password')
    const toggleButton = page.locator('button').filter({ hasText: '' }).first() // Eye icon button
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    await toggleButton.click()
    
    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click toggle button again
    await toggleButton.click()
    
    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('shows loading state during login', async ({ page }) => {
    // Fill in credentials
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    
    // Submit form and check for loading state
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should show loading state (this might be brief, so we check immediately)
    await expect(page.getByText('Signing in...')).toBeVisible()
  })

  test('redirects to admin page for admin users', async ({ page }) => {
    // Mock successful login with admin role
    await page.route('**/api/auth/signin/credentials', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          error: null,
          url: null,
        }),
      })
    })

    // Mock session data with admin role
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          roles: [{ name: 'admin' }],
        },
        accessToken: 'mock-token',
      }))
    })

    // Fill in credentials
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('adminpassword')
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should redirect to admin page
    await expect(page).toHaveURL('/admin')
  })

  test('redirects to home page for regular users', async ({ page }) => {
    // Mock successful login with user role
    await page.route('**/api/auth/signin/credentials', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          error: null,
          url: null,
        }),
      })
    })

    // Mock session data with user role
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          roles: [{ name: 'user' }],
        },
        accessToken: 'mock-token',
      }))
    })

    // Fill in credentials
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('userpassword')
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should redirect to home page
    await expect(page).toHaveURL('/')
  })

  test('handles network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/signin/credentials', async (route) => {
      await route.abort('failed')
    })

    // Fill in credentials
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should show error message
    await expect(page.getByText('An error occurred during login. Please try again.')).toBeVisible()
  })

  test('form is accessible', async ({ page }) => {
    // Check for proper labels and ARIA attributes
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password')
    const submitButton = page.getByRole('button', { name: 'Sign In' })
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
    
    // Check that inputs have proper types
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('login form is responsive', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if form is still visible and usable
    await expect(page.getByText('Login')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Check if form is still visible and usable
    await expect(page.getByText('Login')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })
})
