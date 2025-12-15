import { Schema, model } from "mongoose";
import { User } from "@shared/types";

const MoodOptionSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false }
);

const ProductivityLevelSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false }
);

const NoteTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    template: { type: String, required: true },
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  { _id: true }
);

const CounterSchema = new Schema(
  {
    name: { type: String, required: true },
    goal: { type: Number, required: true },
    motivationNote: { type: String, required: true },
    currentCount: { type: Number, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { _id: true }
);

const SettingsSchema = new Schema(
  {
    enableRandomNote: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    settings: { type: SettingsSchema, default: { enableRandomNote: true } },
    moods: { type: [MoodOptionSchema], default: [] },
    productivityLevels: { type: [ProductivityLevelSchema], default: [] },
    notesTemplates: { type: [NoteTemplateSchema], default: [] },
    counters: { type: [CounterSchema], default: [] },
  },
  {
    versionKey: false,
    collection: "users",
  }
);

export const UserModel = model<User>("User", UserSchema);
