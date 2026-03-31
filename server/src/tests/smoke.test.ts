import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

type AppType = import('express').Express;
type UserModelType = typeof import('../models/User.model.js').User;

let mongo: MongoMemoryServer;
let app: AppType;
let User: UserModelType;

const createTestUserAndToken = async (payload: {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'worker' | 'rescue';
}) => {
  await request(app).post('/api/auth/signup').send(payload);

  const loginRes = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: payload.password
  });

  return {
    token: loginRes.body.token as string,
    userId: String(loginRes.body.user.id)
  };
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  process.env.BCRYPT_SALT_ROUNDS = '4';

  const { connectDatabase } = await import('../config/database.js');
  const { createApp } = await import('../app.js');
  const userModule = await import('../models/User.model.js');
  User = userModule.User;

  await connectDatabase();
  app = createApp();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

describe('Smoke tests', () => {
  it('auth flow: signup, login, me', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      email: 'worker1@example.com',
      password: 'Password123',
      full_name: 'Worker One',
      role: 'worker'
    });

    expect(signupRes.status).toBe(201);
    expect(signupRes.body.token).toBeTruthy();

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'worker1@example.com',
      password: 'Password123'
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeTruthy();

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe('worker1@example.com');
  });

  it('emergency lifecycle: create, assign, update status', async () => {
    const admin = await User.create({
      email: 'admin1@example.com',
      password: 'Password123',
      full_name: 'Admin One',
      role: 'admin'
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin1@example.com',
      password: 'Password123'
    });

    const rescue = await createTestUserAndToken({
      email: 'rescue1@example.com',
      password: 'Password123',
      full_name: 'Rescue One',
      role: 'rescue'
    });

    const worker = await createTestUserAndToken({
      email: 'worker2@example.com',
      password: 'Password123',
      full_name: 'Worker Two',
      role: 'worker'
    });

    const createEmergencyRes = await request(app)
      .post('/api/emergencies')
      .set('Authorization', `Bearer ${worker.token}`)
      .send({
        type: 'gas_leak',
        severity: 'high',
        location: 'Shaft A',
        description: 'Detected dangerous methane level'
      });

    expect(createEmergencyRes.status).toBe(201);
    const emergencyId = String(createEmergencyRes.body.emergency._id);

    const assignRes = await request(app)
      .patch(`/api/emergencies/${emergencyId}/assign`)
      .set('Authorization', `Bearer ${adminLogin.body.token}`)
      .send({ assigned_to: rescue.userId });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.emergency.status).toBe('in_progress');

    const statusRes = await request(app)
      .patch(`/api/emergencies/${emergencyId}/status`)
      .set('Authorization', `Bearer ${rescue.token}`)
      .send({ status: 'resolved' });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.emergency.status).toBe('resolved');

    await admin.deleteOne();
  });

  it('shift acknowledgment flow', async () => {
    const supervisor = await createTestUserAndToken({
      email: 'supervisor1@example.com',
      password: 'Password123',
      full_name: 'Supervisor One',
      role: 'supervisor'
    });

    const worker = await createTestUserAndToken({
      email: 'worker3@example.com',
      password: 'Password123',
      full_name: 'Worker Three',
      role: 'worker'
    });

    const createShiftRes = await request(app)
      .post('/api/shifts')
      .set('Authorization', `Bearer ${supervisor.token}`)
      .send({
        shift: 'morning',
        production_summary: 'Target achieved',
        equipment_status: 'All systems operational',
        red_flag: false
      });

    expect(createShiftRes.status).toBe(201);
    const shiftId = String(createShiftRes.body.shift_log._id);

    const ackRes = await request(app)
      .post(`/api/shifts/${shiftId}/acknowledge`)
      .set('Authorization', `Bearer ${worker.token}`)
      .send();

    expect(ackRes.status).toBe(200);
    expect(ackRes.body.acknowledgement.shift_log_id).toBe(shiftId);
  });

  it('hazards CRUD flow', async () => {
    await User.create({
      email: 'admin2@example.com',
      password: 'Password123',
      full_name: 'Admin Two',
      role: 'admin'
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin2@example.com',
      password: 'Password123'
    });

    const token = adminLogin.body.token as string;

    const createHazardRes = await request(app)
      .post('/api/hazards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hazard_name: 'Loose cable near conveyor',
        description: 'Possible trip hazard',
        risk_level: 'medium',
        control_measure: 'Cable guards and signage',
        responsible_person: 'Safety Lead',
        review_date: new Date().toISOString(),
        status: 'active'
      });

    expect(createHazardRes.status).toBe(201);
    const hazardId = String(createHazardRes.body.hazard._id);

    const listRes = await request(app)
      .get('/api/hazards')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.hazards)).toBe(true);

    const updateRes = await request(app)
      .patch(`/api/hazards/${hazardId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'mitigated' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.hazard.status).toBe('mitigated');

    const deleteRes = await request(app)
      .delete(`/api/hazards/${hazardId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
  });
});
