import express, { Router } from "express";
import * as settingsController from "../controllers/settingsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// All settings are per-user and require authentication
router.use(authMiddleware);

// GET /api/settings - Get current settings
router.get("/", settingsController.getSettings);

// PUT /api/settings - Update settings
router.put("/", settingsController.updateSettings);

// DELETE /api/settings/reset-data - Reset all user data
router.delete("/reset-data", settingsController.resetData);

export default router;
