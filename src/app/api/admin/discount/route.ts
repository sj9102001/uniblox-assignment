import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import Order from '@/models/Order';
import { v4 as uuidv4 } from 'uuid';

// Define the number of orders required between discount code generations
const REQUIRED_ORDERS = 3;

// Function to generate a short 5-character UUID for the coupon code
const generateShortUUID = () => uuidv4().slice(0, 5);

// Handler for the GET request to generate or fetch a discount coupon
export async function GET() {
  try {
    // Connect to the MongoDB database
    await connectDB();

    // Check for an existing unused global discount code
    let coupon = await Coupon.findOne({ isUsed: false });

    // If an unused coupon exists, return it
    if (coupon) {
      return NextResponse.json({
        message: 'Coupon fetched successfully',
        coupon: {
          code: coupon.code,
          discount: coupon.discount,
        },
      });
    }

    // Fetch the most recent used discount code, if any
    const lastUsedCoupon = await Coupon.findOne({ isUsed: true }).sort({ createdAt: -1 });

    // Determine the number of orders since the last used coupon
    let ordersSinceLastCoupon;
    if (lastUsedCoupon) {
      // If there is a last used coupon, count orders created after it was used
      ordersSinceLastCoupon = await Order.countDocuments({
        createdAt: { $gt: lastUsedCoupon.createdAt },
      });
    } else {
      // If no coupon has been used before, count all orders
      ordersSinceLastCoupon = await Order.countDocuments({});
    }

    // Check if the required number of orders has been met to generate a new coupon
    if (ordersSinceLastCoupon < REQUIRED_ORDERS) {
      return NextResponse.json({
        message: `Condition not satisfied. At least ${REQUIRED_ORDERS} orders are required since the last discount code was used.`,
        coupon: null,
      });
    }

    // Generate a new coupon code
    const newCouponCode = generateShortUUID();

    // Create a new coupon in the database
    coupon = await Coupon.create({
      code: newCouponCode,
      discount: 0.1, // Set the global discount rate (10% in this case)
      isUsed: false,
    });

    // Respond with the newly created coupon
    return NextResponse.json({
      message: 'Coupon generated successfully',
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
      },
    });
  } catch (error) {
    console.error('Error fetching or creating discount code:', error);
    return NextResponse.json(
      { error: 'Error generating discount code' },
      { status: 500 }
    );
  }
}