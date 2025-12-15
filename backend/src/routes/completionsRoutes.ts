import express, { Router } from "express";
import * as completionController from "../controllers/completionController";
import { toggleHabitCompletion } from "../controllers/toggleController";
import { AppError } from "../middleware/errorHandler";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// All completion routes are scoped to the authenticated user
router.use(authMiddleware);

// GET /api/completions/date/:date - Get all completions for a specific date
router.get("/date/:date", async (req, res, next) => {
  const { date } = req.params;
  try {
    const completions = await completionController.getDailyCompletions(
      req,
      res,
      next
    );
    return completions;
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 500));
    } else {
      next(new AppError("An unknown error occurred", 500));
    }
  }
});

// GET /api/completions/habit/:habitId - Get completions for a specific habit
router.get("/habit/:habitId", completionController.getHabitCompletions);

// GET /api/completions/range/:startDate/:endDate - Get completions for a date range
router.get(
  "/range/:startDate/:endDate",
  completionController.getCompletionsInRange
);

// POST /api/completions - Create a new completion
router.post("/", completionController.markHabitComplete);

// POST /api/completions/batch - Create multiple completions in a batch
router.post("/batch", completionController.createCompletionsBatch);

// POST /api/completions/toggle - Toggle a completion
router.post("/toggle", toggleHabitCompletion);

// DELETE /api/completions/:habitId/:date - Delete a completion
router.delete("/:habitId/:date", completionController.deleteCompletion);

// PUT /api/completions/:id - Update a completion
router.put("/:id", completionController.updateCompletion);

export default router;
