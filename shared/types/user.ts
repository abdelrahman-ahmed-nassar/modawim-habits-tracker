import type { Counter } from "./counter";
import type { NoteTemplate } from "./template";

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
  id: string;
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

// Re-export for backward compatibility / flexibility
export type { User as default };
