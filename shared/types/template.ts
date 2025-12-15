export interface NoteTemplate {
  _id: string;
  name: string;
  template: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateNoteTemplateInput = Omit<NoteTemplate, "_id">;

// Re-export for backward compatibility
export type { NoteTemplate as default };
