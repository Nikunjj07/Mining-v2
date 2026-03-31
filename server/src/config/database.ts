import mongoose from 'mongoose';
import { env } from './env.js';
import { User } from '../models/User.model.js';

const dropLegacyUsernameIndex = async (): Promise<void> => {
  try {
    const indexes = await User.collection.indexes();
    const hasLegacyUsernameIndex = indexes.some((index) => index.name === 'username_1');

    if (hasLegacyUsernameIndex) {
      await User.collection.dropIndex('username_1');
      console.log('Removed legacy users.username_1 index');
    }
  } catch (error: any) {
    // Ignore missing collection namespace; warn for anything else.
    if (error?.codeName !== 'NamespaceNotFound') {
      console.warn('Could not verify/drop legacy username index:', error?.message || error);
    }
  }
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    await dropLegacyUsernameIndex();

    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
