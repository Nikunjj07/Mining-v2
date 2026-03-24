import mongoose, { Schema, type Document } from 'mongoose';

export interface IShiftLog extends Document {
  shift: 'morning' | 'evening' | 'night';
  production_summary?: string;
  equipment_status?: string;
  safety_issues?: string;
  red_flag: boolean;
  next_shift_instructions?: string;
  acknowledged: boolean;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
}

const shiftLogSchema = new Schema<IShiftLog>({
  shift: {
    type: String,
    enum: ['morning', 'evening', 'night'],
    required: [true, 'Shift type is required']
  },
  production_summary: {
    type: String,
    trim: true
  },
  equipment_status: {
    type: String,
    trim: true
  },
  safety_issues: {
    type: String,
    trim: true
  },
  red_flag: {
    type: Boolean,
    default: false
  },
  next_shift_instructions: {
    type: String,
    trim: true
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
shiftLogSchema.index({ created_by: 1 });
shiftLogSchema.index({ acknowledged: 1 });
shiftLogSchema.index({ created_at: -1 });
shiftLogSchema.index({ red_flag: 1 });

export const ShiftLog = mongoose.model<IShiftLog>('ShiftLog', shiftLogSchema);
