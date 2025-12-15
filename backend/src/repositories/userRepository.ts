import type { User, CreateUserInput } from "@shared/types";
import { UserModel } from "../models/userModel";
import { HabitModel } from "../models/habitModel";
import { DailyNoteModel } from "../models/dailyNoteModel";
import { toPlain } from "../services/dataServiceUtils";
import { AppError, ErrorCodes } from "../middleware/errorHandler";

/**
 * User persistence layer (Mongo/Mongoose)
 * Only this module should talk directly to Mongoose for user-related data.
 */

export const findAllUsers = async (): Promise<User[]> => {
  const users = await UserModel.find().lean<User[]>();
  return users;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const user = await UserModel.findOne({ _id: id }).lean<User | null>();
  return user || null;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const normalized = email.toLowerCase();
  const user = await UserModel.findOne({
    email: normalized,
  }).lean<User | null>();
  return user || null;
};

export const insertUser = async (userData: CreateUserInput): Promise<User> => {
  const now = new Date().toISOString();
  const payload = {
    ...userData,
    email: userData.email.toLowerCase(),
    createdAt: userData.createdAt || now,
    updatedAt: now,
  };

  const created = await UserModel.create(payload);
  return toPlain<User>(created);
};

export const updateUserDocument = async (user: User): Promise<User> => {
  const now = new Date().toISOString();
  const payload = {
    ...user,
    email: user.email.toLowerCase(),
    updatedAt: now,
  };

  const saved = await UserModel.findOneAndUpdate(
    { _id: payload._id },
    payload,
    {
      new: true,
    }
  ).lean<User>();

  if (!saved) {
    throw new Error("User not found");
  }

  return saved;
};

export const deleteUserDocumentById = async (
  userId: string
): Promise<boolean> => {
  const result = await UserModel.deleteOne({ _id: userId });
  return result.deletedCount === 1;
};

export const findUserSettings = async (
  userId: string
): Promise<User["settings"]> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 401, ErrorCodes.USER_NOT_FOUND);
  }
  return user.settings;
};

export const updateUserSettingsDocument = async (
  userId: string,
  settingsData: Partial<User["settings"]>
): Promise<User["settings"]> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 401, ErrorCodes.USER_NOT_FOUND);
  }

  const updatedSettings: User["settings"] = {
    ...user.settings,
    ...settingsData,
  };

  await updateUserDocument({ ...user, settings: updatedSettings });
  return updatedSettings;
};

export const resetUserEmbeddedData = async (userId: string): Promise<void> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 401, ErrorCodes.USER_NOT_FOUND);
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

  await updateUserDocument(resetUser);
};
