import express, { Router } from "express";
import * as noteController from "../controllers/noteController";
import * as notesAnalyticsController from "../controllers/notesAnalyticsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

// All notes-related routes require authentication
router.use(authMiddleware);

// GET /api/notes - Get all notes for current user
router.get("/", noteController.getAllNotes);

// Analytics routes (scoped to current user)
router.get("/analytics/overview", notesAnalyticsController.getNotesAnalytics);
router.get("/analytics/mood-trends", notesAnalyticsController.getMoodTrends);
router.get(
  "/analytics/productivity-correlation",
  notesAnalyticsController.getProductivityCorrelation
);
router.get("/calendar/:year/:month", notesAnalyticsController.getNotesCalendar);

// GET /api/notes/:date - Get note for a specific date for current user
router.get("/:date", noteController.getNoteByDate);

// POST /api/notes - Create a new note for current user
router.post("/", noteController.createNote);

// PUT /api/notes/:id - Update a note (owned by current user)
router.put("/:id", noteController.updateNote);

// DELETE /api/notes/:id - Delete a note (owned by current user)
router.delete("/:id", noteController.deleteNote);

export default router;
