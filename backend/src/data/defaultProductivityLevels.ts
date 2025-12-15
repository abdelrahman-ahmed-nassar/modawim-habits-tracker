import type { ProductivityLevelOption } from "@shared/types";

// Default productivity levels assigned to every new user
export const DEFAULT_PRODUCTIVITY_LEVELS: ProductivityLevelOption[] = [
  { label: "ضعيف جداً", value: 1 },
  { label: "ضعيف ⚡", value: 2 },
  { label: "منخفض ⚡⚡", value: 3 },
  { label: "متوسط ⚡⚡⚡", value: 4 },
  { label: "عالي ⚡⚡⚡⚡", value: 5 },
  { label: "عالي جداً ⚡⚡⚡⚡⚡⚡", value: 6 },
];
