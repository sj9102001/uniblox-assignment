/**
 * @jest-environment node
 */
import { GET } from './route';
import { matchers } from 'jest-json-schema';

expect.extend(matchers);

// Mock database models and connection
jest.mock('@/lib/mongodb', () => jest.fn(async () => {}));
jest.mock('@/models/Order', () => ({
  find: jest.fn(),
}));

const Order = require('@/models/Order');

describe('GET Admin Stats API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    Order.find.mockReset();
  });

  it('should return stats with status 200 when orders exist', async () => {
    // Mock orders
    const mockOrders = [
      {
        totalPrice: 100,
        subtotal: 120,
        couponUsed: 'DISCOUNT10',
        items: [
          { id: 'item1', title: 'Product 1', quantity: 2 },
          { id: 'item2', title: 'Product 2', quantity: 1 },
        ],
      },
      {
        totalPrice: 50,
        subtotal: 50,
        couponUsed: null,
        items: [{ id: 'item1', title: 'Product 1', quantity: 1 }],
      },
    ];
    Order.find.mockResolvedValue(mockOrders);

    const response = await GET();
    const body = await response.json();

    const schema = {
      type: 'object',
      properties: {
        totalPurchaseAmount: { type: 'number' },
        totalDiscountAmount: { type: 'number' },
        discountCodesUsed: {
          type: 'array',
          items: { type: 'string' },
        },
        itemSales: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              count: { type: 'number' },
            },
            required: ['id', 'title', 'count'],
          },
        },
      },
      required: ['totalPurchaseAmount', 'totalDiscountAmount', 'discountCodesUsed', 'itemSales'],
    };

    expect(response.status).toBe(200);
    expect(body).toMatchSchema(schema);
    expect(body.totalPurchaseAmount).toBe(150);
    expect(body.totalDiscountAmount).toBe(20);
    expect(body.discountCodesUsed).toEqual(['DISCOUNT10']);
    expect(body.itemSales).toEqual([
      { id: 'item1', title: 'Product 1', count: 3 },
      { id: 'item2', title: 'Product 2', count: 1 },
    ]);
  });

  it('should return empty stats with status 200 when no orders exist', async () => {
    // Mock no orders
    Order.find.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalPurchaseAmount).toBe(0);
    expect(body.totalDiscountAmount).toBe(0);
    expect(body.discountCodesUsed).toEqual([]);
    expect(body.itemSales).toEqual([]);
  });

  it('should return error with status 500 on database failure', async () => {
    // Mock a database error
    Order.find.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: 'Failed to fetch admin stats',
    });
  });
});
