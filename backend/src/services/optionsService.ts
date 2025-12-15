import { AppError } from "../middleware/errorHandler";
import type {
  MoodOption,
  ProductivityLevelOption,
  User,
} from "@shared/types";
import { getUserById, saveUser } from "./dataService";

const getUserOrThrow = async (userId: string): Promise<User> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const getMoods = async (userId: string): Promise<MoodOption[]> => {
  const user = await getUserOrThrow(userId);
  return user.moods || [];
};

export const getMoodLabels = async (userId: string): Promise<string[]> => {
  const moods = await getMoods(userId);
  return moods.map((mood) => mood.label);
};

export const addMood = async (
  userId: string,
  mood: string | MoodOption
): Promise<MoodOption[]> => {
  const user = await getUserOrThrow(userId);
  const moods = user.moods || [];

  const moodObj: MoodOption =
    typeof mood === "string"
      ? {
          label: mood,
          value:
            moods.length > 0 ? Math.max(...moods.map((m) => m.value)) + 1 : 5,
        }
      : mood;

  if (moods.some((m) => m.label === moodObj.label)) {
    throw new AppError("Mood already exists", 400);
  }

  const updatedMoods = [...moods, moodObj];
  await saveUser({ ...user, moods: updatedMoods });
  return updatedMoods;
};

export const removeMood = async (
  userId: string,
  moodLabel: string
): Promise<MoodOption[]> => {
  const user = await getUserOrThrow(userId);
  const moods = user.moods || [];
  const filteredMoods = moods.filter((m) => m.label !== moodLabel);

  if (filteredMoods.length === moods.length) {
    throw new AppError("Mood not found", 404);
  }

  await saveUser({ ...user, moods: filteredMoods });
  return filteredMoods;
};

export const getProductivityLevels = async (
  userId: string
): Promise<ProductivityLevelOption[]> => {
  const user = await getUserOrThrow(userId);
  return user.productivityLevels || [];
};

export const getProductivityLabels = async (
  userId: string
): Promise<string[]> => {
  const levels = await getProductivityLevels(userId);
  return levels.map((level) => level.label);
};

export const addProductivityLevel = async (
  userId: string,
  level: string | ProductivityLevelOption
): Promise<ProductivityLevelOption[]> => {
  const user = await getUserOrThrow(userId);
  const levels = user.productivityLevels || [];

  const levelObj: ProductivityLevelOption =
    typeof level === "string"
      ? {
          label: level,
          value:
            levels.length > 0 ? Math.max(...levels.map((l) => l.value)) + 1 : 5,
        }
      : level;

  if (levels.some((l) => l.label === levelObj.label)) {
    throw new AppError("Productivity level already exists", 400);
  }

  const updatedLevels = [...levels, levelObj];
  await saveUser({ ...user, productivityLevels: updatedLevels });
  return updatedLevels;
};

export const removeProductivityLevel = async (
  userId: string,
  levelLabel: string
): Promise<ProductivityLevelOption[]> => {
  const user = await getUserOrThrow(userId);
  const levels = user.productivityLevels || [];
  const filteredLevels = levels.filter((l) => l.label !== levelLabel);

  if (filteredLevels.length === levels.length) {
    throw new AppError("Productivity level not found", 404);
  }

  await saveUser({ ...user, productivityLevels: filteredLevels });
  return filteredLevels;
};
