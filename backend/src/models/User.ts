import mongoose, { Schema, Document } from 'mongoose';
import { ROLES } from '../config/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.STAFF },
    phone: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
