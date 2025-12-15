import express, { Router } from "express";
import * as analyticsController from "../controllers/analyticsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// All analytics are scoped to the authenticated user
router.use(authMiddleware);

router.get("/overview", analyticsController.getOverallAnalytics);
router.get("/habits/:id", analyticsController.getHabitAnalytics);
router.get("/daily/:date", analyticsController.getDailyAnalytics);
router.get("/weekly/:startDate", analyticsController.getWeeklyAnalytics);
router.get("/monthly/:year/:month", analyticsController.getMonthlyAnalytics);
router.get("/quarter/:startDate", analyticsController.getQuarterAnalytics);
router.get("/habits", analyticsController.getAllHabitsAnalytics);

export default router;
