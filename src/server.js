import app from "./app.js";
import { testConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;

// Initialize server with database connection test
const startServer = async () => {
  try {
    // Test database connection first
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Start server only if database is connected
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ All systems ready!\n`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();