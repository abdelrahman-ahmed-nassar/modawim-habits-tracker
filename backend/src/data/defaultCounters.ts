export interface DefaultCounterTemplate {
  name: string;
  goal: number;
  motivationNote: string;
}

// Templates for counters assigned to every new user. Actual counters get IDs,
// zeroed currentCount, and timestamps at registration time.
export const DEFAULT_COUNTER_TEMPLATES: DefaultCounterTemplate[] = [
  {
    name: "قراءة عشرين كتاب",
    goal: 20,
    motivationNote: "القراءة توسع آفاقي وتزيد من معرفتي.",
  },
  {
    name: "مشاريع برمجية مكتملة",
    goal: 12,
    motivationNote: "كل مشروع يضيف مهارة جديدة لمسيرتي المهنية.",
  },
  {
    name: "ساعات تطوع في المجتمع",
    goal: 100,
    motivationNote: "العطاء يجعل الحياة أفضل للجميع.",
  },
  {
    name: "لقاءات عائلية",
    goal: 50,
    motivationNote: "الأسرة هي الأساس، ابقَ على تواصل.",
  },
  {
    name: "وجبات صحية محضرة في المنزل",
    goal: 200,
    motivationNote: "الطعام الصحي استثمار في مستقبلي.",
  },
];
