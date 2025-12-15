import { Response } from "express";
import { NoteTemplate } from "@shared/types";
import type { AuthenticatedRequest } from "../types/auth";
import { getUserById, saveUser } from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";

/**
 * Get all note templates
 */
export const getAllTemplates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getUserById(req.user!._id);
    const templates = user?.notesTemplates || [];
    res.status(200).json({
      success: true,
      data: templates,
    });
  }
);

/**
 * Get template by ID
 */
export const getTemplateById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const user = await getUserById(req.user!._id);
    const template = user?.notesTemplates.find((t) => t._id.toString() === id);
    if (!template) {
      throw new AppError("Template not found", 404);
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  }
);

/**
 * Create new template
 */
export const createTemplate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getUserById(req.user!._id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { name, template } = req.body;
    if (!name || !template) {
      throw new AppError("Name and template content are required", 400);
    }

    const newTemplateData = {
      name,
      template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const templates = user.notesTemplates || [];
    // Cast to any to allow adding subdocument without _id (Mongoose will generate it)
    const updatedTemplates = [
      ...templates,
      newTemplateData,
    ] as typeof templates;
    const updatedUser = await saveUser({
      ...user,
      notesTemplates: updatedTemplates,
    });

    // Get the newly created template (last one in the array, now with _id)
    const createdTemplate =
      updatedUser.notesTemplates[updatedUser.notesTemplates.length - 1];

    res.status(201).json({
      success: true,
      data: createdTemplate,
      message: "Template created successfully",
    });
  }
);

/**
 * Update template
 */
export const updateTemplate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name, template } = req.body;

    const user = await getUserById(req.user!._id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const existingTemplate = (user.notesTemplates || []).find(
      (t) => t._id.toString() === id
    );
    if (!existingTemplate) {
      throw new AppError("Template not found", 404);
    }

    const updatedTemplate: NoteTemplate = {
      ...existingTemplate,
      name: name || existingTemplate.name,
      template: template || existingTemplate.template,
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = (user.notesTemplates || []).map((t) =>
      t._id.toString() === id ? updatedTemplate : t
    );

    await saveUser({ ...user, notesTemplates: updatedTemplates });

    res.status(200).json({
      success: true,
      data: updatedTemplate,
      message: "Template updated successfully",
    });
  }
);

/**
 * Delete template
 */
export const deleteTemplate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const user = await getUserById(req.user!._id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const existingTemplate = (user.notesTemplates || []).find(
      (t) => t._id.toString() === id
    );
    if (!existingTemplate) {
      throw new AppError("Template not found", 404);
    }

    const updatedTemplates = (user.notesTemplates || []).filter(
      (t) => t._id.toString() !== id
    );
    await saveUser({ ...user, notesTemplates: updatedTemplates });

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  }
);
