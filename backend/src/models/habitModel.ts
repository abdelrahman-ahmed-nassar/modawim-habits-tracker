import { Schema, model } from "mongoose";
import { Habit } from "@shared/types";

const HabitSchema = new Schema<Habit>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
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

HabitSchema.index({ userId: 1 });

export const HabitModel = model<Habit>("Habit", HabitSchema);
