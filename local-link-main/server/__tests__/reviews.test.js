import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { createTestUser, createTestService, createTestBooking, getAuthHeaders } from './utils/testUtils.js';

const API_PREFIX = process.env.API_PREFIX || '/api';

describe('⭐ Review Module Tests', () => {
  let customer, provider, service, completedBooking, customerHeaders, providerHeaders;

  beforeEach(async () => {
    customer = await createTestUser({ role: 'customer', email: `customer${Date.now()}@test.com` });
    provider = await createTestUser({ role: 'provider', email: `provider${Date.now()}@test.com` });
    service = await createTestService(provider._id);
    
    // Create completed booking for review
    completedBooking = await createTestBooking(customer._id, provider._id, service._id, {
      status: 'completed',
      bookingDate: new Date(Date.now() - 86400000) // Yesterday
    });

    customerHeaders = await getAuthHeaders(customer);
    providerHeaders = await getAuthHeaders(provider);
  });

  describe('POST /api/reviews', () => {
    it('should create a review (customer with completed booking)', async () => {
      const reviewData = {
        service: service._id.toString(),
        rating: 5,
        comment: 'Excellent service! Highly recommended.',
        booking: completedBooking._id.toString()
      };

      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send(reviewData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.comment).toBe(reviewData.comment);
    });

    it('should fail with invalid rating', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 6 // Invalid
        });

      expect(res.status).toBe(400);
    });

    it('should fail with short comment', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 5,
          comment: 'Good' // Too short (min 10 chars)
        });

      expect(res.status).toBe(400);
    });

    it('should fail for provider reviewing own service', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(providerHeaders)
        .send({
          service: service._id.toString(),
          rating: 5,
          comment: 'My own review'
        });

      expect(res.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .send({
          service: service._id.toString(),
          rating: 5
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reviews/service/:serviceId', () => {
    beforeEach(async () => {
      // Create test review
      await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 5,
          comment: 'Great service!',
          booking: completedBooking._id.toString()
        });
    });

    it('should get service reviews', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/reviews/service/${service._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should paginate reviews', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/reviews/service/${service._id}?page=1&limit=5`);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/reviews/service/:serviceId/stats', () => {
    it('should get review statistics', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/reviews/service/${service._id}/stats`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('PATCH /api/reviews/:id', () => {
    let review;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 4,
          comment: 'Initial review',
          booking: completedBooking._id.toString()
        });
      review = res.body.data;
    });

    it('should update own review', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/reviews/${review._id}`)
        .set(customerHeaders)
        .send({ rating: 5, comment: 'Updated excellent review' });

      expect(res.status).toBe(200);
      expect(res.body.data.rating).toBe(5);
    });

    it('should fail for non-owner', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/reviews/${review._id}`)
        .set(providerHeaders)
        .send({ rating: 1 });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    let review;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 5,
          comment: 'To be deleted',
          booking: completedBooking._id.toString()
        });
      review = res.body.data;
    });

    it('should delete own review', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/reviews/${review._id}`)
        .set(customerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow admin to delete', async () => {
      const admin = await createTestUser({ role: 'admin', email: `admin${Date.now()}@test.com` });
      const adminHeaders = await getAuthHeaders(admin);

      const res = await request(app)
        .delete(`${API_PREFIX}/reviews/${review._id}`)
        .set(adminHeaders);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/reviews/:id/helpful', () => {
    let review;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 5,
          comment: 'Helpful review test',
          booking: completedBooking._id.toString()
        });
      review = res.body.data;
    });

    it('should mark review as helpful', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews/${review._id}/helpful`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
    });

    it('should fail for review owner', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews/${review._id}/helpful`)
        .set(customerHeaders);

      // Owner cannot mark own review
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/reviews/:id/helpful', () => {
    let review;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 5,
          comment: 'Unmark helpful test',
          booking: completedBooking._id.toString()
        });
      review = res.body.data;

      // Mark as helpful first
      await request(app)
        .post(`${API_PREFIX}/reviews/${review._id}/helpful`)
        .set(providerHeaders);
    });

    it('should unmark review as helpful', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/reviews/${review._id}/helpful`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/reviews/:id/response', () => {
    let review;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 4,
          comment: 'Good service',
          booking: completedBooking._id.toString()
        });
      review = res.body.data;
    });

    it('should add provider response', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews/${review._id}/response`)
        .set(providerHeaders)
        .send({ response: 'Thank you for your feedback!' });

      expect(res.status).toBe(200);
      expect(res.body.data.response).toBe('Thank you for your feedback!');
    });

    it('should fail for customer', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/reviews/${review._id}/response`)
        .set(customerHeaders)
        .send({ response: 'Response' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/reviews/my-reviews', () => {
    beforeEach(async () => {
      await request(app)
        .post(`${API_PREFIX}/reviews`)
        .set(customerHeaders)
        .send({
          service: service._id.toString(),
          rating: 5,
          comment: 'My review',
          booking: completedBooking._id.toString()
        });
    });

    it('should get my reviews', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/reviews/my-reviews`)
        .set(customerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
