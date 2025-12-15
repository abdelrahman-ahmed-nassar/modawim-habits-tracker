import type { DailyNote } from "@shared/types";
import {
  findAllNotes,
  findNotesByUserId,
  findNoteByDate,
  findNoteByUserIdAndDate,
  upsertNoteByDate,
  updateNoteDocument,
  deleteNoteDocument,
  deleteNotesByUserId as deleteNotesByUserIdRepo,
} from "../repositories/noteRepository";

/**
 * Get all daily notes (use getNotesByUserId for better performance)
 */
export const getNotes = async (): Promise<DailyNote[]> => {
  return findAllNotes();
};

/**
 * Get all notes for a specific user (uses userId index - preferred)
 */
export const getNotesByUserId = async (
  userId: string
): Promise<DailyNote[]> => {
  return findNotesByUserId(userId);
};

/**
 * Get a note by date (deprecated - use getNoteByUserIdAndDate)
 */
export const getNoteByDate = async (
  date: string
): Promise<DailyNote | null> => {
  return findNoteByDate(date);
};

/**
 * Get a note by userId and date (uses compound unique index - optimal)
 */
export const getNoteByUserIdAndDate = async (
  userId: string,
  date: string
): Promise<DailyNote | null> => {
  return findNoteByUserIdAndDate(userId, date);
};

/**
 * Create or update a daily note
 */
export const saveNote = async (
  noteData: Omit<DailyNote, "_id" | "createdAt" | "updatedAt">
): Promise<DailyNote> => {
  // Repository keeps the exact same upsert semantics
  return upsertNoteByDate(noteData);
};

/**
 * Update a note by ID
 */
export const updateNote = async (
  id: string,
  noteData: Partial<Omit<DailyNote, "_id" | "createdAt" | "updatedAt">>
): Promise<DailyNote | null> => {
  return updateNoteDocument(id, noteData);
};

/**
 * Delete a note
 */
export const deleteNote = async (id: string): Promise<boolean> => {
  return deleteNoteDocument(id);
};

/**
 * Delete all notes for a given user
 */
export const deleteNotesByUserId = async (userId: string): Promise<void> => {
  await deleteNotesByUserIdRepo(userId);
};
