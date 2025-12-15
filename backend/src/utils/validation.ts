import {
  Habit,
  CompletionRecord,
  DailyNote,
  CreateHabitDto,
} from "@shared/types";
import { ValidationError } from "../types/models";
import * as optionsService from "../services/optionsService";
import { getUserById } from "../services/dataService";
import type { User } from "@shared/types";

/**
 * Validates a habit creation DTO
 * @param habitData The habit data to validate
 * @returns Array of validation errors, empty if valid
 */
export const validateHabitCreate = (
  habitData: CreateHabitDto
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!habitData.name || habitData.name.trim() === "") {
    errors.push({ field: "name", message: "Name is required" });
  } else if (habitData.name.length > 100) {
    errors.push({
      field: "name",
      message: "Name cannot exceed 100 characters",
    });
  }

  if (!habitData.tag || habitData.tag.trim() === "") {
    errors.push({ field: "tag", message: "Tag is required" });
  }

  if (!habitData.repetition) {
    errors.push({
      field: "repetition",
      message: "Repetition type is required",
    });
  } else if (!["daily", "weekly", "monthly"].includes(habitData.repetition)) {
    errors.push({ field: "repetition", message: "Invalid repetition type" });
  }

  if (habitData.goalValue === undefined || habitData.goalValue < 1) {
    errors.push({
      field: "goalValue",
      message: "Goal value must be greater than 0",
    });
  }

  // Validate specific days based on repetition type
  if (habitData.specificDays && habitData.specificDays.length > 0) {
    if (habitData.repetition === "weekly") {
      // Days must be 0-6 for weekly
      if (habitData.specificDays.some((day) => day < 0 || day > 6)) {
        errors.push({
          field: "specificDays",
          message: "Weekly specific days must be between 0 and 6",
        });
      }
    } else if (habitData.repetition === "monthly") {
      // Days must be 1-31 for monthly
      if (habitData.specificDays.some((day) => day < 1 || day > 31)) {
        errors.push({
          field: "specificDays",
          message: "Monthly specific days must be between 1 and 31",
        });
      }
    }
  }

  // Optional description validation
  if (habitData.description && habitData.description.length > 500) {
    errors.push({
      field: "description",
      message: "Description cannot exceed 500 characters",
    });
  }

  // Optional motivation note validation
  if (habitData.motivationNote && habitData.motivationNote.length > 1000) {
    errors.push({
      field: "motivationNote",
      message: "Motivation note cannot exceed 1000 characters",
    });
  }

  return errors;
};

/**
 * Validates a date string is in YYYY-MM-DD format
 * @param dateStr Date string to validate
 * @returns boolean indicating if date is valid
 */
export const isValidDateFormat = (dateStr: string): boolean => {
  // Check format is YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  // Check date is valid
  const date = new Date(dateStr);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;

  // Check if the date string is the same when converted back
  return date.toISOString().split("T")[0] === dateStr;
};

/**
 * Validates completion record data
 * @param completionData The completion record to validate
 * @returns Array of validation errors, empty if valid
 */
export const validateCompletion = (
  completionData: Partial<CompletionRecord>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!completionData.habitId) {
    errors.push({ field: "habitId", message: "Habit ID is required" });
  }

  if (!completionData.date) {
    errors.push({ field: "date", message: "Date is required" });
  } else if (!isValidDateFormat(completionData.date)) {
    errors.push({
      field: "date",
      message: "Date must be in YYYY-MM-DD format",
    });
  }

  if (completionData.completed === undefined) {
    errors.push({
      field: "completed",
      message: "Completed status is required",
    });
  }

  return errors;
};

/**
 * Validates daily note data
 * @param noteData The daily note to validate
 * @returns Array of validation errors, empty if valid
 */
export const validateDailyNote = async (
  noteData: Partial<DailyNote>
): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];

  if (!noteData.date) {
    errors.push({ field: "date", message: "Date is required" });
  } else if (!isValidDateFormat(noteData.date)) {
    errors.push({
      field: "date",
      message: "Date must be in YYYY-MM-DD format",
    });
  }

  if (!noteData.content || noteData.content.trim() === "") {
    errors.push({ field: "content", message: "Content is required" });
  } else if (noteData.content.length > 5000) {
    errors.push({
      field: "content",
      message: "Content cannot exceed 5000 characters",
    });
  }

  return errors;
};
