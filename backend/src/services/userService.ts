import type { User } from "@shared/types";
import { UserModel } from "../models/userModel";
import { HabitModel } from "../models/habitModel";
import { DailyNoteModel } from "../models/dailyNoteModel";

/**
 * USERS COLLECTION HELPERS
 */
export const getUsers = async (): Promise<User[]> => {
  const users = await UserModel.find().lean<User[]>();
  return users;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await UserModel.findOne({ id }).lean<User | null>();
  return user || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const normalized = email.toLowerCase();
  const user = await UserModel.findOne({
    email: normalized,
  }).lean<User | null>();
  return user || null;
};

export const saveUser = async (user: User): Promise<User> => {
  const now = new Date().toISOString();
  const payload: User = {
    ...user,
    email: user.email.toLowerCase(),
    createdAt: user.createdAt || now,
    updatedAt: now,
  };

  const saved = await UserModel.findOneAndUpdate({ id: payload.id }, payload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  }).lean<User>();

  return saved;
};

export const deleteUserById = async (userId: string): Promise<boolean> => {
  const result = await UserModel.deleteOne({ id: userId });
  return result.deletedCount === 1;
};

// Per-user settings helpers (embedded on User)

export const getUserSettings = async (
  userId: string
): Promise<User["settings"]> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user.settings;
};

export const updateUserSettings = async (
  userId: string,
  settingsData: Partial<User["settings"]>
): Promise<User["settings"]> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const updatedSettings: User["settings"] = {
    ...user.settings,
    ...settingsData,
  };

  await saveUser({ ...user, settings: updatedSettings });
  return updatedSettings;
};

/**
 * Reset all user-embedded data and remove user-owned habits/notes.
 */
export const resetUserData = async (userId: string): Promise<void> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await HabitModel.deleteMany({ userId });
  await DailyNoteModel.deleteMany({ userId });

  const now = new Date().toISOString();
  const resetUser: User = {
    ...user,
    settings: { enableRandomNote: true },
    moods: [],
    productivityLevels: [],
    notesTemplates: [],
    counters: [],
    updatedAt: now,
  };

  await saveUser(resetUser);
};

