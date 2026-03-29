import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { createTestUser, createTestService, getAuthHeaders } from './utils/testUtils.js';

const API_PREFIX = process.env.API_PREFIX || '/api';

describe('🛠️ Service Module Tests', () => {
  let customer, provider, admin, providerHeaders, customerHeaders, adminHeaders;

  beforeEach(async () => {
    // Create test users
    customer = await createTestUser({ role: 'customer', email: `customer${Date.now()}@test.com` });
    provider = await createTestUser({ role: 'provider', email: `provider${Date.now()}@test.com` });
    admin = await createTestUser({ role: 'admin', email: `admin${Date.now()}@test.com` });

    providerHeaders = await getAuthHeaders(provider);
    customerHeaders = await getAuthHeaders(customer);
    adminHeaders = await getAuthHeaders(admin);
  });

  describe('POST /api/services', () => {
    it('should create a service (provider only)', async () => {
      const serviceData = {
        title: 'Professional Plumbing',
        description: 'Expert plumbing services',
        category: 'plumbing',
        price: 150,
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610]
        }
      };

      const res = await request(app)
        .post(`${API_PREFIX}/services`)
        .set(providerHeaders)
        .send(serviceData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(serviceData.title);
      expect(res.body.data.category).toBe(serviceData.category);
    });

    it('should fail for customer role', async () => {
      const serviceData = {
        title: 'Test Service',
        category: 'plumbing',
        price: 100
      };

      const res = await request(app)
        .post(`${API_PREFIX}/services`)
        .set(customerHeaders)
        .send(serviceData);

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/services`)
        .send({ title: 'Test' });

      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/services`)
        .set(providerHeaders)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid price', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/services`)
        .set(providerHeaders)
        .send({
          title: 'Test Service',
          category: 'plumbing',
          price: -100
        });

      expect(res.status).toBe(400);
    });

    it('should fail with short title', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/services`)
        .set(providerHeaders)
        .send({
          title: 'Ab',
          category: 'plumbing',
          price: 100
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/services', () => {
    beforeEach(async () => {
      // Create test services
      await createTestService(provider._id, { title: 'Plumbing Service', category: 'plumbing', price: 100 });
      await createTestService(provider._id, { title: 'Electrical Service', category: 'electrical', price: 200 });
      await createTestService(provider._id, { title: 'Cleaning Service', category: 'cleaning', price: 50 });
    });

    it('should get all services', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services?category=plumbing`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      res.body.data.forEach(service => {
        expect(service.category).toBe('plumbing');
      });
    });

    it('should filter by price range', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services?minPrice=75&maxPrice=175`);

      expect(res.status).toBe(200);
      res.body.data.forEach(service => {
        expect(service.price).toBeGreaterThanOrEqual(75);
        expect(service.price).toBeLessThanOrEqual(175);
      });
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services?page=1&limit=2`);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.limit).toBe(2);
    });

    it('should sort by price ascending', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services?sort=price`);

      expect(res.status).toBe(200);
      // Verify sorting
      for (let i = 1; i < res.body.data.length; i++) {
        expect(res.body.data[i].price).toBeGreaterThanOrEqual(res.body.data[i - 1].price);
      }
    });

    it('should sort by rating descending', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services?sort=-averageRating`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/services/:id', () => {
    let service;

    beforeEach(async () => {
      service = await createTestService(provider._id);
    });

    it('should get service by ID', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/${service._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(service._id.toString());
    });

    it('should fail with invalid ID', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/invalidid`);

      expect(res.status).toBe(400);
    });

    it('should fail with non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`${API_PREFIX}/services/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/services/:id', () => {
    let service;

    beforeEach(async () => {
      service = await createTestService(provider._id);
    });

    it('should update own service', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/services/${service._id}`)
        .set(providerHeaders)
        .send({ title: 'Updated Title', price: 250 });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.price).toBe(250);
    });

    it('should fail for non-owner', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/services/${service._id}`)
        .set(customerHeaders)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
    });

    it('should allow admin to update', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/services/${service._id}`)
        .set(adminHeaders)
        .send({ title: 'Admin Updated' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/services/:id', () => {
    let service;

    beforeEach(async () => {
      service = await createTestService(provider._id);
    });

    it('should delete own service', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/services/${service._id}`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail for non-owner', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/services/${service._id}`)
        .set(customerHeaders);

      expect(res.status).toBe(403);
    });

    it('should allow admin to delete', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/services/${service._id}`)
        .set(adminHeaders);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/services/my-services', () => {
    beforeEach(async () => {
      await createTestService(provider._id, { title: 'My Service 1' });
      await createTestService(provider._id, { title: 'My Service 2' });
    });

    it('should get provider own services', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/my-services`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should fail for customer role', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/my-services`)
        .set(customerHeaders);

      // Customer has no services, should return empty
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/services/near', () => {
    beforeEach(async () => {
      await createTestService(provider._id, {
        title: 'Nearby Service',
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610]
        }
      });
    });

    it('should find services near location', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/near?lng=-73.935242&lat=40.730610&maxDistance=5000`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without coordinates', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/near`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/services/search', () => {
    beforeEach(async () => {
      await createTestService(provider._id, {
        title: 'Professional Plumbing Repair',
        description: 'Expert plumbing services'
      });
    });

    it('should search services by text', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/search?q=plumbing`);

      expect(res.status).toBe(200);
    });

    it('should fail without query', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/search`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/services/categories', () => {
    beforeEach(async () => {
      await createTestService(provider._id, { category: 'plumbing' });
      await createTestService(provider._id, { category: 'electrical' });
    });

    it('should get all categories', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/services/categories`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/services/:id/toggle-active', () => {
    let service;

    beforeEach(async () => {
      service = await createTestService(provider._id, { isActive: true });
    });

    it('should toggle service active status', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/services/${service._id}/toggle-active`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should fail for non-owner', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/services/${service._id}/toggle-active`)
        .set(customerHeaders);

      expect(res.status).toBe(403);
    });
  });
});
