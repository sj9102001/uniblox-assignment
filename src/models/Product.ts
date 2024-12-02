import mongoose, { InferSchemaType, model, Model } from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  stock: { type: Number, required: true },
  tags: { type: [String] },
  brand: { type: String },
  thumbnail: { type: String },
});

// Infer the type from the schema
type ProductBase = InferSchemaType<typeof ProductSchema>;

// Extend the inferred type to include `_id`
export interface ProductDocument extends ProductBase {
  _id: mongoose.Types.ObjectId;
}

// Define the model
const Product = (mongoose.models.Product as Model<ProductDocument>) || 
  model<ProductDocument>("Product", ProductSchema);

export default Product;