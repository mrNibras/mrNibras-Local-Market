import { test, expect } from '@playwright/test';

/**
 * Frontend UI/UX & Backend Integration Tests
 * 
 * Run: npx playwright test
 */

// Base API URL
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

test.describe('🎨 Frontend UI/UX Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Local Link/);
      await expect(page.locator('body')).toBeVisible();
    });

    test('should display navbar', async ({ page }) => {
      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();
      
      // Check navigation links
      await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /services/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    });

    test('should display hero section', async ({ page }) => {
      const hero = page.locator('section').filter({ hasText: /find.*service/i });
      await expect(hero).toBeVisible();
    });

    test('should display categories section', async ({ page }) => {
      const categories = page.locator('text=/categories/i');
      await expect(categories).toBeVisible();
    });

    test('should display featured services', async ({ page }) => {
      const featured = page.locator('text=/featured/i');
      await expect(featured).toBeVisible();
    });

    test('should display how it works section', async ({ page }) => {
      const howItWorks = page.locator('text=/how it works/i');
      await expect(howItWorks).toBeVisible();
    });

    test('should have footer', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should have responsive layout', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('nav')).toBeVisible();
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('nav')).toBeVisible();
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  test.describe('Services Page', () => {
    test('should navigate to services page', async ({ page }) => {
      await page.getByRole('link', { name: /services/i }).click();
      await expect(page).toHaveURL(/.*services.*/);
    });

    test('should display service cards', async ({ page }) => {
      await page.getByRole('link', { name: /services/i }).click();
      
      // Wait for service cards to load
      const serviceCards = page.locator('[data-testid="service-card"]');
      await serviceCards.first().waitFor({ state: 'visible' });
    });

    test('should have search functionality', async ({ page }) => {
      await page.getByRole('link', { name: /services/i }).click();
      
      const searchInput = page.locator('input[placeholder*="search" i]');
      await expect(searchInput).toBeVisible();
    });

    test('should have filter options', async ({ page }) => {
      await page.getByRole('link', { name: /services/i }).click();
      
      const categoryFilter = page.locator('select, button').filter({ hasText: /category/i });
      await expect(categoryFilter).toBeVisible();
    });
  });

  test.describe('Service Detail Page', () => {
    test('should display service details', async ({ page }) => {
      await page.goto(`${APP_URL}/services/1`);
      
      // Should have service title
      await expect(page.locator('h1')).toBeVisible();
      
      // Should have service description
      await expect(page.locator('text=/description/i')).toBeVisible();
      
      // Should have booking button
      await expect(page.getByRole('button', { name: /book/i })).toBeVisible();
    });
  });

  test.describe('Authentication UI', () => {
    test('should display login form', async ({ page }) => {
      await page.getByRole('link', { name: /login/i }).click();
      
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    });

    test('should display register form', async ({ page }) => {
      await page.getByRole('link', { name: /register|sign up/i }).click();
      
      await expect(page.locator('input[placeholder*="name" i]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show validation errors', async ({ page }) => {
      await page.getByRole('link', { name: /login/i }).click();
      
      // Try to submit empty form
      await page.getByRole('button', { name: /login/i }).click();
      
      // Should show error
      await expect(page.locator('text=/required|invalid/i')).toBeVisible();
    });
  });

  test.describe('Navigation & Routing', () => {
    test('should have working navigation links', async ({ page }) => {
      const navLinks = page.locator('nav a[href]');
      const count = await navLinks.count();
      
      for (let i = 0; i < count; i++) {
        await navLinks.nth(i).click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*/);
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    });

    test('should handle 404 pages', async ({ page }) => {
      await page.goto(`${APP_URL}/nonexistent-page`);
      
      await expect(page.locator('text=/404|not found/i')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have alt text on images', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
    });

    test('should have focusable elements', async ({ page }) => {
      const focusableElements = page.locator(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      await expect(focusableElements.first()).toBeFocused();
    });
  });

  test.describe('Performance', () => {
    test('should load within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have no console errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');
      
      expect(errors).toHaveLength(0);
    });
  });
});

test.describe('🔌 Backend Integration Tests', () => {
  
  test.describe('API Health', () => {
    test('should connect to backend API', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should return API info', async ({ request }) => {
      const response = await request.get(`${API_URL}`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.endpoints).toBeDefined();
    });
  });

  test.describe('Authentication Flow', () => {
    let authToken: string;

    test('should register new user', async ({ request }) => {
      const email = `test${Date.now()}@test.com`;
      
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Test User',
          email: email,
          password: 'SecurePass123',
          role: 'customer'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);
      
      const data = await response.json();
      expect(data.data.user.email).toBe(email);
      expect(data.data.accessToken).toBeDefined();
      
      authToken = data.data.accessToken;
    });

    test('should login user', async ({ request }) => {
      // First register
      const email = `login${Date.now()}@test.com`;
      await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Login Test',
          email: email,
          password: 'SecurePass123'
        }
      });
      
      // Then login
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: email,
          password: 'SecurePass123'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.data.accessToken).toBeDefined();
    });

    test('should get current user with token', async ({ request }) => {
      // Register to get token
      const regResponse = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Profile Test',
          email: `profile${Date.now()}@test.com`,
          password: 'SecurePass123'
        }
      });
      const regData = await regResponse.json();
      authToken = regData.data.accessToken;
      
      // Get profile
      const response = await request.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });

    test('should fail login with wrong credentials', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'wrong@test.com',
          password: 'wrongpassword'
        }
      });
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Services Integration', () => {
    let authToken: string;
    let serviceId: string;

    test.beforeAll(async ({ request }) => {
      // Register provider
      const regResponse = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Provider Test',
          email: `provider${Date.now()}@test.com`,
          password: 'SecurePass123',
          role: 'provider'
        }
      });
      const regData = await regResponse.json();
      authToken = regData.data.accessToken;
    });

    test('should create service', async ({ request }) => {
      const response = await request.post(`${API_URL}/services`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        data: {
          title: 'Integration Test Service',
          description: 'Test service description',
          category: 'testing',
          price: 99,
          location: {
            type: 'Point',
            coordinates: [-73.935242, 40.730610]
          }
        }
      });
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);
      
      const data = await response.json();
      serviceId = data.data._id;
    });

    test('should get services list', async ({ request }) => {
      const response = await request.get(`${API_URL}/services`);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.data).toBeDefined();
    });

    test('should filter services by category', async ({ request }) => {
      const response = await request.get(`${API_URL}/services?category=testing`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      data.data.forEach((service: any) => {
        expect(service.category).toBe('testing');
      });
    });

    test('should search services', async ({ request }) => {
      const response = await request.get(`${API_URL}/services/search?q=test`);
      
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Booking Integration', () => {
    let customerToken: string;
    let providerToken: string;
    let serviceId: string;
    let bookingId: string;

    test.beforeAll(async ({ request }) => {
      // Register customer
      const customerReg = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Customer',
          email: `customer${Date.now()}@test.com`,
          password: 'SecurePass123',
          role: 'customer'
        }
      });
      customerToken = (await customerReg.json()).data.accessToken;

      // Register provider
      const providerReg = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Provider',
          email: `provider${Date.now()}@test.com`,
          password: 'SecurePass123',
          role: 'provider'
        }
      });
      providerToken = (await providerReg.json()).data.accessToken;

      // Create service
      const serviceRes = await request.post(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: {
          title: 'Booking Test Service',
          category: 'booking-test',
          price: 100
        }
      });
      serviceId = (await serviceRes.json()).data._id;
    });

    test('should create booking', async ({ request }) => {
      const response = await request.post(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {
          provider: serviceId,
          service: serviceId,
          bookingDate: new Date(Date.now() + 86400000).toISOString(),
          duration: 60
        }
      });
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);
      
      const data = await response.json();
      bookingId = data.data._id;
    });

    test('should accept booking (provider)', async ({ request }) => {
      const response = await request.patch(
        `${API_URL}/bookings/${bookingId}/accept`,
        { headers: { Authorization: `Bearer ${providerToken}` } }
      );
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.data.status).toBe('accepted');
    });

    test('should get customer bookings', async ({ request }) => {
      const response = await request.get(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Review Integration', () => {
    let customerToken: string;
    let serviceId: string;
    let bookingId: string;

    test.beforeAll(async ({ request }) => {
      // Setup: Register, create service, booking, complete it
      const customerReg = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Reviewer',
          email: `reviewer${Date.now()}@test.com`,
          password: 'SecurePass123'
        }
      });
      customerToken = (await customerReg.json()).data.accessToken;

      const providerReg = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Review Provider',
          email: `reviewprovider${Date.now()}@test.com`,
          password: 'SecurePass123',
          role: 'provider'
        }
      });
      const providerToken = (await providerReg.json()).data.accessToken;

      const serviceRes = await request.post(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: {
          title: 'Review Test Service',
          category: 'review-test',
          price: 50
        }
      });
      serviceId = (await serviceRes.json()).data._id;

      const bookingRes = await request.post(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {
          provider: serviceId,
          service: serviceId,
          bookingDate: new Date(Date.now() - 86400000).toISOString(),
          duration: 60
        }
      });
      bookingId = (await bookingRes.json()).data._id;

      // Complete booking
      await request.patch(
        `${API_URL}/bookings/${bookingId}/accept`,
        { headers: { Authorization: `Bearer ${providerToken}` } }
      );
      await request.patch(
        `${API_URL}/bookings/${bookingId}/complete`,
        { headers: { Authorization: `Bearer ${providerToken}` } }
      );
    });

    test('should create review', async ({ request }) => {
      const response = await request.post(`${API_URL}/reviews`, {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {
          service: serviceId,
          rating: 5,
          comment: 'Excellent service from integration test!',
          booking: bookingId
        }
      });
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);
    });

    test('should get service reviews', async ({ request }) => {
      const response = await request.get(
        `${API_URL}/reviews/service/${serviceId}`
      );
      
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 for non-existent routes', async ({ request }) => {
      const response = await request.get(`${API_URL}/nonexistent`);
      
      expect(response.status()).toBe(404);
    });

    test('should handle invalid token', async ({ request }) => {
      const response = await request.get(`${API_URL}/auth/me`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      
      expect(response.status()).toBe(401);
    });

    test('should handle missing required fields', async ({ request }) => {
      const response = await request.post(`${API_URL}/services`, {
        headers: { Authorization: 'Bearer token' },
        data: {}
      });
      
      expect(response.status()).toBe(400);
    });
  });
});

test.describe('🎯 End-to-End User Flows', () => {
  
  test('complete customer journey', async ({ page, request }) => {
    // 1. Register
    const email = `e2e${Date.now()}@test.com`;
    const regResponse = await request.post(`${API_URL}/auth/register`, {
      data: {
        name: 'E2E User',
        email: email,
        password: 'SecurePass123'
      }
    });
    const { data: { accessToken } } = await regResponse.json();

    // 2. Browse services
    const servicesResponse = await request.get(`${API_URL}/services`);
    expect(servicesResponse.ok()).toBeTruthy();

    // 3. Search services
    const searchResponse = await request.get(`${API_URL}/services/search?q=test`);
    expect(searchResponse.ok()).toBeTruthy();

    // 4. Get profile
    const profileResponse = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(profileResponse.ok()).toBeTruthy();

    // 5. Logout
    const logoutResponse = await request.post(`${API_URL}/auth/logout`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(logoutResponse.ok()).toBeTruthy();
  });

  test('complete provider journey', async ({ page, request }) => {
    // 1. Register as provider
    const email = `provider${Date.now()}@test.com`;
    const regResponse = await request.post(`${API_URL}/auth/register`, {
      data: {
        name: 'E2E Provider',
        email: email,
        password: 'SecurePass123',
        role: 'provider'
      }
    });
    const { data: { accessToken } } = await regResponse.json();

    // 2. Create service
    const serviceResponse = await request.post(`${API_URL}/services`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        title: 'E2E Service',
        category: 'e2e-test',
        price: 150
      }
    });
    expect(serviceResponse.ok()).toBeTruthy();
    const service = (await serviceResponse.json()).data;

    // 3. Get my services
    const myServicesResponse = await request.get(`${API_URL}/services/my-services`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(myServicesResponse.ok()).toBeTruthy();

    // 4. Update service
    const updateResponse = await request.patch(
      `${API_URL}/services/${service._id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { price: 200 }
      }
    );
    expect(updateResponse.ok()).toBeTruthy();
  });
});
