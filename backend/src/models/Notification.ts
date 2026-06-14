import mongoose, { Schema, Document } from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants';

export interface INotification extends Document {
  type: string;
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: Schema.Types.ObjectId,
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
