import { Schema, model } from "mongoose";
import { DailyNote } from "@shared/types";

const DailyNoteSchema = new Schema<DailyNote>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    content: { type: String, required: true },
    mood: { type: String },
    productivityLevel: { type: String },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    versionKey: false,
    collection: "notes",
  }
);

DailyNoteSchema.index({ date: 1 }, { unique: true });

export const DailyNoteModel = model<DailyNote>("DailyNote", DailyNoteSchema);
