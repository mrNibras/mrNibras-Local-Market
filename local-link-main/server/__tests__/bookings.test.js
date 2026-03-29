import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { createTestUser, createTestService, createTestBooking, getAuthHeaders } from './utils/testUtils.js';

const API_PREFIX = process.env.API_PREFIX || '/api';

describe('📅 Booking Module Tests', () => {
  let customer, provider, admin, service, customerHeaders, providerHeaders, adminHeaders;

  beforeEach(async () => {
    // Create test users
    customer = await createTestUser({ role: 'customer', email: `customer${Date.now()}@test.com` });
    provider = await createTestUser({ role: 'provider', email: `provider${Date.now()}@test.com` });
    admin = await createTestUser({ role: 'admin', email: `admin${Date.now()}@test.com` });
    service = await createTestService(provider._id);

    customerHeaders = await getAuthHeaders(customer);
    providerHeaders = await getAuthHeaders(provider);
    adminHeaders = await getAuthHeaders(admin);
  });

  describe('POST /api/bookings', () => {
    it('should create a booking (customer)', async () => {
      const bookingData = {
        provider: provider._id.toString(),
        service: service._id.toString(),
        bookingDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        duration: 60,
        note: 'Please call before arrival'
      };

      const res = await request(app)
        .post(`${API_PREFIX}/bookings`)
        .set(customerHeaders)
        .send(bookingData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer).toBeDefined();
      expect(res.body.data.provider).toBe(provider._id.toString());
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.duration).toBe(60);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/bookings`)
        .send({
          provider: provider._id.toString(),
          service: service._id.toString(),
          bookingDate: new Date().toISOString()
        });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid service', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`${API_PREFIX}/bookings`)
        .set(customerHeaders)
        .send({
          provider: provider._id.toString(),
          service: fakeId.toString(),
          bookingDate: new Date(Date.now() + 86400000).toISOString()
        });

      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('SERVICE_NOT_FOUND');
    });

    it('should fail with past date', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/bookings`)
        .set(customerHeaders)
        .send({
          provider: provider._id.toString(),
          service: service._id.toString(),
          bookingDate: new Date(Date.now() - 86400000).toISOString() // Yesterday
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid duration', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/bookings`)
        .set(customerHeaders)
        .send({
          provider: provider._id.toString(),
          service: service._id.toString(),
          bookingDate: new Date(Date.now() + 86400000).toISOString(),
          duration: 5 // Too short
        });

      expect(res.status).toBe(400);
    });

    it('should prevent double booking (same provider, overlapping time)', async () => {
      const bookingDate = new Date(Date.now() + 86400000).toISOString();
      
      // Create first booking
      await request(app)
        .post(`${API_PREFIX}/bookings`)
        .set(customerHeaders)
        .send({
          provider: provider._id.toString(),
          service: service._id.toString(),
          bookingDate: bookingDate,
          duration: 60
        });

      // Try to create overlapping booking
      const res = await request(app)
        .post(`${API_PREFIX}/bookings`)
        .set(customerHeaders)
        .send({
          provider: provider._id.toString(),
          service: service._id.toString(),
          bookingDate: bookingDate,
          duration: 60
        });

      // Should fail with conflict
      expect([400, 409]).toContain(res.status);
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    beforeEach(async () => {
      await createTestBooking(customer._id, provider._id, service._id);
    });

    it('should get customer bookings', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/my-bookings`)
        .set(customerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/my-bookings?status=pending`)
        .set(customerHeaders);

      expect(res.status).toBe(200);
      res.body.data.forEach(booking => {
        expect(booking.status).toBe('pending');
      });
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/my-bookings?page=1&limit=5`)
        .set(customerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/bookings/provider/my-bookings', () => {
    beforeEach(async () => {
      await createTestBooking(customer._id, provider._id, service._id);
    });

    it('should get provider bookings', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/provider/my-bookings`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail for customer role', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/provider/my-bookings`)
        .set(customerHeaders);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/bookings/:id/accept', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking(customer._id, provider._id, service._id);
    });

    it('should accept booking (provider)', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/accept`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('accepted');
    });

    it('should fail for customer', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/accept`)
        .set(customerHeaders);

      expect(res.status).toBe(403);
    });

    it('should fail for already accepted booking', async () => {
      // First accept
      await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/accept`)
        .set(providerHeaders);

      // Try to accept again
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/accept`)
        .set(providerHeaders);

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('INVALID_STATUS');
    });
  });

  describe('PATCH /api/bookings/:id/reject', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking(customer._id, provider._id, service._id);
    });

    it('should reject booking (provider)', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/reject`)
        .set(providerHeaders)
        .send({ reason: 'Not available' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('rejected');
    });

    it('should fail for customer', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/reject`)
        .set(customerHeaders);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking(customer._id, provider._id, service._id);
    });

    it('should cancel booking (customer)', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/cancel`)
        .set(customerHeaders)
        .send({ reason: 'Change of plans' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should cancel booking (provider)', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/cancel`)
        .set(providerHeaders)
        .send({ reason: 'Unavailable' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should fail for completed booking', async () => {
      // First complete the booking
      await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/accept`)
        .set(providerHeaders);
      
      await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/complete`)
        .set(providerHeaders);

      // Try to cancel
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/cancel`)
        .set(customerHeaders);

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/bookings/:id/complete', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking(customer._id, provider._id, service._id);
      // First accept the booking
      await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/accept`)
        .set(providerHeaders);
    });

    it('should complete booking (provider)', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/complete`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });

    it('should fail for customer', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${booking._id}/complete`)
        .set(customerHeaders);

      expect(res.status).toBe(403);
    });

    it('should fail for pending booking', async () => {
      // Create new pending booking
      const newBooking = await createTestBooking(customer._id, provider._id, service._id);
      
      const res = await request(app)
        .patch(`${API_PREFIX}/bookings/${newBooking._id}/complete`)
        .set(providerHeaders);

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('INVALID_STATUS');
    });
  });

  describe('GET /api/bookings/upcoming', () => {
    beforeEach(async () => {
      await createTestBooking(customer._id, provider._id, service._id, {
        bookingDate: new Date(Date.now() + 86400000) // Tomorrow
      });
    });

    it('should get upcoming bookings', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/upcoming`)
        .set(customerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/bookings/past', () => {
    beforeEach(async () => {
      await createTestBooking(customer._id, provider._id, service._id, {
        bookingDate: new Date(Date.now() - 86400000), // Yesterday
        status: 'completed'
      });
    });

    it('should get past bookings', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/past`)
        .set(customerHeaders);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/bookings/provider/stats', () => {
    beforeEach(async () => {
      await createTestBooking(customer._id, provider._id, service._id);
    });

    it('should get booking statistics (provider)', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/provider/stats`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should fail for customer', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/bookings/provider/stats`)
        .set(customerHeaders);

      expect(res.status).toBe(403);
    });
  });
});
