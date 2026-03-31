import mongoose, { Schema, type Document } from 'mongoose';

export interface IHazard extends Document {
  hazard_name: string;
  description?: string;
  risk_level: 'low' | 'medium' | 'high';
  control_measure?: string;
  responsible_person?: string;
  review_date?: Date;
  status: string;
  created_at: Date;
}

const hazardSchema = new Schema<IHazard>({
  hazard_name: {
    type: String,
    required: [true, 'Hazard name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  risk_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: [true, 'Risk level is required']
  },
  control_measure: {
    type: String,
    trim: true
  },
  responsible_person: {
    type: String,
    trim: true
  },
  review_date: {
    type: Date
  },
  status: {
    type: String,
    default: 'active',
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
hazardSchema.index({ risk_level: 1 });
hazardSchema.index({ status: 1 });
hazardSchema.index({ created_at: -1 });
hazardSchema.index({ review_date: 1 });

// Serialize _id as id, remove __v
hazardSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toString();
    Reflect.deleteProperty(ret, '_id');
    Reflect.deleteProperty(ret, '__v');
    return ret;
  }
});

export const Hazard = mongoose.model<IHazard>('Hazard', hazardSchema);
