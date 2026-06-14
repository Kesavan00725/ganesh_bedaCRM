import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  shopName: string;
  gstNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    shopName: { type: String, required: true },
    gstNumber: String,
    address: String,
    phone: String,
    email: String,
    logo: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
