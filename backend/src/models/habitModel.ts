import { Schema, model } from "mongoose";
import { Habit } from "@shared/types";

const HabitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    tag: { type: String, required: true },
    repetition: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    specificDays: { type: [Number], default: undefined },
    goalValue: { type: Number, required: true },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    currentCounter: { type: Number, default: 0 },
    createdAt: { type: String, required: true },
    motivationNote: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number },
    completedDays: { type: [Number], default: [] },
  },
  {
    versionKey: false,
    collection: "habits",
  }
);

// Index for filtering habits by user (most common query pattern)
HabitSchema.index({ userId: 1 });

// Index for querying completions by date (completedDays contains YYYYMMDD integers)
HabitSchema.index({ completedDays: 1 });

// Compound index for user + active status (common filter combination)
HabitSchema.index({ userId: 1, isActive: 1 });

export const HabitModel = model("Habit", HabitSchema);
