/**
 * @jest-environment node
 */
import { GET } from './route';

// Mock database models and connection
jest.mock('@/lib/mongodb', () => jest.fn(async () => {}));
jest.mock('@/models/Coupon', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('@/models/Order', () => ({
  countDocuments: jest.fn(),
}));

const Coupon = require('@/models/Coupon');
const Order = require('@/models/Order');

describe('GET Discount Coupon API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an unused coupon if it exists', async () => {
    // Mock an unused coupon
    Coupon.findOne.mockResolvedValue({
      code: 'TEST123',
      discount: 0.1,
      isUsed: false,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      message: 'Coupon fetched successfully',
      coupon: {
        code: 'TEST123',
        discount: 0.1,
      },
    });
  });

  it('should return a condition not satisfied message if orders are less than required', async () => {
    // Mock no unused coupon
    Coupon.findOne
      .mockResolvedValueOnce(null) // First call: no unused coupon
      .mockImplementationOnce(() => ({
        sort: jest.fn().mockResolvedValue({
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          isUsed: true,
        }),
      })); // Second call: last used coupon with `sort`
  
    // Mock count of orders since the last used coupon
    Order.countDocuments.mockResolvedValue(2); // Less than REQUIRED_ORDERS
  
    const response = await GET();
    const body = await response.json();
  
    expect(response.status).toBe(200);
    expect(body).toEqual({
      message: `Condition not satisfied. At least 3 orders are required since the last discount code was used.`,
      coupon: null,
    });
  });
  
  it('should return a 500 status on database error', async () => {
    // Mock `findOne` to throw an error directly
    Coupon.findOne.mockRejectedValue(new Error('Database error'));
  
    const response = await GET();
    const body = await response.json();
  
    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: 'Error generating discount code',
    });
  });
});