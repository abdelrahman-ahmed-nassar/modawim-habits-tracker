import type { NoteTemplate } from "@shared/types";

// Default note templates assigned to every new user
export const DEFAULT_NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "daily",
    name: "الملاحظة اليومية",
    template:
      "# الملاحظة اليومية - {{date}}\n\n## المهام\n- [ ] \n1. \n## ملاحظات\n\n\n## المزاج\n\n\n## الإنجازات\n\n",
    updatedAt: "2025-05-27T16:38:32.651Z",
  },
  {
    id: "weekly",
    name: "المراجعة الأسبوعية",
    template:
      "# المراجعة الأسبوعية - {{weekStart}} إلى {{weekEnd}}\n\n## الإنجازات\n\n\n## التحديات\n\n\n## أهداف الأسبوع القادم\n\n",
  },
  {
    id: "monthly",
    name: "المراجعة الشهرية",
    template:
      "# المراجعة الشهرية - {{month}} {{year}}\n\n## نظرة عامة\n\n\n## النجاحات\n\n\n## مجالات التحسين\n\n\n## أهداف الشهر القادم\n\n",
    updatedAt: "2025-05-27T15:43:58.539Z",
  },
];
