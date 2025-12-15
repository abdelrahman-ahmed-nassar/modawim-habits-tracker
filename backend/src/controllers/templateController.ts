import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { NoteTemplate } from "@shared/types";
import type { AuthenticatedRequest } from "../types/auth";
import { getUserById, saveUser } from "../services/dataService";

/**
 * Get all note templates
 */
export const getAllTemplates = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = await getUserById(req.user!.id);
    const templates = user?.notesTemplates || [];
    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
};

/**
 * Get template by ID
 */
export const getTemplateById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;

  try {
    const user = await getUserById(req.user!.id);
    const template = user?.notesTemplates.find((t) => t.id === id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
};

/**
 * Create new template
 */
export const createTemplate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = await getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, template } = req.body;
    if (!name || !template) {
      return res.status(400).json({
        success: false,
        message: "Name and template content are required",
      });
    }

    const newTemplate: NoteTemplate = {
      id: uuidv4(),
      name,
      template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const templates = user.notesTemplates || [];
    await saveUser({ ...user, notesTemplates: [...templates, newTemplate] });

    return res.status(201).json({
      success: true,
      data: newTemplate,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create template",
    });
  }
};

/**
 * Update template
 */
export const updateTemplate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { name, template } = req.body;

  try {
    const user = await getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingTemplate = (user.notesTemplates || []).find(
      (t) => t.id === id
    );
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    const updatedTemplate: NoteTemplate = {
      ...existingTemplate,
      name: name || existingTemplate.name,
      template: template || existingTemplate.template,
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = (user.notesTemplates || []).map((t) =>
      t.id === id ? updatedTemplate : t
    );

    await saveUser({ ...user, notesTemplates: updatedTemplates });

    return res.status(200).json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update template",
    });
  }
};

/**
 * Delete template
 */
export const deleteTemplate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;

  try {
    const user = await getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingTemplate = (user.notesTemplates || []).find(
      (t) => t.id === id
    );
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    const updatedTemplates = (user.notesTemplates || []).filter(
      (t) => t.id !== id
    );
    await saveUser({ ...user, notesTemplates: updatedTemplates });

    return res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete template",
    });
  }
};
