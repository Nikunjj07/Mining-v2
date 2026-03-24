import mongoose, { Schema, type Document } from 'mongoose';

export type NotificationType = 'emergency_created' | 'emergency_assigned' | 'emergency_status_changed' | 'shift_acknowledgment_required';

export interface INotification extends Document {
  user_id: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  related_table?: string;
  read: boolean;
  created_at: Date;
}

const notificationSchema = new Schema<INotification>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['emergency_created', 'emergency_assigned', 'emergency_status_changed', 'shift_acknowledgment_required'],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  related_id: {
    type: String,
    trim: true
  },
  related_table: {
    type: String,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ created_at: -1 });
notificationSchema.index({ type: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
