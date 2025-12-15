import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
const path = require("path");

import habitRoutes from "./routes/habitRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import noteRoutes from "./routes/noteRoutes";
import recordsRoutes from "./routes/recordsRoutes";
import completionsRoutes from "./routes/completionsRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import optionsRoutes from "./routes/optionsRoutes";
import tagRoutes from "./routes/tagRoutes";
import templateRoutes from "./routes/templateRoutes";
import counterRoutes from "./routes/counterRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { applyPendingUpdate } from "./utils/updateApplier";

const app: Express = express();
const PORT = process.env.PORT || 5002;

// Check for and apply any pending updates before starting the server
console.log("🔍 Checking for pending updates...");
const updateApplied = applyPendingUpdate();
if (updateApplied) {
  console.log("✨ Update has been prepared for next restart");
}

// Function to start server with proper error handling
const startServer = (port: number): void => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port} 🚀`);
    console.log(`################################`);
    console.log(`#                              #`);
    console.log(`#       Ctrl + Click           #`);
    console.log(`#                              #`);
    console.log(`#            ||                #`);
    console.log(`#            \\/                #`);
    console.log(`#                              #`);
    console.log(`#     http://localhost:${port}    #`);
    console.log(`#                              #`);
    console.log(`#                              #`);
    console.log(`################################`);
  });

  // Handle server errors
  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.error(`❌ ERROR: Port ${port} is already in use!`);
      console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      console.error(
        `The application MUST run on port ${port} to work properly.`
      );
      console.error(
        `The frontend is configured to connect to this specific port.\n`
      );
      console.error(`📋 Solutions:\n`);
      console.error(`1️⃣  Close any application using port ${port}`);
      console.error(`    - Check if another instance of this app is running`);
      console.error(`    - Look for other development servers\n`);
      console.error(`2️⃣  Find and kill the process using port ${port}:`);
      console.error(`    Windows:`);
      console.error(`      netstat -ano | findstr :${port}`);
      console.error(`      taskkill /PID <PID_NUMBER> /F`);
      console.error(`    `);
      console.error(`    Mac/Linux:`);
      console.error(`      lsof -ti:${port} | xargs kill -9\n`);
      console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      console.error(`Press any key to exit...`);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on("data", () => process.exit(1));
    } else if (error.code === "EACCES") {
      console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.error(`❌ ERROR: Permission denied for port ${port}`);
      console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      console.error(`You don't have permission to use this port.\n`);
      console.error(`📋 Solutions:\n`);
      console.error(
        `1️⃣  Run as administrator (Windows) or with sudo (Mac/Linux)`
      );
      console.error(
        `2️⃣  Use a port number above 1024 (requires code changes)\n`
      );
      console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      console.error(`Press any key to exit...`);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on("data", () => process.exit(1));
    } else {
      console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.error(`❌ Server Error`);
      console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      console.error(error);
      console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      console.error(`Press any key to exit...`);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on("data", () => process.exit(1));
    }
  });
};

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/habits", habitRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/completions", completionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/counters", counterRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../../../build")));

// Serve React app for all other routes (should be last)
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../../../build", "index.html"));
});

// Error handling middleware
app.use(errorHandler);

// Start server with automatic port fallback
startServer(Number(PORT));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("\n❌ Uncaught Exception:", error);
  console.error("Press any key to exit...");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", () => process.exit(1));
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("\n❌ Unhandled Rejection at:", promise, "reason:", reason);
  console.error("Press any key to exit...");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", () => process.exit(1));
});

export default app;
