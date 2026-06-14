import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  birthday?: Date;
  anniversary?: Date;
  notes?: string;
  totalSpent: number;
  totalPurchases: number;
  lastVisit?: Date;
  isVIP: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    birthday: Date,
    anniversary: Date,
    notes: String,
    totalSpent: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    lastVisit: Date,
    isVIP: { type: Boolean, default: false }
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', phone: 1, email: 1 });

export default mongoose.model<ICustomer>('Customer', customerSchema);
