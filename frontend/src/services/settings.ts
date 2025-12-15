import apiService from "./api";

type Settings = Record<string, unknown>;

export class SettingsService {
  /**
   * Get current settings
   */
  static async getSettings(): Promise<Settings> {
    const res = await apiService.get<Settings>("/settings");
    return res.data;
  }

  /**
   * Update settings
   * @param settings - The new settings to apply
   */
  static async updateSettings(settings: Settings): Promise<Settings> {
    const res = await apiService.put<Settings>("/settings", settings);
    return res.data;
  }
}
