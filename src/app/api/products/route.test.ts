/**
 * @jest-environment node
 */
import { GET } from './route'; // Adjust the import path to your actual handler
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// Mock the dependencies
jest.mock('@/lib/mongodb');
jest.mock('@/models/Product');

describe('GET handler for fetching products', () => {
  it('should return all products successfully', async () => {
    // Mock the database connection
    (connectToDatabase as jest.Mock).mockResolvedValueOnce(true);

    // Mock the Product.find method to return sample data
    (Product.find as jest.Mock).mockResolvedValueOnce([{ name: 'Product 1', price: 100 }, { name: 'Product 2', price: 150 }]);

    // Call the GET handler
    const response = await GET();

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response contains the correct products
    const products = await response.json();
    expect(products).toEqual([{ name: 'Product 1', price: 100 }, { name: 'Product 2', price: 150 }]);
  });
  it('should return a 500 error if there is a database connection failure', async () => {
    // Simulate a database connection error (e.g., connection refused)
    (connectToDatabase as jest.Mock).mockRejectedValueOnce(new Error('Failed to connect to the database'));

    // Call the GET handler
    const response = await GET();

    // Assert that the response status is 500
    expect(response.status).toBe(500);

    // Assert that the response contains the correct error message
    const error = await response.json();
    expect(error).toEqual({ error: 'Error fetching products' });
  });
  it('should return a 500 error if there is an issue', async () => {
    // Simulate a database connection error
    (connectToDatabase as jest.Mock).mockRejectedValueOnce(new Error('Database connection error'));

    // Call the GET handler
    const response = await GET();

    // Assert that the response status is 500
    expect(response.status).toBe(500);

    // Assert that the response contains the correct error message
    const error = await response.json();
    expect(error).toEqual({ error: 'Error fetching products' });
  });
});