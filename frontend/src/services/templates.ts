import { NoteTemplate } from "@shared/types/template";
import apiService from "./api";

export class TemplatesService {
  /**
   * Get all templates
   */
  static async getAllTemplates(): Promise<NoteTemplate[]> {
    const res = await apiService.get<NoteTemplate[]>("/templates");
    return res.data;
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id: string): Promise<NoteTemplate> {
    const res = await apiService.get<NoteTemplate>(`/templates/${id}`);
    return res.data;
  }

  /**
   * Create a new template
   */
  static async createTemplate(
    template: Omit<NoteTemplate, "_id" | "createdAt" | "updatedAt">
  ): Promise<NoteTemplate> {
    const res = await apiService.post<NoteTemplate>("/templates", template);
    return res.data;
  }

  /**
   * Update a template
   */
  static async updateTemplate(
    id: string,
    template: Partial<Omit<NoteTemplate, "_id" | "createdAt" | "updatedAt">>
  ): Promise<NoteTemplate> {
    const res = await apiService.put<NoteTemplate>(
      `/templates/${id}`,
      template
    );
    return res.data;
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string): Promise<void> {
    await apiService.delete<void>(`/templates/${id}`);
  }

  /**
   * Apply a template to create a note
   * Formats the template with the given variables
   */
  static formatTemplate(
    template: string,
    variables: Record<string, string>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}
