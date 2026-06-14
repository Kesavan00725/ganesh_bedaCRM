import mongoose, { Schema, Document } from 'mongoose';
import { JEWELRY_CATEGORIES, PURITY_TYPES } from '../config/constants';

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  weight: number;
  purity: string;
  makingCharges: number;
  price: number;
  stock: number;
  minStockLevel: number;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, enum: Object.values(JEWELRY_CATEGORIES), required: true },
    weight: { type: Number, required: true },
    purity: { type: String, enum: Object.values(PURITY_TYPES), required: true },
    makingCharges: { type: Number, default: 0 },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    minStockLevel: { type: Number, default: 5 },
    description: String,
    image: String
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', sku: 1, category: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
