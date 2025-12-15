import { Response } from "express";
import {
  Counter,
  CreateCounterRequest,
  UpdateCounterRequest,
  PatchCounterRequest,
} from "@shared/types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import type { AuthenticatedRequest } from "../types/auth";
import { getUserById, saveUser } from "../services/dataService";

const getUserOrThrow = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

/**
 * Get all counters
 * @route GET /api/counters
 */
export const getAllCounters = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getUserOrThrow(req.user!._id);
    const counters = user.counters || [];

    res.status(200).json({
      success: true,
      data: counters,
    });
  }
);

/**
 * Get a counter by ID
 * @route GET /api/counters/:id
 */
export const getCounterById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const user = await getUserOrThrow(req.user!._id);
    const counters = user.counters || [];
    const counter = counters.find((c) => c._id.toString() === id);

    if (!counter) {
      throw new AppError(`Counter with ID ${id} not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: counter,
    });
  }
);

/**
 * Create a new counter
 * @route POST /api/counters
 */
export const createCounter = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getUserOrThrow(req.user!._id);
    const counterData: CreateCounterRequest = req.body;

    // Validate counter data
    if (!counterData.name || counterData.name.trim() === "") {
      throw new AppError("Counter name is required", 400);
    }

    if (counterData.goal === undefined || counterData.goal < 0) {
      throw new AppError("Counter goal must be a non-negative number", 400);
    }

    const counters = user.counters || [];
    const now = new Date().toISOString();

    const newCounterData = {
      name: counterData.name.trim(),
      goal: counterData.goal,
      motivationNote: counterData.motivationNote?.trim() || "",
      currentCount: counterData.currentCount || 0,
      createdAt: now,
      updatedAt: now,
    };

    // Cast to any to allow adding subdocument without _id (Mongoose will generate it)
    const updatedCounters = [...counters, newCounterData] as typeof counters;
    const updatedUser = await saveUser({ ...user, counters: updatedCounters });

    // Get the newly created counter (last one in the array, now with _id)
    const createdCounter =
      updatedUser.counters[updatedUser.counters.length - 1];

    res.status(201).json({
      success: true,
      data: createdCounter,
      message: "Counter created successfully",
    });
  }
);

/**
 * Update a counter
 * @route PUT /api/counters/:id
 */
export const updateCounter = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getUserOrThrow(req.user!._id);
    const { id } = req.params;
    const updateData: UpdateCounterRequest = req.body;

    // Validate update data
    if (updateData.name !== undefined && updateData.name.trim() === "") {
      throw new AppError("Counter name cannot be empty", 400);
    }

    if (updateData.goal !== undefined && updateData.goal < 0) {
      throw new AppError("Counter goal must be a non-negative number", 400);
    }

    const counters = user.counters || [];
    const counterIndex = counters.findIndex((c) => c._id.toString() === id);

    if (counterIndex === -1) {
      throw new AppError(`Counter with ID ${id} not found`, 404);
    }

    const updatedCounter: Counter = {
      ...counters[counterIndex],
      ...(updateData.name && { name: updateData.name.trim() }),
      ...(updateData.goal !== undefined && { goal: updateData.goal }),
      ...(updateData.motivationNote !== undefined && {
        motivationNote: updateData.motivationNote.trim(),
      }),
      updatedAt: new Date().toISOString(),
    };

    const updatedCounters = [...counters];
    updatedCounters[counterIndex] = updatedCounter;
    await saveUser({ ...user, counters: updatedCounters });

    res.status(200).json({
      success: true,
      data: updatedCounter,
      message: "Counter updated successfully",
    });
  }
);

/**
 * Patch counter count (increment/decrement or set)
 * @route PATCH /api/counters/:id/count
 */
export const patchCounterCount = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getUserOrThrow(req.user!._id);
    const { id } = req.params;
    const patchData: PatchCounterRequest = req.body;

    if (patchData.currentCount === undefined) {
      throw new AppError("currentCount is required", 400);
    }

    if (patchData.currentCount < 0) {
      throw new AppError("Counter count cannot be negative", 400);
    }

    const counters = user.counters || [];
    const counterIndex = counters.findIndex((c) => c._id.toString() === id);

    if (counterIndex === -1) {
      throw new AppError(`Counter with ID ${id} not found`, 404);
    }

    const updatedCounters = [...counters];
    updatedCounters[counterIndex] = {
      ...updatedCounters[counterIndex],
      currentCount: patchData.currentCount,
      updatedAt: new Date().toISOString(),
    };

    await saveUser({ ...user, counters: updatedCounters });

    res.status(200).json({
      success: true,
      data: counters[counterIndex],
      message: "Counter count updated successfully",
    });
  }
);

/**
 * Delete a counter
 * @route DELETE /api/counters/:id
 */
export const deleteCounter = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getUserOrThrow(req.user!._id);
    const { id } = req.params;

    const counters = user.counters || [];
    const counterIndex = counters.findIndex((c) => c._id.toString() === id);

    if (counterIndex === -1) {
      throw new AppError(`Counter with ID ${id} not found`, 404);
    }

    const updatedCounters = counters.filter((c) => c._id.toString() !== id);
    await saveUser({ ...user, counters: updatedCounters });

    res.status(200).json({
      success: true,
      message: "Counter deleted successfully",
    });
  }
);
