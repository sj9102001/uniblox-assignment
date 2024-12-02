import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IOrder {
  items: {
    id: string;
    title: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discountApplied: number;
  totalPrice: number;
  name: string;
  address: string;
  couponUsed?: string;
  usedCoupon: boolean; // New field to track if a coupon was applied
  createdAt: Date;
}

export interface OrderDocument extends IOrder, Document {}

const OrderSchema = new Schema<OrderDocument>({
  items: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  subtotal: { type: Number, required: true },
  discountApplied: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  couponUsed: { type: String },
  usedCoupon: { type: Boolean, default: false }, // Defaults to false if no coupon is used
  createdAt: { type: Date, default: Date.now },
});

const Order = models.Order || model<OrderDocument>('Order', OrderSchema);

export default Order;
