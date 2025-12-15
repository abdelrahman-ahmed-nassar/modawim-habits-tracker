import { Schema, model } from "mongoose";
import { DailyNote } from "@shared/types";

const DailyNoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true },
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

// Compound unique index: each user can have only one note per date
DailyNoteSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyNoteModel = model("DailyNote", DailyNoteSchema);
