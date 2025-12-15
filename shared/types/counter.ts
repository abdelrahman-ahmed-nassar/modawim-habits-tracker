export interface Counter {
  _id: string;
  name: string;
  goal: number;
  motivationNote: string;
  currentCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateCounterInput = Omit<Counter, "_id">;

export interface CreateCounterRequest {
  name: string;
  goal: number;
  motivationNote?: string;
  currentCount?: number;
}

export interface UpdateCounterRequest {
  name?: string;
  goal?: number;
  motivationNote?: string;
}

export interface PatchCounterRequest {
  currentCount: number;
}
