import express, { Router } from "express";
import * as optionsController from "../controllers/optionsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// All options are per-user and require authentication
router.use(authMiddleware);

// Mood routes
router.get("/moods", optionsController.getMoods);
router.post("/moods", optionsController.addMood);
router.delete("/moods/:mood", optionsController.removeMood);

// Productivity level routes
router.get("/productivity-levels", optionsController.getProductivityLevels);
router.post("/productivity-levels", optionsController.addProductivityLevel);
router.delete(
  "/productivity-levels/:level",
  optionsController.removeProductivityLevel
);

export default router;
