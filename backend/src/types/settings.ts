export interface Settings {
  userId: string;
  theme: "light" | "dark" | "system";
  language: string;
  notifications: {
    enabled: boolean;
    reminderTime: string;
  };
  reminderEnabled: boolean;
  reminderTime: string;
  backupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  lastBackupDate: string;
}

export const defaultSettings: Settings = {
  userId: "",
  theme: "system",
  language: "en",
  notifications: {
    enabled: true,
    reminderTime: "09:00",
  },
  reminderEnabled: true,
  reminderTime: "20:00",
  backupEnabled: true,
  backupFrequency: "weekly",
  lastBackupDate: new Date().toISOString(),
};
