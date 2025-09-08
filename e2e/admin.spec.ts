import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          id: 1,
          email: 'admin@example.com',
          roles: [{ name: 'admin' }],
        },
        accessToken: 'mock-admin-token',
      }))
    })

    // Navigate to admin page
    await page.goto('/admin')
  })

  test('displays admin dashboard correctly', async ({ page }) => {
    // Check main admin elements
    await expect(page.getByText('Loyalty Program Admin')).toBeVisible()
    await expect(page.getByText('Manage customers and program performance')).toBeVisible()
    
    // Check logout button
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  })

  test('shows loading state initially', async ({ page }) => {
    // The admin dashboard should show loading spinner initially
    await expect(page.locator('.animate-spin')).toBeVisible()
  })

  test('displays all admin tabs', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForTimeout(1000)
    
    // Check all tab triggers are present
    await expect(page.getByText('Overview')).toBeVisible()
    await expect(page.getByText('Users')).toBeVisible()
    await expect(page.getByText('Analytics')).toBeVisible()
    await expect(page.getByText('Settings')).toBeVisible()
  })

  test('navigates between admin tabs correctly', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Test tab navigation
    await page.getByText('Users').click()
    await expect(page.getByText('Users')).toBeVisible()
    
    await page.getByText('Analytics').click()
    await expect(page.getByText('Analytics')).toBeVisible()
    
    await page.getByText('Settings').click()
    await expect(page.getByText('Settings')).toBeVisible()
    
    await page.getByText('Overview').click()
    await expect(page.getByText('Overview')).toBeVisible()
  })

  test('handles logout correctly', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Mock logout response
    await page.route('**/api/auth/signout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    })
    
    // Click logout button
    await page.getByRole('button', { name: 'Logout' }).click()
    
    // Should redirect to login page
    await expect(page).toHaveURL('/auth/login')
  })

  test('redirects non-admin users to home page', async ({ page }) => {
    // Mock non-admin user
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          id: 2,
          email: 'user@example.com',
          roles: [{ name: 'user' }],
        },
        accessToken: 'mock-user-token',
      }))
    })

    await page.goto('/admin')
    
    // Should redirect to home page
    await expect(page).toHaveURL('/')
  })

  test('redirects unauthenticated users to login page', async ({ page }) => {
    // Clear authentication
    await page.addInitScript(() => {
      window.localStorage.removeItem('next-auth.session')
    })

    await page.goto('/admin')
    
    // Should redirect to login page
    await expect(page).toHaveURL('/auth/login')
  })

  test('allows super admin access', async ({ page }) => {
    // Mock super admin user
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          id: 1,
          email: 'superadmin@example.com',
          roles: [{ name: 'super admin' }],
        },
        accessToken: 'mock-super-admin-token',
      }))
    })

    await page.goto('/admin')
    await page.waitForTimeout(1000)
    
    // Should show admin dashboard
    await expect(page.getByText('Loyalty Program Admin')).toBeVisible()
    await expect(page.getByText('Overview')).toBeVisible()
  })

  test('admin dashboard is responsive', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check main elements are still visible
    await expect(page.getByText('Loyalty Program Admin')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
    
    // Check tabs are accessible
    await expect(page.getByText('Overview')).toBeVisible()
    await expect(page.getByText('Users')).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Check main elements are still visible
    await expect(page.getByText('Loyalty Program Admin')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  })

  test('tabs are keyboard accessible', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to navigate to tabs with keyboard
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    
    // Check that tab content changes
    await expect(page.getByText('Users')).toBeVisible()
  })

  test('handles session loading state', async ({ page }) => {
    // Mock loading session
    await page.addInitScript(() => {
      // Simulate loading state by not setting session immediately
      setTimeout(() => {
        window.localStorage.setItem('next-auth.session', JSON.stringify({
          user: {
            id: 1,
            email: 'admin@example.com',
            roles: [{ name: 'admin' }],
          },
          accessToken: 'mock-admin-token',
        }))
      }, 500)
    })

    await page.goto('/admin')
    
    // Should show loading spinner initially
    await expect(page.locator('.animate-spin')).toBeVisible()
    
    // Wait for session to load
    await page.waitForTimeout(1000)
    
    // Should show admin dashboard
    await expect(page.getByText('Loyalty Program Admin')).toBeVisible()
  })

  test('admin header has correct styling', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Check header styling
    const header = page.locator('header')
    await expect(header).toHaveClass(/border-b/)
    await expect(header).toHaveClass(/bg-card/)
    
    // Check title styling
    const title = page.getByText('Loyalty Program Admin')
    await expect(title).toHaveClass(/text-2xl/)
    await expect(title).toHaveClass(/font-bold/)
  })

  test('admin tabs have correct styling', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Check tabs list styling
    const tabsList = page.locator('[role="tablist"]')
    await expect(tabsList).toHaveClass(/grid/)
    await expect(tabsList).toHaveClass(/bg-card/)
    
    // Check individual tab styling
    const overviewTab = page.getByRole('tab', { name: 'Overview' })
    await expect(overviewTab).toHaveClass(/flex/)
    await expect(overviewTab).toHaveClass(/items-center/)
  })

  test('handles multiple admin role types', async ({ page }) => {
    // Test with multiple roles including admin
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          id: 1,
          email: 'admin@example.com',
          roles: [
            { name: 'user' },
            { name: 'admin' },
            { name: 'moderator' }
          ],
        },
        accessToken: 'mock-admin-token',
      }))
    })

    await page.goto('/admin')
    await page.waitForTimeout(1000)
    
    // Should show admin dashboard (has admin role)
    await expect(page.getByText('Loyalty Program Admin')).toBeVisible()
  })

  test('handles edge case with no roles', async ({ page }) => {
    // Mock user with no roles
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          id: 1,
          email: 'user@example.com',
          roles: [],
        },
        accessToken: 'mock-token',
      }))
    })

    await page.goto('/admin')
    
    // Should redirect to home page
    await expect(page).toHaveURL('/')
  })

  test('handles edge case with null roles', async ({ page }) => {
    // Mock user with null roles
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          id: 1,
          email: 'user@example.com',
          roles: null,
        },
        accessToken: 'mock-token',
      }))
    })

    await page.goto('/admin')
    
    // Should redirect to home page
    await expect(page).toHaveURL('/')
  })
})
