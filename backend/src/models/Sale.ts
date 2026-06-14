import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ISale extends Document {
  saleNumber: string;
  customerId: mongoose.Types.ObjectId;
  items: ISaleItem[];
  subtotal: number;
  gstAmount: number;
  gstRate: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  quantity: Number,
  price: Number,
  total: Number
});

const saleSchema = new Schema<ISale>(
  {
    saleNumber: { type: String, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [saleItemSchema],
    subtotal: Number,
    gstAmount: Number,
    gstRate: { type: Number, default: 18 },
    discount: { type: Number, default: 0 },
    total: Number,
    paymentMethod: { type: String, enum: ['cash', 'card', 'check', 'online'], default: 'cash' },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model<ISale>('Sale', saleSchema);
