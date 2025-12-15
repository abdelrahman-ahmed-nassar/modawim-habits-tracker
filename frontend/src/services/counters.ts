import {
  Counter,
  CreateCounterRequest,
  UpdateCounterRequest,
} from "@shared/types";
import apiService from "./api";

class CountersService {
  /**
   * Get all counters
   */
  async getAllCounters(): Promise<Counter[]> {
    const res = await apiService.get<Counter[]>("/counters");
    return res.data;
  }

  /**
   * Get a single counter by ID
   * @param id - The ID of the counter
   */
  async getCounter(id: string): Promise<Counter> {
    const res = await apiService.get<Counter>(`/counters/${id}`);
    return res.data;
  }

  /**
   * Create a new counter
   * @param counter - The counter data
   */
  async createCounter(counter: CreateCounterRequest): Promise<Counter> {
    const res = await apiService.post<Counter>("/counters", counter);
    return res.data;
  }

  /**
   * Update an existing counter
   * @param id - The ID of the counter
   * @param counter - The updated counter data
   */
  async updateCounter(
    id: string,
    counter: UpdateCounterRequest
  ): Promise<Counter> {
    const res = await apiService.put<Counter>(
      `/counters/${id}`,
      counter
    );
    return res.data;
  }

  /**
   * Patch counter count
   * @param id - The ID of the counter
   * @param currentCount - The new count value
   */
  async patchCounterCount(id: string, currentCount: number): Promise<Counter> {
    const res = await apiService.patch<Counter>(
      `/counters/${id}/count`,
      { currentCount }
    );
    return res.data;
  }

  /**
   * Increment counter count
   * @param id - The ID of the counter
   * @param currentCount - The current count value
   */
  async incrementCounter(id: string, currentCount: number): Promise<Counter> {
    return this.patchCounterCount(id, currentCount + 1);
  }

  /**
   * Decrement counter count
   * @param id - The ID of the counter
   * @param currentCount - The current count value
   */
  async decrementCounter(id: string, currentCount: number): Promise<Counter> {
    return this.patchCounterCount(id, Math.max(0, currentCount - 1));
  }

  /**
   * Delete a counter
   * @param id - The ID of the counter
   */
  async deleteCounter(id: string): Promise<void> {
    await apiService.delete<void>(`/counters/${id}`);
  }
}

export const countersService = new CountersService();
