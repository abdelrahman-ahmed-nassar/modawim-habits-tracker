export interface DefaultHabit {
  name: string;
  description?: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  goalValue: number;
  motivationNote?: string;
  specificDays?: number[];
  order?: number;
}

// Default habits seeded for every new user. Completions/streaks are zeroed when created.
export const DEFAULT_HABITS: DefaultHabit[] = [
  {
    name: "العشاء فالمسجد",
    description: "تلحق تكبيرة الإحرام فالمسجد",
    tag: "الصلوات",
    repetition: "daily",
    goalValue: 60,
    motivationNote: "من صلى العشاء في جماعة فكأنما قام نصف الليل",
    order: 4,
  },
  {
    name: "المغرب فالمسجد",
    description: "إدراك تكبيرة الإحرام فالمسجد",
    tag: "الصلوات",
    repetition: "daily",
    goalValue: 60,
    motivationNote: "الصلاة إلي الصلاة كفارة لما بينهما ",
    order: 3,
  },
  {
    name: "العصر فالمسجد",
    description: "إدراك تكبيرة الإحرام فالمسجد",
    tag: "الصلوات",
    repetition: "daily",
    goalValue: 60,
    motivationNote:
      "عن عُمَارَةَ بْنِ رُؤَيْبَةَ، عَنْ أَبِيهِ، قَالَ: سَمِعْتُ رَسُولَ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، يَقُولُ: «لَنْ يَلِجَ النَّارَ أَحَدٌ صَلَّى قَبْلَ طُلُوعِ الشَّمْسِ، وَقَبْلَ غُرُوبِهَا» - يَعْنِي الْفَجْرَ وَالْعَصْرَ .",
    order: 2,
  },
  {
    name: "الظهر فالمسجد",
    description: "إدراك تكبيرة الإحرام فالمسجد",
    tag: "الصلوات",
    repetition: "daily",
    goalValue: 60,
    motivationNote:
      "، وقوله أيضاً: «رأس الأمر الإسلام، وعموده الصلاة، وذروة سنامه الجهاد في سبيل الله»",
    order: 1,
  },
  {
    name: "الفجر فالمسجد",
    description: "إدراك تكبيرة الإحرام فالمسجد",
    tag: "الصلوات",
    repetition: "daily",
    goalValue: 60,
    motivationNote:
      "من صلى الفجر في جماعة ، ثم قعد يذكر الله حتى تطلع الشمس ، ثم صلى ركعتين ، كانت له أجر حجة وعمرة ، تامة تامة تامة ”",
    order: 0,
  },
  {
    name: "أذكار الإستيقاظ",
    description: "قول الأذكار عند الإستيقاظ أو بعده",
    tag: "الأذكار",
    repetition: "daily",
    goalValue: 60,
    motivationNote:
      "في الحديث: إذا استيقظ أحدكم فليقل: الحمدلله الذي رد علي روحي, وعافاني في جسدي, وأذن لي بذكره. رواه الترمذي والنسائي.",
    order: 7,
  },
  {
    name: "أذكار النوم",
    description: "قول الأذكار عند الذهاب للنوم",
    tag: "الأذكار",
    repetition: "daily",
    goalValue: 60,
    motivationNote:
      "قال رسول الله صلى الله عليه وآله وسلم: «من قال حين يأوي إلى فراشه: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، لا حول ولا قوة إلا بالله العلي العظيم، سبحان الله والحمد لله ولا إله إلا الله والله أكبر - غُفِرت له ذنوبُه أو خطاياه وإن كانت مثل زَبَدِ البحر» أخرجه ابن حبان في صحيحه.",
    order: 6,
  },
];
