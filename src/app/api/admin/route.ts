import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { OrderDocument, AdminStats, ItemSales } from '@/types/adminTypes';

export async function GET() {
  try {
    await connectDB();

    // Fetch all orders
    const orders: OrderDocument[] = await Order.find({});

    // Initialize stats
    let totalPurchaseAmount = 0;
    let totalDiscountAmount = 0;
    const discountCodesUsed = new Set<string>();
    const itemSales: Record<string, ItemSales> = {};

    // Process each order
    orders.forEach((order) => {
      // Calculate total purchase and discount amounts
      totalPurchaseAmount += order.totalPrice;
      totalDiscountAmount += order.subtotal - order.totalPrice;

      // Collect discount codes
      if (order.couponUsed) {
        discountCodesUsed.add(order.couponUsed);
      }

      // Count item sales
      order.items.forEach((item) => {
        if (itemSales[item.id]) {
          itemSales[item.id].count += item.quantity;
        } else {
          itemSales[item.id] = { id: item.id, title: item.title, count: item.quantity };
        }
      });
    });

    // Prepare response
    const stats: AdminStats = {
      totalPurchaseAmount,
      totalDiscountAmount,
      discountCodesUsed: Array.from(discountCodesUsed),
      itemSales: Object.values(itemSales), // Convert to array for easier consumption
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}