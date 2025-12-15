import apiService from "./api";

export interface MoodOption {
  label: string;
  value: number;
}

export interface ProductivityOption {
  label: string;
  value: number;
}

// Moods API
export const getMoods = async (): Promise<MoodOption[]> => {
  const res = await apiService.get<MoodOption[]>(`/options/moods`);
  return res.data;
};

export const getMoodLabels = async (): Promise<string[]> => {
  const res = await apiService.get<string[]>(`/options/moods`, {
    params: { legacy: "true" },
  });
  return res.data;
};

export const addMood = async (mood: string | MoodOption): Promise<void> => {
  await apiService.post<void>(`/options/moods`, { mood });
};

export const removeMood = async (mood: string): Promise<void> => {
  await apiService.delete<void>(`/options/moods/${mood}`);
};

// Productivity Levels API
export const getProductivityLevels = async (): Promise<
  ProductivityOption[]
> => {
  const res = await apiService.get<ProductivityOption[]>(
    `/options/productivity-levels`
  );
  return res.data;
};

export const getProductivityLabels = async (): Promise<string[]> => {
  const res = await apiService.get<string[]>(
    `/options/productivity-levels`,
    { params: { legacy: "true" } }
  );
  return res.data;
};

export const addProductivityLevel = async (
  level: string | ProductivityOption
): Promise<void> => {
  await apiService.post<void>(`/options/productivity-levels`, { level });
};

export const removeProductivityLevel = async (level: string): Promise<void> => {
  await apiService.delete<void>(
    `/options/productivity-levels/${level}`
  );
};
