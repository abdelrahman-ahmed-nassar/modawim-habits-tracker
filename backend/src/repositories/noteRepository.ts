import type { DailyNote } from "@shared/types";
import { DailyNoteModel } from "../models/dailyNoteModel";
import { toPlain } from "../services/dataServiceUtils";

/**
 * Daily note persistence layer (Mongo/Mongoose)
 */

export const findAllNotes = async (): Promise<DailyNote[]> => {
  const notes = await DailyNoteModel.find().lean<DailyNote[]>();
  return notes;
};

/**
 * Find all notes for a specific user (uses userId index)
 */
export const findNotesByUserId = async (
  userId: string
): Promise<DailyNote[]> => {
  const notes = await DailyNoteModel.find({ userId }).lean<DailyNote[]>();
  return notes;
};

/**
 * @deprecated Use findNoteByUserIdAndDate for proper index usage
 */
export const findNoteByDate = async (
  date: string
): Promise<DailyNote | null> => {
  const note = await DailyNoteModel.findOne({ date }).lean<DailyNote | null>();
  return note || null;
};

/**
 * Find a note by userId and date (uses compound unique index)
 */
export const findNoteByUserIdAndDate = async (
  userId: string,
  date: string
): Promise<DailyNote | null> => {
  const note = await DailyNoteModel.findOne({
    userId,
    date,
  }).lean<DailyNote | null>();
  return note || null;
};

/**
 * Upsert a note by userId and date (uses compound unique index)
 * Uses atomic findOneAndUpdate with upsert for better performance
 */
export const upsertNoteByDate = async (
  noteData: Omit<DailyNote, "_id" | "createdAt" | "updatedAt">
): Promise<DailyNote> => {
  const now = new Date().toISOString();

  // Atomic upsert using compound key (userId + date)
  // $setOnInsert only applies when inserting a new document
  const result = await DailyNoteModel.findOneAndUpdate(
    { userId: noteData.userId, date: noteData.date },
    {
      $set: {
        content: noteData.content,
        mood: noteData.mood,
        productivityLevel: noteData.productivityLevel,
        updatedAt: now,
      },
      $setOnInsert: {
        userId: noteData.userId,
        date: noteData.date,
        createdAt: now,
      },
    },
    { upsert: true, new: true }
  ).lean<DailyNote>();

  return result;
};

export const updateNoteDocument = async (
  id: string,
  noteData: Partial<Omit<DailyNote, "_id" | "createdAt" | "updatedAt">>
): Promise<DailyNote | null> => {
  const now = new Date().toISOString();
  const updatedNote = await DailyNoteModel.findOneAndUpdate(
    { _id: id },
    { ...noteData, updatedAt: now },
    { new: true }
  ).lean<DailyNote | null>();

  return updatedNote || null;
};

export const deleteNoteDocument = async (id: string): Promise<boolean> => {
  const result = await DailyNoteModel.deleteOne({ _id: id });
  return result.deletedCount === 1;
};

export const deleteNotesByUserId = async (userId: string): Promise<void> => {
  await DailyNoteModel.deleteMany({ userId });
};
