import type { User, CreateUserInput } from "@shared/types";
import {
  findAllUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  updateUserDocument,
  deleteUserDocumentById,
  findUserSettings,
  updateUserSettingsDocument,
  resetUserEmbeddedData,
} from "../repositories/userRepository";
import { AppError, ErrorCodes } from "../middleware/errorHandler";

/**
 * USERS COLLECTION HELPERS
 */
export const getUsers = async (): Promise<User[]> => {
  // Delegate to repository; behavior unchanged (returns all users)
  return findAllUsers();
};

export const getUserById = async (id: string): Promise<User | null> => {
  // Same semantics: lookup by _id, return null if not found
  return findUserById(id);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  // Normalize and delegate to repository implementation
  return findUserByEmail(email);
};

/**
 * Create a new user (for registration)
 */
export const createUser = async (userData: CreateUserInput): Promise<User> => {
  // All persistence concerns handled by repository
  return insertUser(userData);
};

/**
 * Update an existing user
 */
export const saveUser = async (user: User): Promise<User> => {
  // Preserve behavior (throws if not found) via repository
  return updateUserDocument(user);
};

export const deleteUserById = async (userId: string): Promise<boolean> => {
  return deleteUserDocumentById(userId);
};

// Per-user settings helpers (embedded on User)

export const getUserSettings = async (
  userId: string
): Promise<User["settings"]> => {
  // Same error semantics preserved in repository
  return findUserSettings(userId);
};

export const updateUserSettings = async (
  userId: string,
  settingsData: Partial<User["settings"]>
): Promise<User["settings"]> => {
  // Keep behavior (merge + save) via repository helper
  return updateUserSettingsDocument(userId, settingsData);
};

/**
 * Reset all user-embedded data and remove user-owned habits/notes.
 */
export const resetUserData = async (userId: string): Promise<void> => {
  // Repository handles deleting related data + reset semantics
  await resetUserEmbeddedData(userId);
};
