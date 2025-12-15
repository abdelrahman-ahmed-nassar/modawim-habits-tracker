import { v4 as uuidv4 } from "uuid";
import { DailyNote } from "@shared/types";
import { DailyNoteModel } from "../models/dailyNoteModel";
import { toPlain } from "./dataServiceUtils";

/**
 * Get all daily notes
 */
export const getNotes = async (): Promise<DailyNote[]> => {
  const notes = await DailyNoteModel.find().lean<DailyNote[]>();
  return notes;
};

/**
 * Get a note by date
 */
export const getNoteByDate = async (
  date: string
): Promise<DailyNote | null> => {
  const note = await DailyNoteModel.findOne({ date }).lean<DailyNote | null>();
  return note || null;
};

/**
 * Create or update a daily note
 */
export const saveNote = async (
  noteData: Omit<DailyNote, "id" | "createdAt" | "updatedAt">
): Promise<DailyNote> => {
  const now = new Date().toISOString();

  const existing = await DailyNoteModel.findOne({ date: noteData.date });
  if (existing) {
    existing.content = noteData.content;
    existing.mood = noteData.mood;
    existing.productivityLevel = noteData.productivityLevel;
    existing.updatedAt = now;
    await existing.save();
    return toPlain<DailyNote>(existing);
  }

  const newNote: DailyNote = {
    id: uuidv4(),
    ...noteData,
    createdAt: now,
    updatedAt: now,
  };

  const created = await DailyNoteModel.create(newNote);
  return toPlain<DailyNote>(created);
};

/**
 * Update a note by ID
 */
export const updateNote = async (
  id: string,
  noteData: Partial<Omit<DailyNote, "id" | "createdAt" | "updatedAt">>
): Promise<DailyNote | null> => {
  const now = new Date().toISOString();
  const updatedNote = await DailyNoteModel.findOneAndUpdate(
    { id },
    { ...noteData, updatedAt: now },
    { new: true }
  ).lean<DailyNote | null>();

  return updatedNote || null;
};

/**
 * Delete a note
 */
export const deleteNote = async (id: string): Promise<boolean> => {
  const result = await DailyNoteModel.deleteOne({ id });
  return result.deletedCount === 1;
};

/**
 * Delete all notes for a given user
 */
export const deleteNotesByUserId = async (userId: string): Promise<void> => {
  await DailyNoteModel.deleteMany({ userId });
};

