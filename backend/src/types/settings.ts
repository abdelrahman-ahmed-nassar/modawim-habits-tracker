export interface Settings {
  userId: string;
  enableRandomNote: boolean;
}

export const defaultSettings: Settings = {
  userId: "",
  enableRandomNote: true,
};
