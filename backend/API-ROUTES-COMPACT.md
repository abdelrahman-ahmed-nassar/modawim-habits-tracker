# Habits Tracker API Routes - Compact Reference

Base URL: `http://localhost:5002/api`

Auth & scope:

- `POST /auth/register` – register user (returns `{ user, token }`)
- `POST /auth/login` – login (returns `{ user, token }`)
- `GET /auth/me` – current user
- All other `/api/...` routes require `Authorization: Bearer <token>` and are scoped to that user.

## Health Check

- `GET /health` - Check server status

## 1. Habits Management

- `GET /habits` - Get all habits
- `GET /habits/:id` - Get a single habit by ID
- `POST /habits` - Create a new habit
- `PUT /habits/:id` - Update a habit
- `DELETE /habits/:id` - Delete a habit
- `GET /habits/:id/records` - Get habit completion records
- `POST /habits/:id/complete` - Mark habit as complete
- `DELETE /habits/:id/complete/:date` - Delete habit completion
- `POST /habits/:id/archive` - Archive a habit
- `POST /habits/:id/restore` - Restore an archived habit

## 2. Completions Management

- `GET /completions/date/:date` - Get completions for a specific date
- `GET /completions/habit/:habitId` - Get completions for a specific habit
- `GET /completions/range/:startDate/:endDate` - Get completions within date range
- `POST /completions` - Create a completion
- `POST /completions/batch` - Create multiple completions at once
- `POST /completions/toggle` - Toggle completion status
- `DELETE /completions/:habitId/:date` - Delete a completion
- `PUT /completions/:id` - Update a completion

## 3. Analytics

- `GET /analytics/overview` - Get overall analytics
- `GET /analytics/habits/:id` - Get analytics for a specific habit
- `GET /analytics/daily/:date` - Get analytics for a specific day
- `GET /analytics/weekly/:startDate` - Get weekly analytics
- `GET /analytics/monthly/:year/:month` - Get monthly analytics
- `GET /analytics/quarter/:startDate` - Get quarterly analytics
- `GET /analytics/habits` - Get analytics for all habits

## 4. Records

- `GET /records/daily/:date` - Get daily records
- `GET /records/weekly/:startDate` - Get weekly records
- `GET /records/monthly/:year/:month` - Get monthly records

## 5. Notes Management

- `GET /notes` - Get all notes
- `GET /notes/:date` - Get note by date
- `POST /notes` - Create a note
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note
- `GET /notes/analytics/overview` - Get notes analytics overview
- `GET /notes/analytics/mood-trends` - Get mood trends
- `GET /notes/analytics/productivity-correlation` - Get productivity correlation
- `GET /notes/calendar/:year/:month` - Get notes calendar

## 6. Settings Management

- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings

## 7. Options Management

- `GET /options/moods` - Get available moods
- `POST /options/moods` - Add a new mood
- `DELETE /options/moods/:mood` - Remove a mood
- `GET /options/productivity-levels` - Get productivity levels
- `POST /options/productivity-levels` - Add a productivity level
- `DELETE /options/productivity-levels/:level` - Remove a productivity level

## 8. Tags Management

- `GET /tags` - Get all tags
- `GET /tags/:id` - Get a single tag
- `POST /tags` - Create a tag
- `PUT /tags/:id` - Update a tag
- `DELETE /tags/:id` - Delete a tag

## 9. Note Templates Management

- `GET /templates` - Get all templates
- `GET /templates/:id` - Get a template by ID
- `POST /templates` - Create a template
- `PUT /templates/:id` - Update a template
- `DELETE /templates/:id` - Delete a template

## 10. Counters Management

- `GET /counters` - Get all counters
- `POST /counters` - Create a counter
- `PUT /counters/:id` - Update a counter
- `DELETE /counters/:id` - Delete a counter
