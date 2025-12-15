import express, { Router } from "express";
import * as counterController from "../controllers/counterController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// All counters are per-user and require authentication
router.use(authMiddleware);

// GET /api/counters - Get all counters
router.get("/", counterController.getAllCounters);

// GET /api/counters/:id - Get a specific counter
router.get("/:id", counterController.getCounterById);

// POST /api/counters - Create new counter
router.post("/", counterController.createCounter);

// PUT /api/counters/:id - Update counter
router.put("/:id", counterController.updateCounter);

// PATCH /api/counters/:id/count - Update counter count
router.patch("/:id/count", counterController.patchCounterCount);

// DELETE /api/counters/:id - Delete counter
router.delete("/:id", counterController.deleteCounter);

// Export routes
export default router;
