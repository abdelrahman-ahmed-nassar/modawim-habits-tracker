export interface DailyNote {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  content: string;
  mood?: string;
  productivityLevel?: string;
  createdAt: string;
  updatedAt: string;
}

// Re-export for backward compatibility
export type { DailyNote as default };
