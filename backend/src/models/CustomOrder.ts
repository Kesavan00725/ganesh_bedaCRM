import mongoose, { Schema, Document } from 'mongoose';
import { ORDER_STATUSES } from '../config/constants';

export interface ICustomOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  productType: string;
  description: string;
  designImage?: string;
  estimatedCost: number;
  status: string;
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customOrderSchema = new Schema<ICustomOrder>(
  {
    orderNumber: { type: String, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    productType: String,
    description: String,
    designImage: String,
    estimatedCost: Number,
    status: { type: String, enum: Object.values(ORDER_STATUSES), default: ORDER_STATUSES.PENDING },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: Date,
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model<ICustomOrder>('CustomOrder', customOrderSchema);
