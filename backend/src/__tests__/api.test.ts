import request from 'supertest';
import { app } from '../server';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Clean up database before testing
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test_' } } });
  });

  afterAll(async () => {
    // Clean up after testing
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test_' } } });
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('should return 200 OK for /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Authentication Flow', () => {
    const testUser = {
      email: 'test_user_' + Date.now() + '@example.com',
      password: 'password123'
    };

    it('should fail login for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should successfully signup a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(testUser.email);
    });

    it('should reject signup for existing email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('should successfully login an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('Shared Calculation Logic (/api/test-calc)', () => {
    it('should calculate payslip correctly even with missing array properties (null coalescing test)', async () => {
      const payload = {
        type: 'payslip',
        data: { basic: 50000, hra: 20000 } // Missing allowances and deductions
      };
      const res = await request(app)
        .post('/api/test-calc')
        .send(payload);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('netPay', 70000);
    });

    it('should return 400 for invalid calculation type', async () => {
      const payload = { type: 'unknown_type', data: {} };
      const res = await request(app)
        .post('/api/test-calc')
        .send(payload);
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
