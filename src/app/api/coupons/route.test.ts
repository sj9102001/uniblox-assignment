/**
 * @jest-environment node
 */
import { GET } from './route';
import { matchers } from 'jest-json-schema';

// Extend Jest with JSON schema matchers
expect.extend(matchers);

// Mock database models and connection
jest.mock('@/lib/mongodb', () => jest.fn(async () => {}));
jest.mock('@/models/Coupon', () => ({
  findOne: jest.fn(),
}));

const Coupon = require('@/models/Coupon');

describe('GET Coupons API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    Coupon.findOne.mockReset(); 
  });
  it('should return data with status 200 when an unused coupon exists', async () => {
    // Mock a valid coupon
    Coupon.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        code: 'TEST123',
        discount: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
      }),
    }));
  
    const response = await GET();
    const body = await response.json();
  
    expect(response.status).toBe(200);
    expect(body.message).toBe('Unused coupon found');
    expect(body.coupon.code).toBe('TEST123');
  });
  
  it('should return data with status 200 when no unused coupon exists', async () => {
    // Mock no coupon found
    Coupon.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));
  
    const response = await GET();
    const body = await response.json();
  
    expect(response.status).toBe(200);
    expect(body.message).toBe('No unused coupon available');
    expect(body.coupon).toBeNull();
  });
  
  it('should return data with status 500 on server error', async () => {
    // Mock a server error
    Coupon.findOne.mockImplementation(() => ({
      select: jest.fn().mockRejectedValue(new Error('Database error')),
    }));
  
    const response = await GET();
    const body = await response.json();
  
    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: 'Failed to fetch coupon',
      code: 'COUPON_FETCH_ERROR',
    });
  });
});
