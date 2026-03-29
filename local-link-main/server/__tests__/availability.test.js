import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { createTestUser, getAuthHeaders } from './utils/testUtils.js';

const API_PREFIX = process.env.API_PREFIX || '/api';

describe('🕐 Availability Module Tests', () => {
  let provider, customer, providerHeaders, customerHeaders;

  beforeEach(async () => {
    provider = await createTestUser({ role: 'provider', email: `provider${Date.now()}@test.com` });
    customer = await createTestUser({ role: 'customer', email: `customer${Date.now()}@test.com` });
    providerHeaders = await getAuthHeaders(provider);
    customerHeaders = await getAuthHeaders(customer);
  });

  describe('POST /api/availability', () => {
    it('should set availability (provider only)', async () => {
      const availabilityData = {
        dayOfWeek: 1, // Monday
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' }
        ]
      };

      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send(availabilityData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dayOfWeek).toBe(1);
      expect(res.body.data.slots.length).toBe(2);
    });

    it('should fail for customer role', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(customerHeaders)
        .send({ dayOfWeek: 1, slots: [{ startTime: '09:00', endTime: '12:00' }] });

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .send({ dayOfWeek: 1, slots: [] });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid dayOfWeek', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({ dayOfWeek: 7, slots: [{ startTime: '09:00', endTime: '12:00' }] }); // Invalid day

      expect(res.status).toBe(400);
    });

    it('should fail with invalid time format', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({ 
          dayOfWeek: 1, 
          slots: [{ startTime: '9:00', endTime: '12:00' }] // Invalid format (should be 09:00)
        });

      expect(res.status).toBe(400);
    });

    it('should fail with end time before start time', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({ 
          dayOfWeek: 1, 
          slots: [{ startTime: '12:00', endTime: '09:00' }]
        });

      expect(res.status).toBe(400);
    });

    it('should fail with empty slots', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({ dayOfWeek: 1, slots: [] });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/availability/my-availability', () => {
    beforeEach(async () => {
      // Set availability first
      await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({
          dayOfWeek: 1,
          slots: [{ startTime: '09:00', endTime: '12:00' }]
        });
    });

    it('should get provider own availability', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/availability/my-availability`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/availability/day/:dayOfWeek', () => {
    beforeEach(async () => {
      await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({
          dayOfWeek: 2, // Tuesday
          slots: [{ startTime: '10:00', endTime: '16:00' }]
        });
    });

    it('should get availability for specific day', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/availability/day/2`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dayOfWeek).toBe(2);
    });

    it('should fail with invalid day', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/availability/day/7`)
        .set(providerHeaders);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/availability/day/:dayOfWeek/slots', () => {
    beforeEach(async () => {
      await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({
          dayOfWeek: 3,
          slots: [
            { startTime: '09:00', endTime: '11:00' },
            { startTime: '13:00', endTime: '17:00' }
          ]
        });
    });

    it('should get available slots for day', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/availability/day/3/slots`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('PATCH /api/availability/:id', () => {
    let availability;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({
          dayOfWeek: 4,
          slots: [{ startTime: '09:00', endTime: '12:00' }]
        });
      availability = res.body.data;
    });

    it('should update own availability', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/availability/${availability._id}`)
        .set(providerHeaders)
        .send({
          slots: [{ startTime: '10:00', endTime: '14:00' }]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.slots[0].startTime).toBe('10:00');
    });

    it('should fail for non-owner', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/availability/${availability._id}`)
        .set(customerHeaders)
        .send({ slots: [{ startTime: '08:00', endTime: '12:00' }] });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/availability/:id', () => {
    let availability;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({
          dayOfWeek: 5,
          slots: [{ startTime: '09:00', endTime: '12:00' }]
        });
      availability = res.body.data;
    });

    it('should delete own availability', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/availability/${availability._id}`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail for non-owner', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/availability/${availability._id}`)
        .set(customerHeaders);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/availability/:id/toggle-active', () => {
    let availability;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({
          dayOfWeek: 6,
          slots: [{ startTime: '09:00', endTime: '12:00' }],
          isActive: true
        });
      availability = res.body.data;
    });

    it('should toggle availability active status', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/availability/${availability._id}/toggle-active`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe('POST /api/availability/exception', () => {
    it('should set exception availability', async () => {
      const exceptionData = {
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        slots: [{ startTime: '10:00', endTime: '14:00' }],
        reason: 'Special holiday hours'
      };

      const res = await request(app)
        .post(`${API_PREFIX}/availability/exception`)
        .set(providerHeaders)
        .send(exceptionData);

      expect(res.status).toBe(201);
      expect(res.body.data.isException).toBe(true);
    });

    it('should fail without date', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability/exception`)
        .set(providerHeaders)
        .send({
          slots: [{ startTime: '10:00', endTime: '14:00' }]
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/availability/exceptions', () => {
    beforeEach(async () => {
      const tomorrow = new Date(Date.now() + 86400000);
      const nextWeek = new Date(Date.now() + 7 * 86400000);
      
      await request(app)
        .post(`${API_PREFIX}/availability/exception`)
        .set(providerHeaders)
        .send({
          date: tomorrow.toISOString(),
          slots: [{ startTime: '10:00', endTime: '14:00' }]
        });

      await request(app)
        .post(`${API_PREFIX}/availability/exception`)
        .set(providerHeaders)
        .send({
          date: nextWeek.toISOString(),
          slots: [{ startTime: '09:00', endTime: '12:00' }]
        });
    });

    it('should get exceptions for date range', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 14 * 86400000).toISOString();

      const res = await request(app)
        .get(`${API_PREFIX}/availability/exceptions?startDate=${startDate}&endDate=${endDate}`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('should fail without dates', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/availability/exceptions`)
        .set(providerHeaders);

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/availability/all', () => {
    beforeEach(async () => {
      // Create multiple availability entries
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post(`${API_PREFIX}/availability`)
          .set(providerHeaders)
          .send({
            dayOfWeek: i,
            slots: [{ startTime: '09:00', endTime: '12:00' }]
          });
      }
    });

    it('should delete all availability', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/availability/all`)
        .set(providerHeaders);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/availability/:id/book', () => {
    let availability;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({
          dayOfWeek: 1,
          slots: [
            { startTime: '09:00', endTime: '12:00', isBooked: false },
            { startTime: '14:00', endTime: '18:00', isBooked: false }
          ]
        });
      availability = res.body.data;
    });

    it('should book a slot', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability/${availability._id}/book`)
        .set(providerHeaders)
        .send({
          startTime: '09:00',
          endTime: '12:00',
          bookingId: new mongoose.Types.ObjectId().toString()
        });

      expect(res.status).toBe(200);
    });

    it('should fail without required fields', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability/${availability._id}/book`)
        .set(providerHeaders)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/availability/:id/cancel-slot', () => {
    let availability;

    beforeEach(async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability`)
        .set(providerHeaders)
        .send({
          dayOfWeek: 1,
          slots: [{ startTime: '09:00', endTime: '12:00', isBooked: true }]
        });
      availability = res.body.data;
    });

    it('should cancel a booked slot', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/availability/${availability._id}/cancel-slot`)
        .set(providerHeaders)
        .send({
          startTime: '09:00',
          endTime: '12:00'
        });

      expect(res.status).toBe(200);
    });
  });
});
