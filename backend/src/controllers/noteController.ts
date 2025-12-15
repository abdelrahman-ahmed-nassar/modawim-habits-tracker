import { Request, Response } from "express";
import { DailyNote } from "@shared/types";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { isValidDateFormat, validateDailyNote } from "../utils/validation";
import type { AuthenticatedRequest } from "../types/auth";

/**
 * Get all notes
 * @route GET /api/notes
 */
export const getAllNotes = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    // Use DB-level userId filter (uses index)
    const notes = await dataService.getNotesByUserId(userId);

    res.status(200).json({
      success: true,
      data: notes,
    });
  }
);

/**
 * Get note by date
 * @route GET /api/notes/:date
 */
export const getNoteByDate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { date } = req.params;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const userId = req.user!._id;
    // Use compound index for userId + date lookup
    const note = await dataService.getNoteByUserIdAndDate(userId, date);
    if (!note) {
      throw new AppError(`No note found for date ${date}`, 404);
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  }
);

/**
 * Create a new note
 * @route POST /api/notes
 */
export const createNote = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { date, content, mood, productivityLevel } = req.body;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const userId = req.user!._id;

    const noteData: Omit<DailyNote, "_id" | "createdAt" | "updatedAt"> = {
      userId,
      date,
      content,
      mood,
      productivityLevel,
    };

    const validationErrors = await validateDailyNote(noteData);
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors[0].message, 400);
    }

    const note = await dataService.saveNote(noteData);
    res.status(201).json({
      success: true,
      data: note,
    });
  }
);

/**
 * Update a note
 * @route PUT /api/notes/:id
 */
export const updateNote = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { content, mood, productivityLevel } = req.body;

    const noteData: Partial<
      Omit<DailyNote, "_id" | "createdAt" | "updatedAt">
    > = {
      content,
      mood,
      productivityLevel,
    };

    // For validation & ownership, load existing notes for this user
    const userId = req.user!._id;
    const userNotes = await dataService.getNotesByUserId(userId);
    const existingNote = userNotes.find((n) => n._id.toString() === id);

    if (!existingNote) {
      throw new AppError(`Note with ID ${id} not found`, 404);
    }

    // Validate note data if provided fields are not empty
    if (
      content !== undefined ||
      mood !== undefined ||
      productivityLevel !== undefined
    ) {
      const fullNoteData = {
        date: existingNote.date,
        content: content !== undefined ? content : existingNote.content,
        mood: mood !== undefined ? mood : existingNote.mood,
        productivityLevel:
          productivityLevel !== undefined
            ? productivityLevel
            : existingNote.productivityLevel,
      };

      const validationErrors = await validateDailyNote(fullNoteData);
      if (validationErrors.length > 0) {
        throw new AppError(validationErrors[0].message, 400);
      }
    }

    const updatedNote = await dataService.updateNote(id, noteData);
    if (!updatedNote) {
      throw new AppError(`Note with ID ${id} not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: updatedNote,
      message: "Note updated successfully",
    });
  }
);

/**
 * Delete a note
 * @route DELETE /api/notes/:id
 */
export const deleteNote = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Ensure note belongs to current user
    const userId = req.user!._id;
    const userNotes = await dataService.getNotesByUserId(userId);
    const existingNote = userNotes.find((n) => n._id.toString() === id);

    if (!existingNote) {
      throw new AppError(`Note with ID ${id} not found`, 404);
    }

    const success = await dataService.deleteNote(id);
    if (!success) {
      throw new AppError(`Note with ID ${id} not found`, 404);
    }

    res.status(200).json({
      success: true,
      message: `Note with ID ${id} deleted successfully`,
    });
  }
);
