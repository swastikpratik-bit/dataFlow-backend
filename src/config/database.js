import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

console.log("🔍 Environment variables loaded:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon and most cloud databases
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increased timeout for cloud databases
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    console.log("🔄 Testing database connection...");
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    console.log("✅ Database connected successfully!");
    console.log(`   Connected at: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    return false;
  }
};

// Handle pool events
pool.on('connect', (client) => {
  console.log('🔗 New client connected to database');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down database connections...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

// Export connection test function
export { testConnection };

export const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: dbConfig.ssl,
};