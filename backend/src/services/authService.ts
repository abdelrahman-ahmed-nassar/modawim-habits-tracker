import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "@shared/types";
import {
  getUserByEmail,
  getUserById,
  saveUser,
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
    sub: user.id,
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
    throw new Error("User with this email already exists");
  }

  const passwordHash = await hashPassword(params.password);
  const now = new Date().toISOString();

  const defaultCounters = DEFAULT_COUNTER_TEMPLATES.map((c) => ({
    id: uuidv4(),
    name: c.name,
    goal: c.goal,
    motivationNote: c.motivationNote,
    currentCount: 0,
    createdAt: now,
    updatedAt: now,
  }));

  const defaultNoteTemplates = DEFAULT_NOTE_TEMPLATES.map((t) => ({
    ...t,
    createdAt: t.createdAt ?? now,
    updatedAt: t.updatedAt ?? now,
  }));

  const newUser: User = {
    id: uuidv4(),
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

  await saveUser(newUser);

  // Seed default habits sequentially (avoid concurrent file writes clobbering each other)
  for (const h of DEFAULT_HABITS) {
    // eslint-disable-next-line no-await-in-loop
    await createHabit({
      userId: newUser.id,
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

  const token = signToken(newUser);

  return { user: newUser, token };
};

export const loginUser = async (
  params: LoginParams
): Promise<{ user: User; token: string }> => {
  const email = normalizeEmail(params.email);
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await verifyPassword(params.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const token = signToken(user);
  return { user, token };
};

export const getUserFromToken = async (token: string): Promise<User | null> => {
  const payload = verifyToken(token);
  return getUserById(payload.sub);
};
