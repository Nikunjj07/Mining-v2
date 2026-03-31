import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();
const PORT = env.PORT;

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
