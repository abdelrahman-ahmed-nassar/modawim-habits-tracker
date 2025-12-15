import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User, CreateUserInput } from "@shared/types";
import {
  getUserByEmail,
  getUserById,
  createUser,
  createHabit,
  deleteHabitsByUserId,
  deleteNotesByUserId,
  deleteUserById,
} from "./dataService";
import type { AuthTokenPayload } from "../types/auth";
import { DEFAULT_HABITS } from "../data/defaultHabits";
import { DEFAULT_COUNTER_TEMPLATES } from "../data/defaultCounters";
import { DEFAULT_MOODS } from "../data/defaultMoods";
import { DEFAULT_NOTE_TEMPLATES } from "../data/defaultNoteTemplates";
import { DEFAULT_PRODUCTIVITY_LEVELS } from "../data/defaultProductivityLevels";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const signToken = (user: User): string => {
  const payload: AuthTokenPayload = {
    sub: user._id,
    email: user.email,
    // include name for convenience; not critical for verification logic
    name: (user as any).name,
  };

  // Keep typing simple and compatible with jsonwebtoken type defs
  return jwt.sign(payload, JWT_SECRET);
};

export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
};

export const deleteAccount = async (userId: string): Promise<void> => {
  await deleteHabitsByUserId(userId);
  await deleteNotesByUserId(userId);
  const removed = await deleteUserById(userId);
  if (!removed) {
    throw new Error("User not found");
  }
};

export const registerUser = async (
  params: RegisterParams
): Promise<{ user: User; token: string }> => {
  const name = params.name.trim();
  const email = normalizeEmail(params.email);

  const existing = await getUserByEmail(email);
  if (existing) {
    const error = new Error("EMAIL_EXISTS") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await hashPassword(params.password);
  const now = new Date().toISOString();

  const defaultCounters = DEFAULT_COUNTER_TEMPLATES.map((c) => ({
    name: c.name,
    goal: c.goal,
    motivationNote: c.motivationNote,
    currentCount: 0,
    createdAt: now,
    updatedAt: now,
  }));

  const defaultNoteTemplates = DEFAULT_NOTE_TEMPLATES.map((t) => ({
    ...t,
    createdAt: now,
    updatedAt: now,
  }));

  const newUserData: CreateUserInput = {
    name,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    settings: {
      enableRandomNote: true,
    },
    moods: DEFAULT_MOODS,
    productivityLevels: DEFAULT_PRODUCTIVITY_LEVELS,
    notesTemplates: defaultNoteTemplates,
    counters: defaultCounters,
  };

  // Create user and get back the document with MongoDB-generated _id
  const createdUser = await createUser(newUserData);

  // Seed default habits sequentially (avoid concurrent file writes clobbering each other)
  for (const h of DEFAULT_HABITS) {
    // eslint-disable-next-line no-await-in-loop
    await createHabit({
      userId: createdUser._id,
      name: h.name,
      description: h.description,
      tag: h.tag,
      repetition: h.repetition,
      specificDays: h.specificDays,
      goalValue: h.goalValue,
      motivationNote: h.motivationNote,
      order: h.order,
    });
  }

  const token = signToken(createdUser);

  return { user: createdUser, token };
};

export const loginUser = async (
  params: LoginParams
): Promise<{ user: User; token: string }> => {
  const email = normalizeEmail(params.email);
  const user = await getUserByEmail(email);

  if (!user) {
    const error = new Error("EMAIL_NOT_FOUND") as Error & {
      statusCode: number;
    };
    error.statusCode = 401;
    throw error;
  }

  const isValid = await verifyPassword(params.password, user.passwordHash);
  if (!isValid) {
    const error = new Error("INVALID_PASSWORD") as Error & {
      statusCode: number;
    };
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user);
  return { user, token };
};

export const getUserFromToken = async (token: string): Promise<User | null> => {
  const payload = verifyToken(token);
  return getUserById(payload.sub);
};
