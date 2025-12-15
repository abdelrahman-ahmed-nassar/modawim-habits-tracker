import express, { Router } from "express";
import * as analyticsController from "../controllers/analyticsController";

const router: Router = express.Router();

// GET /api/analytics/overview - Overall statistics and trends
router.get("/overview", analyticsController.getOverallAnalytics);

// GET /api/analytics/habits/:id - Individual habit analytics
router.get("/habits/:id", analyticsController.getHabitAnalytics);

// GET /api/analytics/daily/:date - Daily completion analytics
router.get("/daily/:date", analyticsController.getDailyAnalytics);

// GET /api/analytics/weekly/:startDate - Weekly analytics
router.get("/weekly/:startDate", analyticsController.getWeeklyAnalytics);

// GET /api/analytics/monthly/:year/:month - Monthly analytics
router.get("/monthly/:year/:month", analyticsController.getMonthlyAnalytics);

// GET /api/analytics/quarter/:startDate - Quarter year analytics (91 days)
router.get("/quarter/:startDate", analyticsController.getQuarterAnalytics);

// GET /api/analytics/habits - Analytics for all habits
router.get("/habits", analyticsController.getAllHabitsAnalytics);

export default router;
