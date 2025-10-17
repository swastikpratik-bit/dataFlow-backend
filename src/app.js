import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler.js";
import uploadRoutes from "./routes/upload.js";
import dataRoutes from "./routes/data.js";
import authRoutes from "./routes/authRoutes.js";
import { User } from "./models/User.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());



// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Data Management API Server", status: "running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/data", dataRoutes);

// Initialize database tables
User.createTable().catch(console.error);

// Error handling
app.use(errorHandler);

export default app;