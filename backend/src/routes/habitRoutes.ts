import express, { Router } from "express";
import * as habitController from "../controllers/habitController";
import * as completionController from "../controllers/completionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// All habit routes require authentication
router.use(authMiddleware);

// GET /api/habits - Get all habits for current user
router.get("/", habitController.getAllHabits);

// POST /api/habits/sync-analytics - Sync analytics for all habits of current user
router.post("/sync-analytics", habitController.syncHabitAnalytics);

// PUT /api/habits/reorder - Reorder habits for current user
router.put("/reorder", habitController.reorderHabits);

// GET /api/habits/random/pick - Get a random habit for current user
router.get("/random/pick", habitController.getRandomHabit);

// POST /api/habits - Create new habit for current user
router.post("/", habitController.createHabit);

// GET /api/habits/:id - Get a specific habit (owned by current user)
router.get("/:id", habitController.getHabitById);

// PUT /api/habits/:id - Update habit (owned by current user)
router.put("/:id", habitController.updateHabit);

// DELETE /api/habits/:id - Delete habit (owned by current user)
router.delete("/:id", habitController.deleteHabit);

// GET /api/habits/:id/records - Get habit completion records (owned by current user)
router.get("/:id/records", completionController.getHabitCompletions);

// POST /api/habits/:id/complete - Mark habit as complete for a date
router.post("/:id/complete", completionController.markHabitComplete);

// DELETE /api/habits/:id/complete/:date - Unmark completion
router.delete("/:id/complete/:date", completionController.deleteCompletion);

// POST /api/habits/:id/archive - Archive a habit
router.post("/:id/archive", habitController.archiveHabit);

// POST /api/habits/:id/restore - Restore a habit
router.post("/:id/restore", habitController.restoreHabit);

// POST /api/habits/:id/sync-analytics - Sync analytics for a specific habit
router.post("/:id/sync-analytics", habitController.syncHabitAnalytics);

export default router;
