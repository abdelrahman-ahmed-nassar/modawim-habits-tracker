import type { Counter, CreateCounterInput } from "./counter";
import type { NoteTemplate, CreateNoteTemplateInput } from "./template";

export interface UserSettings {
  enableRandomNote: boolean;
}

export interface MoodOption {
  label: string;
  value: number;
}

export interface ProductivityLevelOption {
  label: string;
  value: number;
}

export interface User {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  settings: UserSettings;
  moods: MoodOption[];
  productivityLevels: ProductivityLevelOption[];
  notesTemplates: NoteTemplate[];
  counters: Counter[];
}

// Input type for creating a new user (no _id, nested docs also without _id)
export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
  moods: MoodOption[];
  productivityLevels: ProductivityLevelOption[];
  notesTemplates: CreateNoteTemplateInput[];
  counters: CreateCounterInput[];
}

// Re-export for backward compatibility / flexibility
export type { User as default };
