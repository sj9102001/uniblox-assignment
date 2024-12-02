import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICoupon {
  code: string;
  discount: number;
  isUsed: boolean;
}

export interface CouponDocument extends ICoupon, Document {}

const CouponSchema = new Schema<CouponDocument>({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  isUsed: { type: Boolean, default: false },
});

const Coupon = models.Coupon || model<CouponDocument>('Coupon', CouponSchema);

export default Coupon;