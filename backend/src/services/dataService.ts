/**
 * Barrel file that re-exports all data service functions
 * This maintains backward compatibility with existing imports
 */

// Re-export user service functions
export {
  getUsers,
  getUserById,
  getUserByEmail,
  saveUser,
  deleteUserById,
  getUserSettings,
  updateUserSettings,
  resetUserData,
} from "./userService";

// Re-export habit service functions
export {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  replaceAllHabits,
  deleteHabitsByUserId,
  getCompletions,
  getCompletionsByHabitId,
  getCompletionsByDate,
  createCompletion,
  createCompletionsBatch,
  updateCompletion,
  deleteCompletion,
  updateHabitStreaks,
  calculateHabitAnalytics,
  replaceAllCompletions,
} from "./habitService";

// Re-export note service functions
export {
  getNotes,
  getNoteByDate,
  saveNote,
  updateNote,
  deleteNote,
  deleteNotesByUserId,
} from "./noteService";

// Re-export shared utilities
export { initializeData } from "./dataServiceUtils";

// Import all functions for the dataService object
import * as userService from "./userService";
import * as habitService from "./habitService";
import * as noteService from "./noteService";
import { initializeData as initData } from "./dataServiceUtils";

// Generic CRUD placeholders retained for compatibility (no-ops for Mongo)
export const getAll = async <T>(_dataFile: string): Promise<T[]> => {
  throw new Error("getAll is not supported with MongoDB storage");
};

export const getById = async <T extends { id: string }>(
  _dataFile: string,
  _id: string
): Promise<T | null> => {
  throw new Error("getById is not supported with MongoDB storage");
};

export const add = async <T extends { id: string }>(
  _dataFile: string,
  _item: T
): Promise<T> => {
  throw new Error("add is not supported with MongoDB storage");
};

export const update = async <T extends { id: string }>(
  _dataFile: string,
  _id: string,
  _updatedItem: T
): Promise<T | null> => {
  throw new Error("update is not supported with MongoDB storage");
};

export const remove = async <T extends { id: string }>(
  _dataFile: string,
  _id: string
): Promise<boolean> => {
  throw new Error("remove is not supported with MongoDB storage");
};

// Export the dataService as an object for importing in other files
export const dataService = {
  getAll,
  getById,
  add,
  update,
  remove,
  // User service functions
  getUsers: userService.getUsers,
  getUserById: userService.getUserById,
  getUserByEmail: userService.getUserByEmail,
  saveUser: userService.saveUser,
  deleteUserById: userService.deleteUserById,
  getUserSettings: userService.getUserSettings,
  updateUserSettings: userService.updateUserSettings,
  resetUserData: userService.resetUserData,
  // Habit service functions
  getHabits: habitService.getHabits,
  getHabitById: habitService.getHabitById,
  createHabit: habitService.createHabit,
  updateHabit: habitService.updateHabit,
  deleteHabit: habitService.deleteHabit,
  replaceAllHabits: habitService.replaceAllHabits,
  deleteHabitsByUserId: habitService.deleteHabitsByUserId,
  getCompletions: habitService.getCompletions,
  getCompletionsByHabitId: habitService.getCompletionsByHabitId,
  getCompletionsByDate: habitService.getCompletionsByDate,
  createCompletion: habitService.createCompletion,
  createCompletionsBatch: habitService.createCompletionsBatch,
  updateCompletion: habitService.updateCompletion,
  deleteCompletion: habitService.deleteCompletion,
  calculateHabitAnalytics: habitService.calculateHabitAnalytics,
  replaceAllCompletions: habitService.replaceAllCompletions,
  updateHabitStreaks: habitService.updateHabitStreaks,
  // Note service functions
  getNotes: noteService.getNotes,
  getNoteByDate: noteService.getNoteByDate,
  saveNote: noteService.saveNote,
  updateNote: noteService.updateNote,
  deleteNote: noteService.deleteNote,
  deleteNotesByUserId: noteService.deleteNotesByUserId,
  // Shared utilities
  initializeData: initData,
};
