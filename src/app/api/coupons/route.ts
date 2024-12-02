import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

/**
 * Handles GET requests to fetch an available unused coupon.
 *
 * @returns {Promise<NextResponse>} JSON response with the coupon data or an error message.
 */
export async function GET() {
  try {
    // Establish a connection to the database
    await connectDB();

    // Query the database for the first available unused coupon
    const coupon = await Coupon.findOne({ isUsed: false }).select('code discount createdAt');

    // Return a structured JSON response
    return NextResponse.json({
      message: coupon ? 'Unused coupon found' : 'No unused coupon available',
      coupon: coupon || null,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching coupon:', error);

    // Return a 500 Internal Server Error response with a generic error message
    return NextResponse.json(
      { error: 'Failed to fetch coupon', code: 'COUPON_FETCH_ERROR' },
      { status: 500 }
    );
  }
}