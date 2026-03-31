import mongoose, { Schema, type Document } from 'mongoose';

export interface IEmergency extends Document {
  type: 'gas_leak' | 'fire' | 'collapse' | 'equipment_failure' | 'worker_trapped' | 'ventilation_failure';
  severity: 'low' | 'medium' | 'high';
  location?: string;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: 'active' | 'in_progress' | 'resolved';
  reported_by: mongoose.Types.ObjectId;
  assigned_to?: mongoose.Types.ObjectId;
  created_at: Date;
  resolved_at?: Date;
}

const emergencySchema = new Schema<IEmergency>({
  type: {
    type: String,
    enum: ['gas_leak', 'fire', 'collapse', 'equipment_failure', 'worker_trapped', 'ventilation_failure'],
    required: [true, 'Emergency type is required']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: [true, 'Severity is required']
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'in_progress', 'resolved'],
    default: 'active'
  },
  reported_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  resolved_at: {
    type: Date
  }
});

// Indexes
emergencySchema.index({ status: 1 });
emergencySchema.index({ severity: 1 });
emergencySchema.index({ reported_by: 1 });
emergencySchema.index({ assigned_to: 1 });
emergencySchema.index({ created_at: -1 });
emergencySchema.index({ type: 1 });

// Serialize _id as id, remove __v
emergencySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toString();
    Reflect.deleteProperty(ret, '_id');
    Reflect.deleteProperty(ret, '__v');
    return ret;
  }
});

export const Emergency = mongoose.model<IEmergency>('Emergency', emergencySchema);
