import mongoose, { Schema, type Document } from 'mongoose';

export interface IShiftAcknowledgement extends Document {
  shift_log_id: mongoose.Types.ObjectId;
  acknowledged_by: mongoose.Types.ObjectId;
  acknowledged_at: Date;
}

const shiftAcknowledgementSchema = new Schema<IShiftAcknowledgement>({
  shift_log_id: {
    type: Schema.Types.ObjectId,
    ref: 'ShiftLog',
    required: [true, 'Shift log ID is required']
  },
  acknowledged_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Acknowledger is required']
  },
  acknowledged_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
shiftAcknowledgementSchema.index({ shift_log_id: 1 });
shiftAcknowledgementSchema.index({ acknowledged_by: 1 });
shiftAcknowledgementSchema.index({ acknowledged_at: -1 });

export const ShiftAcknowledgement = mongoose.model<IShiftAcknowledgement>(
  'ShiftAcknowledgement',
  shiftAcknowledgementSchema
);
