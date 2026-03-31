import mongoose, { Schema, type Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export interface IUser extends Document {
  email: string;
  password: string;
  full_name?: string;
  role: 'admin' | 'supervisor' | 'worker' | 'rescue';
  phone_number?: string;
  created_at: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password by default in queries
  },
  full_name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'supervisor', 'worker', 'rescue'],
    required: [true, 'Role is required'],
    default: 'worker'
  },
  phone_number: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes (email index is auto-created by unique: true)
userSchema.index({ role: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Serialize _id as id, remove __v and password
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = (ret._id as mongoose.Types.ObjectId).toString();
    Reflect.deleteProperty(ret, '_id');
    Reflect.deleteProperty(ret, '__v');
    Reflect.deleteProperty(ret, 'password');
    return ret;
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
