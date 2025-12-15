import express, { Router } from "express";
import * as recordsController from "../controllers/recordsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// All records routes are scoped to the authenticated user
router.use(authMiddleware);

router.get("/daily/:date", recordsController.getDailyRecords);
router.get("/weekly/:startDate", recordsController.getWeeklyRecords);
router.get("/monthly/:year/:month", recordsController.getMonthlyRecords);

export default router;
