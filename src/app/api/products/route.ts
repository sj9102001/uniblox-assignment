import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

/**
 * Handler for GET requests to fetch all products.
 *
 * @returns {Promise<NextResponse>} JSON response containing all products or an error message.
 */
export async function GET() {
  try {
    // Establish a connection to the MongoDB database
    await connectToDatabase();

    // Fetch all products from the database as plain JavaScript objects
    const products = await Product.find({}).lean();

    // Return the products as a JSON response with a 200 OK status
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching products:', error);

    // Return a 500 Internal Server Error response with a generic error message
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}