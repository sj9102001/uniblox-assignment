/**
 * @jest-environment node
 */
import { GET, POST } from './route'; // Adjust the import path to your actual handlers
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import { NextResponse } from 'next/server';

// Mock the dependencies
jest.mock('@/lib/mongodb');
jest.mock('@/models/Order', () => ({
  find: jest.fn(() => ({
    sort: jest.fn().mockResolvedValueOnce([
        { _id: '1', items: ['Item 1'], totalPrice: 100 },
        { _id: '2', items: ['Item 2'], totalPrice: 150 },
      ]), // Chainable mock
  })),
  countDocuments: jest.fn(),
  create: jest.fn(),
}));
jest.mock('@/models/Coupon', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
}));
jest.mock('uuid', () => ({ v4: jest.fn(() => '12345') }));

describe('Order API handlers', () => {
  // Test the GET handler
  describe('GET', () => {
    it('should return all orders successfully', async () => {
      // Mock the database connection
      (connectDB as jest.Mock).mockResolvedValueOnce(true);

      // Call the GET handler
      const response = await GET();

      // Assert that the response status is 200
      expect(response.status).toBe(200);

      // Assert that the response contains the correct orders
      const orders = await response.json();
      expect(orders).toEqual([
        { _id: '1', items: ['Item 1'], totalPrice: 100 },
        { _id: '2', items: ['Item 2'], totalPrice: 150 },
      ]);
    });

    it('should return a 500 error if there is a database connection failure', async () => {
      // Simulate a database connection error
      (connectDB as jest.Mock).mockRejectedValueOnce(new Error('Failed to connect to the database'));

      // Call the GET handler
      const response = await GET();

      // Assert that the response status is 500
      expect(response.status).toBe(500);

      // Assert that the response contains the correct error message
      const error = await response.json();
      expect(error).toEqual({ error: 'Failed to fetch orders' });
    });
  });
});