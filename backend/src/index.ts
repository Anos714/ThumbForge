import { app } from './app.js'
import { client } from './config/redis.js';
import { env } from './validators/env.validator.js';

const PORT = env.PORT || 8000;

const startServer = async () => {
  try {
    
    await client.connect();

    app.listen(PORT, () => {
      console.log(`Express server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server due to Redis/DB error:", error);
    process.exit(1);
  }
};

startServer();





