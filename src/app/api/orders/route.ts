import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import { v4 as uuidv4 } from 'uuid';

// Number of orders required between discount code generations
const REQUIRED_ORDER_COUNT = 3;

// Function to generate a short 5-character UUID for coupon codes
const generateShortUUID = () => uuidv4().slice(0, 5);

/**
 * Handler for GET requests to fetch all orders.
 *
 * @returns {Promise<NextResponse>} JSON response containing all orders.
 */
export async function GET() {
  try {
    // Establish a connection to the database
    await connectDB();

    // Fetch all orders, sorted by most recent
    const orders = await Order.find({}).sort({ createdAt: -1 });

    // Return the orders in JSON format
    return NextResponse.json(orders);
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching orders:', error);

    // Return a 500 Internal Server Error response with an error message
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

/**
 * Handler for POST requests to create a new order.
 *
 * @param {Request} request - The HTTP request object.
 * @returns {Promise<NextResponse>} JSON response containing order details and any available coupon.
 */
export async function POST(request: NextRequest) {
  try {
    // Establish a connection to the database
    await connectDB();

    // Parse the request body
    const { items, subtotal, discountApplied, totalPrice, name, address, couponUsed } = await request.json();

    // Create a new order in the database
    const newOrder = await Order.create({
      items,
      subtotal,
      discountApplied,
      totalPrice,
      name,
      address,
      couponUsed,
      usedCoupon: !!couponUsed, // Boolean flag indicating if a coupon was used
    });

    // Fetch the last order where a coupon was used
    const lastCouponOrder = await Order.findOne({ usedCoupon: true }).sort({ createdAt: -1 });

    // Calculate the number of orders since the last coupon was used
    const ordersSinceLastCoupon = await Order.countDocuments(
      lastCouponOrder ? { createdAt: { $gt: lastCouponOrder.createdAt } } : {}
    );

    // Check if a new coupon should be generated
    let coupon = await Coupon.findOne({ isUsed: false });
    if (!coupon && ordersSinceLastCoupon % REQUIRED_ORDER_COUNT === 0) {
      // Generate a new coupon code
      const newCouponCode = generateShortUUID();

      // Create a new coupon in the database
      coupon = await Coupon.create({
        code: newCouponCode,
        discount: 0.1, // Set the global discount rate (e.g., 10%)
        isUsed: false,
      });
    }

    // If a coupon was used, mark it as used
    if (couponUsed) {
      await Coupon.updateOne({ code: couponUsed }, { isUsed: true });
    }

    // Respond with order details and any available coupon
    return NextResponse.json({
      message: 'Order created successfully',
      order: newOrder,
      couponAvailable: coupon || null,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error creating order:', error);

    // Return a 500 Internal Server Error response with an error message
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}