# Habits Tracker API Routes

Base URL: `http://localhost:5002/api`

## Health Check

- `GET /health` - Check server status

## 1. Habits Management

- `GET /api/habits` - Get all habits
- `GET /api/habits/:id` - Get a single habit by ID
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit
- `GET /api/habits/:id/records` - Get habit completion records
- `POST /api/habits/:id/complete` - Mark habit as complete
- `DELETE /api/habits/:id/complete/:date` - Delete habit completion
- `POST /api/habits/:id/archive` - Archive a habit
- `POST /api/habits/:id/restore` - Restore an archived habit

## 2. Completions Management

- `GET /api/completions/date/:date` - Get completions for a specific date
- `GET /api/completions/habit/:habitId` - Get completions for a specific habit
- `GET /api/completions/range/:startDate/:endDate` - Get completions within date range
- `POST /api/completions` - Create a completion
- `POST /api/completions/batch` - Create multiple completions at once
- `POST /api/completions/toggle` - Toggle completion status
- `DELETE /api/completions/:habitId/:date` - Delete a completion
- `PUT /api/completions/:id` - Update a completion

## 3. Analytics

- `GET /api/analytics/overview` - Get overall analytics
- `GET /api/analytics/habits/:id` - Get analytics for a specific habit
- `GET /api/analytics/daily/:date` - Get analytics for a specific day
- `GET /api/analytics/weekly/:startDate` - Get weekly analytics
- `GET /api/analytics/monthly/:year/:month` - Get monthly analytics
- `GET /api/analytics/quarter/:startDate` - Get quarterly analytics
- `GET /api/analytics/habits` - Get analytics for all habits

## 4. Records

- `GET /api/records/daily/:date` - Get daily records
- `GET /api/records/weekly/:startDate` - Get weekly records
- `GET /api/records/monthly/:year/:month` - Get monthly records

## 5. Notes Management

- `GET /api/notes` - Get all notes
- `GET /api/notes/:date` - Get note by date
- `POST /api/notes` - Create a note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `GET /api/notes/analytics/overview` - Get notes analytics overview
- `GET /api/notes/analytics/mood-trends` - Get mood trends
- `GET /api/notes/analytics/productivity-correlation` - Get productivity correlation
- `GET /api/notes/calendar/:year/:month` - Get notes calendar

## 6. Settings Management

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 7. Options Management

- `GET /api/options/moods` - Get available moods
- `POST /api/options/moods` - Add a new mood
- `DELETE /api/options/moods/:mood` - Remove a mood
- `GET /api/options/productivity-levels` - Get productivity levels
- `POST /api/options/productivity-levels` - Add a productivity level
- `DELETE /api/options/productivity-levels/:level` - Remove a productivity level

## 8. Tags Management

- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get a single tag
- `POST /api/tags` - Create a tag
- `PUT /api/tags/:id` - Update a tag
- `DELETE /api/tags/:id` - Delete a tag

## 9. Note Templates Management

- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get a template by ID
- `POST /api/templates` - Create a template
- `PUT /api/templates/:id` - Update a template
- `DELETE /api/templates/:id` - Delete a template

## 10. Counters Management

- `GET /api/counters` - Get all counters
- `POST /api/counters` - Create a counter
- `PUT /api/counters/:id` - Update a counter
- `DELETE /api/counters/:id` - Delete a counter
