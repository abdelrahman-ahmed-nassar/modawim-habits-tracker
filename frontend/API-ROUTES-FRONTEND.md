## Backend routes used by the frontend

**Base API URL**

- **Base URL**: `import.meta.env.VITE_API_URL || "http://localhost:5002/api"`
- All routes below are relative to this base, e.g. final URL is `<BASE_URL><path>`.

---

## Auth routes (`src/services/auth.ts`)

- **POST** `/auth/register`
- **POST** `/auth/login`
- **GET** `/auth/me`
- **PUT** `/auth/me`
- **POST** `/auth/change-password`
- **DELETE** `/auth/me`

---

## Habits routes (`src/services/habits.ts`, also used in `records.ts`, `completions.ts`)

- **GET** `/habits`  
  - Optional query: `?active=all`
- **GET** `/habits/:id`
- **POST** `/habits`
- **PUT** `/habits/:id`
- **DELETE** `/habits/:id`
- **GET** `/habits/:id/records`
- **POST** `/habits/:id/complete`
- **DELETE** `/habits/:id/complete/:date`
- **POST** `/habits/:id/archive`
- **POST** `/habits/:id/restore`
- **GET** `/habits/random/pick`
- **POST** `/habits/:habitId/sync-analytics`
- **POST** `/habits/sync-analytics`

---

## Completions routes (`src/services/completions.ts`, also via `records.ts`)

- **GET** `/completions/date/:date`
- **GET** `/completions/habit/:habitId`
- **GET** `/completions/range/:startDate/:endDate`
- **POST** `/completions`
- **POST** `/completions/batch`
- **POST** `/completions/toggle`
- **DELETE** `/completions/:habitId/:date`

---

## Counters routes (`src/services/counters.ts`)

- **GET** `/counters`
- **GET** `/counters/:id`
- **POST** `/counters`
- **PUT** `/counters/:id`
- **PATCH** `/counters/:id/count`
- **DELETE** `/counters/:id`

---

## Notes core routes (`src/services/notes.ts`)

- **GET** `/notes`
- **GET** `/notes/:date`
- **POST** `/notes`
- **PUT** `/notes/:id`
- **DELETE** `/notes/:id`

---

## Options routes (moods & productivity)

Used from `src/services/notes.ts` and `src/services/options.ts`.

- **GET** `/options/moods`
  - Optional query: `?legacy=true`
- **POST** `/options/moods`
- **DELETE** `/options/moods/:mood`
- **GET** `/options/productivity-levels`
  - Optional query: `?legacy=true`
- **POST** `/options/productivity-levels`
- **DELETE** `/options/productivity-levels/:level`

---

## Notes analytics & calendar routes

Used from `src/services/notes.ts` and `src/services/analytics.ts`.

- **GET** `/notes/analytics/overview`
- **GET** `/notes/analytics/mood-trends`
  - Optional query params: `startDate`, `endDate`
- **GET** `/notes/analytics/productivity-correlation`
- **GET** `/notes/calendar/:year/:month`

---

## Habit & general analytics routes (`src/services/analytics.ts`)

- **GET** `/analytics/overview`
- **GET** `/analytics/habits/:habitId`
- **GET** `/analytics/habits/:habitId` with query `?period=7days|30days|90days|365days`
- **GET** `/analytics/daily/:date`
- **GET** `/analytics/weekly/:startDate`
- **GET** `/analytics/monthly/:year/:month`
- **GET** `/analytics/quarter/:startDate`

---

## Records routes (`src/services/records.ts`)

- **GET** `/records/daily/:date`
- **GET** `/records/weekly/:startDate`
- **GET** `/records/monthly/:year/:month`
- **GET** `/habits/:habitId/records`
- **POST** `/habits/:habitId/complete`
- **DELETE** `/habits/:habitId/complete/:date`
- **POST** `/completions/toggle`

---

## Settings routes (`src/services/settings.ts`, `src/pages/Settings.tsx`)

- **GET** `/settings`
- **PUT** `/settings`
- **DELETE** `/settings/reset-data`

---

## Templates routes (`src/services/templates.ts`)

- **GET** `/templates`
- **GET** `/templates/:id`
- **POST** `/templates`
- **PUT** `/templates/:id`
- **DELETE** `/templates/:id`


