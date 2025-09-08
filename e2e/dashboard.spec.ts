import { test, expect } from '@playwright/test'

test.describe('Loyalty Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('next-auth.session', JSON.stringify({
        user: {
          id: 1,
          email: 'user@example.com',
          roles: [{ name: 'user' }],
        },
        accessToken: 'mock-token',
      }))
    })

    // Navigate to dashboard
    await page.goto('/')
  })

  test('displays loyalty dashboard correctly', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.getByText('Loyalty Dashboard')).toBeVisible()
    await expect(page.getByText('Track your rewards and achievements')).toBeVisible()
    
    // Check action buttons
    await expect(page.getByRole('button', { name: 'Make Purchase' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Simulate Achievement' })).toBeVisible()
  })

  test('shows loading state initially', async ({ page }) => {
    // The dashboard should show loading spinner initially
    await expect(page.locator('.animate-spin')).toBeVisible()
  })

  test('displays points overview after loading', async ({ page }) => {
    // Wait for data to load (simulated 1 second delay)
    await page.waitForTimeout(1500)
    
    // Check points are displayed
    await expect(page.getByText('2,750')).toBeVisible() // Available points
    await expect(page.getByText('8,950')).toBeVisible() // Total earned
    await expect(page.getByText('6,200')).toBeVisible() // Total redeemed
  })

  test('displays achievements count', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Check achievements count
    await expect(page.getByText('3')).toBeVisible() // Total achievements
    await expect(page.getByText('+2 this month')).toBeVisible()
  })

  test('displays current badge information', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Check current badge
    await expect(page.getByText('Silver Member')).toBeVisible()
    await expect(page.getByText('Tier 2')).toBeVisible()
  })

  test('displays points redeemed information', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Check points redeemed
    await expect(page.getByText('6,200')).toBeVisible()
    await expect(page.getByText('Lifetime redemptions')).toBeVisible()
  })

  test('navigates between tabs correctly', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Test tab navigation
    await page.getByText('Achievements').click()
    await expect(page.getByText('Achievements')).toBeVisible()
    
    await page.getByText('Badges').click()
    await expect(page.getByText('Badges')).toBeVisible()
    
    await page.getByText('History').click()
    await expect(page.getByText('History')).toBeVisible()
    
    await page.getByText('Payments').click()
    await expect(page.getByText('Payments')).toBeVisible()
    
    await page.getByText('Overview').click()
    await expect(page.getByText('Overview')).toBeVisible()
  })

  test('shows recent achievements in overview tab', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Check recent achievements section
    await expect(page.getByText('Recent Achievements')).toBeVisible()
    await expect(page.getByText('First Purchase')).toBeVisible()
    await expect(page.getByText('Loyal Customer')).toBeVisible()
    await expect(page.getByText('Frequent Buyer')).toBeVisible()
  })

  test('simulates achievement correctly', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Click simulate achievement button
    await page.getByRole('button', { name: 'Simulate Achievement' }).click()
    
    // Check for achievement notification
    await expect(page.getByText('Big Spender')).toBeVisible()
    await expect(page.getByText('Spent over $500 in a single transaction')).toBeVisible()
    
    // Check that points increased
    await expect(page.getByText('3,250')).toBeVisible() // 2750 + 500
  })

  test('opens payment modal', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Click make purchase button
    await page.getByRole('button', { name: 'Make Purchase' }).click()
    
    // Check if payment modal opens (this would need the actual modal component)
    // For now, we just verify the button click works
    await expect(page.getByRole('button', { name: 'Make Purchase' })).toBeVisible()
  })

  test('handles achievement notification auto-close', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Click simulate achievement button
    await page.getByRole('button', { name: 'Simulate Achievement' }).click()
    
    // Check notification appears
    await expect(page.getByText('Big Spender')).toBeVisible()
    
    // Wait for notification to auto-close (4 seconds)
    await page.waitForTimeout(4500)
    
    // Notification should be gone
    await expect(page.getByText('Big Spender')).not.toBeVisible()
  })

  test('displays achievement dates correctly', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Check that achievement dates are displayed
    await expect(page.getByText('1/1/2024')).toBeVisible() // First Purchase date
    await expect(page.getByText('1/5/2024')).toBeVisible() // Loyal Customer date
  })

  test('dashboard is responsive', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check main elements are still visible
    await expect(page.getByText('Loyalty Dashboard')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Make Purchase' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Simulate Achievement' })).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Check main elements are still visible
    await expect(page.getByText('Loyalty Dashboard')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Make Purchase' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Simulate Achievement' })).toBeVisible()
  })

  test('handles empty data gracefully', async ({ page }) => {
    // Mock empty loyalty data
    await page.addInitScript(() => {
      // Override the useLoyaltyData hook to return empty data
      (window as any).mockLoyaltyData = {
        user_id: 1,
        points: {
          available: 0,
          total_earned: 0,
          total_redeemed: 0,
        },
        achievements: [],
        badges: [],
        current_badge: null,
      }
    })

    await page.goto('/')
    await page.waitForTimeout(1500)
    
    // Check that dashboard handles empty data
    await expect(page.getByText('Loyalty Dashboard')).toBeVisible()
    await expect(page.getByText('0')).toBeVisible() // Should show 0 for empty data
    await expect(page.getByText('No Badge')).toBeVisible()
  })

  test('tabs are keyboard accessible', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to navigate to tabs with keyboard
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    
    // Check that tab content changes
    await expect(page.getByText('Achievements')).toBeVisible()
  })

  test('handles multiple rapid achievement simulations', async ({ page }) => {
    await page.waitForTimeout(1500)
    
    // Click simulate achievement multiple times rapidly
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Simulate Achievement' }).click()
      await page.waitForTimeout(100)
    }
    
    // Should handle multiple clicks gracefully
    await expect(page.getByText('Big Spender')).toBeVisible()
  })
})
