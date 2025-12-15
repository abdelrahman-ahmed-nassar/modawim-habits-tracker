const API_BASE_URL = "http://localhost:5002/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type Settings = Record<string, unknown>;

export class SettingsService {
  /**
   * Get current settings
   */
  static async getSettings(): Promise<Settings> {
    const response = await fetch(`${API_BASE_URL}/settings`);
    const result: ApiResponse<Settings> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch settings");
    }

    return result.data;
  }

  /**
   * Update settings
   * @param settings - The new settings to apply
   */
  static async updateSettings(settings: Settings): Promise<Settings> {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const result: ApiResponse<Settings> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to update settings");
    }

    return result.data;
  }
}
