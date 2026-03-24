import mongoose, { Schema, type Document } from 'mongoose';

export interface IUserLocation extends Document {
  user_id: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy?: number;
  last_updated: Date;
  is_active: boolean;
}

const userLocationSchema = new Schema<IUserLocation>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  accuracy: {
    type: Number
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  }
});

// Indexes (user_id index is auto-created by unique: true)
userLocationSchema.index({ is_active: 1 });
userLocationSchema.index({ last_updated: -1 });
// Geospatial index for location queries
userLocationSchema.index({ location: '2dsphere' });

// Create virtual location field for geospatial queries
userLocationSchema.virtual('location').get(function () {
  return {
    type: 'Point',
    coordinates: [this.longitude, this.latitude]
  };
});

export const UserLocation = mongoose.model<IUserLocation>('UserLocation', userLocationSchema);
