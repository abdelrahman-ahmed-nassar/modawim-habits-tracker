# Habits Tracker API Documentation

## Base URL

```
http://localhost:5002/api
```

## Health Check

### Check Server Status

```
GET /health
```

**Example:**

```bash
curl http://localhost:5002/health
```

**Response:**

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 1. Habits Management (`/habits`)

### Get All Habits

```
GET /api/habits
```

**Query Parameters:**

- `filter` (string, optional): Search term for filtering habits by name or description
- `tag` (string, optional): Filter habits by tag
- `active` (boolean, optional): Filter habits by active status (true/false)
- `sort` (string, optional): Sort order (e.g., "name:asc", "createdAt:desc")

**Example:**

```bash
curl http://localhost:5002/api/habits
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "name": "🕌 الفجر فالمسجد",
      "description": "إن قرآن الفجر كان مشهودا",
      "tag": "الصلوات",
      "repetition": "daily",
      "goalValue": 70,
      "currentStreak": 1,
      "bestStreak": 5,
      "currentCounter": 4,
      "createdAt": "2024-03-20",
      "motivationNote": "Start your day with spiritual connection",
      "isActive": true
    }
    // More habits...
  ]
}
```

### Get Single Habit

```
GET /api/habits/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "tag": "string",
    "repetition": "daily|weekly|monthly",
    "specificDays": [0, 1, 2, 3, 4, 5, 6],
    "goalValue": number,
    "currentStreak": number,
    "bestStreak": number,
    "currentCounter": number,
    "createdAt": "ISO date string",
    "motivationNote": "string",
    "isActive": boolean
  }
}
```

### Create Habit

```
POST /api/habits
```

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "tag": "string",
  "repetition": "daily|weekly|monthly",
  "specificDays": [0, 1, 2, 3, 4, 5, 6]
  "goalValue": number,
  "motivationNote": "string"
}
```

**Example:**

```bash
curl -X POST http://localhost:5002/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Habit", "description": "A test habit created via API", "tag": "Test", "repetition": "daily", "goalValue": 1}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1f723686-2a02-437a-8aeb-0496259648c6",
    "name": "Test Habit",
    "description": "A test habit created via API",
    "tag": "Test",
    "repetition": "daily",
    "goalValue": 1,
    "currentStreak": 0,
    "bestStreak": 0,
    "currentCounter": 0,
    "createdAt": "2025-05-29T15:05:38.809Z",
    "motivationNote": "",
    "isActive": true
  },
  "message": "Habit created successfully"
}
```

### Update Habit

```
PUT /api/habits/:id
```

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "tag": "string",
  "repetition": "daily|weekly|monthly",
  "specificDays": [0, 1, 2, 3, 4, 5, 6]
  "goalValue": number,
  "motivationNote": "string"
}
```

**Example:**

```bash
curl -X PUT http://localhost:5002/api/habits/water-1 \
  -H "Content-Type: application/json" \
  -d '{"name": "🥤 شرب المياه", "description": "Drink 8 glasses of water daily - Updated", "tag": "النمو", "repetition": "daily", "goalValue": 8}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "water-1",
    "name": "🥤 شرب المياه",
    "description": "Drink 8 glasses of water daily - Updated",
    "tag": "النمو",
    "repetition": "daily",
    "goalValue": 8,
    "currentStreak": 1,
    "bestStreak": 1,
    "currentCounter": 8,
    "createdAt": "2024-03-20",
    "motivationNote": "Stay hydrated for better health",
    "isActive": true
  },
  "message": "Habit updated successfully"
}
```

### Delete Habit

```
DELETE /api/habits/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Habit deleted successfully"
}
```

### Get Habit Records

```
GET /api/habits/:id/records
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "YYYY-MM-DD",
      "completed": boolean,
      "completedAt": "ISO date string"
    }
  ]
}
```

### Mark Habit Complete

```
POST /api/habits/:id/complete
```

**Request Body:**

```json
{
  "date": "YYYY-MM-DD"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "YYYY-MM-DD",
    "completed": true,
    "completedAt": "ISO date string"
  },
  "message": "Habit marked as complete"
}
```

### Delete Completion

```
DELETE /api/habits/:id/complete/:date
```

**Response:**

```json
{
  "success": true,
  "message": "Completion removed successfully"
}
```

### Archive Habit

```
POST /api/habits/:id/archive
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "isActive": false
  },
  "message": "Habit archived successfully"
}
```

### Restore Habit

```
POST /api/habits/:id/restore
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "isActive": true
  },
  "message": "Habit restored successfully"
}
```

## 2. Completions Management (`/completions`)

### Get Daily Completions

```
GET /api/completions/date/:date
```

**Example:**

```bash
curl http://localhost:5002/api/completions/date/2025-05-29
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "c9c2fcda-78a4-4933-9007-88ba1010844f",
      "habitId": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
      "date": "2025-05-29",
      "completed": true,
      "completedAt": "2025-05-27T10:49:16.160Z"
    },
    {
      "id": "44ec4358-462a-4a5d-8450-55367848dd1a",
      "habitId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "date": "2025-05-29",
      "completed": true,
      "completedAt": "2025-05-27T10:49:22.957Z"
    }
    // More completions...
  ]
}
```

### Get Habit Completions

```
GET /api/completions/habit/:habitId
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "YYYY-MM-DD",
      "completed": boolean,
      "completedAt": "ISO date string"
    }
  ]
}
```

### Get Completions in Range

```
GET /api/completions/range/:startDate/:endDate
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "YYYY-MM-DD",
      "completed": boolean,
      "completedAt": "ISO date string"
    }
  ]
}
```

### Create Completion

```
POST /api/completions
```

**Request Body:**

```json
{
  "habitId": "string",
  "date": "YYYY-MM-DD"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "YYYY-MM-DD",
    "completed": true,
    "completedAt": "ISO date string"
  },
  "message": "Habit marked as complete"
}
```

### Create Completions Batch

```
POST /api/completions/batch
```

**Request Body:**

```json
{
  "completions": [
    {
      "habitId": "string",
      "date": "YYYY-MM-DD"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "YYYY-MM-DD",
      "completed": true,
      "completedAt": "ISO date string"
    }
  ],
  "message": "Batch completions created successfully"
}
```

### Toggle Completion

```
POST /api/completions/toggle
```

**Request Body:**

```json
{
  "habitId": "string",
  "date": "YYYY-MM-DD"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "YYYY-MM-DD",
    "completed": boolean,
    "completedAt": "ISO date string"
  },
  "message": "Habit completion toggled successfully"
}
```

### Delete Completion

```
DELETE /api/completions/:habitId/:date
```

**Response:**

```json
{
  "success": true,
  "message": "Completion removed successfully"
}
```

### Update Completion

```
PUT /api/completions/:id
```

**Request Body:**

```json
{
  "completed": boolean
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "YYYY-MM-DD",
    "completed": boolean,
    "completedAt": "ISO date string"
  },
  "message": "Completion updated successfully"
}
```

## 3. Analytics (`/analytics`)

### Get Overall Analytics

```
GET /api/analytics/overview
```

**Example:**

```bash
curl http://localhost:5002/api/analytics/overview
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalHabits": 22,
    "activeHabitsCount": 22,
    "completedToday": 8,
    "mostConsistentHabits": [
      {
        "habitId": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
        "habitName": "🕌 المغرب فالمسجد",
        "successRate": 0.16129032258064516,
        "currentStreak": 1,
        "bestStreak": 6
      },
      {
        "habitId": "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
        "habitName": "🕌 العشاء فالمسجد",
        "successRate": 0.16129032258064516,
        "currentStreak": 6,
        "bestStreak": 6
      }
      // More habits...
    ],
    "longestStreakHabit": {
      "habitName": "🕌 المغرب فالمسجد",
      "bestStreak": 6
    },
    "last30DaysSuccessRate": 0.08588957055214724,
    "bestDayOfWeek": {
      "dayOfWeek": 2,
      "dayName": "Tuesday",
      "successRate": 1,
      "totalCompletions": 19
    },
    "dayOfWeekStats": [
      {
        "dayOfWeek": 0,
        "dayName": "Sunday",
        "successRate": 0.7777777777777778,
        "totalCompletions": 7
      }
      // More day stats...
    ]
  }
}
```

### Get Habit Analytics

```
GET /api/analytics/habits/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "habitId": "string",
    "habitName": "string",
    "streakData": {
      "currentStreak": number,
      "bestStreak": number,
      "totalCompletions": number,
      "completionRate": number
    },
    "lastCompletedDate": "YYYY-MM-DD",
    "dayOfWeekStats": [
      {
        "dayOfWeek": number,
        "dayName": "string",
        "completionRate": number,
        "completionCount": number
      }
    ],
    "monthlyStats": [
      {
        "month": number,
        "monthName": "string",
        "completionRate": number,
        "completionCount": number
      }
    ]
  }
}
```

### Get Daily Analytics

```
GET /api/analytics/daily/:date
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "YYYY-MM-DD",
    "totalHabits": number,
    "completedHabits": number,
    "completionRate": number,
    "habitCompletions": [
      {
        "habitId": "string",
        "habitName": "string",
        "completed": boolean
      }
    ]
  }
}
```

### Get Weekly Analytics

```
GET /api/analytics/weekly/:startDate
```

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "overallCompletionRate": number,
    "dailyStats": [
      {
        "date": "YYYY-MM-DD",
        "dayOfWeek": number,
        "dayName": "string",
        "completionRate": number,
        "totalHabits": number,
        "completedHabits": number
      }
    ],
    "habitPerformance": [
      {
        "habitId": "string",
        "habitName": "string",
        "completionRate": number,
        "daysCompleted": number
      }
    ]
  }
}
```

### Get Monthly Analytics

```
GET /api/analytics/monthly/:year/:month
```

**Response:**

```json
{
  "success": true,
  "data": {
    "year": number,
    "month": number,
    "monthName": "string",
    "overallCompletionRate": number,
    "totalHabits": number,
    "dailyStats": [
      {
        "date": "YYYY-MM-DD",
        "dayOfWeek": number,
        "dayName": "string",
        "completionRate": number,
        "completedHabits": number
      }
    ],
    "habitPerformance": [
      {
        "habitId": "string",
        "habitName": "string",
        "completionRate": number,
        "daysCompleted": number
      }
    ],
    "weeklyBreakdown": [
      {
        "weekStart": "YYYY-MM-DD",
        "weekEnd": "YYYY-MM-DD",
        "completionRate": number
      }
    ]
  }
}
```

### Get Quarter Analytics

```
GET /api/analytics/quarter/:startDate
```

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "overallCompletionRate": number,
    "monthlyBreakdown": [
      {
        "month": number,
        "monthName": "string",
        "completionRate": number,
        "totalDays": number
      }
    ],
    "habitPerformance": [
      {
        "habitId": "string",
        "habitName": "string",
        "completionRate": number,
        "daysCompleted": number,
        "totalPossibleDays": number
      }
    ],
    "streakImprovements": [
      {
        "habitId": "string",
        "habitName": "string",
        "initialStreak": number,
        "finalStreak": number,
        "improvement": number
      }
    ]
  }
}
```

### Get All Habits Analytics

```
GET /api/analytics/habits
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "habitId": "string",
      "habitName": "string",
      "completionRate": number,
      "currentStreak": number,
      "bestStreak": number,
      "totalCompletions": number
    }
  ]
}
```

## 4. Records (`/records`)

### Get Daily Records

```
GET /api/records/daily/:date
```

**Example:**

```bash
curl http://localhost:5002/api/records/daily/2025-05-29
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2025-05-29",
    "records": [
      {
        "id": "c9c2fcda-78a4-4933-9007-88ba1010844f",
        "habitId": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        "date": "2025-05-29",
        "completed": true,
        "completedAt": "2025-05-27T10:49:16.160Z",
        "habitName": "🕌 العصر فالمسجد",
        "habitTag": "الصلوات",
          "goalValue": 1
      },
      {
        "id": "44ec4358-462a-4a5d-8450-55367848dd1a",
        "habitId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "date": "2025-05-29",
        "completed": true,
        "completedAt": "2025-05-27T10:49:22.957Z",
        "habitName": "🕌 الفجر فالمسجد",
        "habitTag": "الصلوات",
          "goalValue": 70
      }
      // More records...
    ],
    "stats": {
      "totalHabits": 21,
      "completedHabits": 8,
      "completionRate": 0.38095238095238093
    }
  }
}
```

### Get Weekly Records

```
GET /api/records/weekly/:startDate
```

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "dailyRecords": [
      {
        "date": "YYYY-MM-DD",
        "dayName": "string",
        "habits": [
          {
            "habitId": "string",
            "habitName": "string",
            "completed": boolean
          }
        ],
        "stats": {
          "totalHabits": number,
          "completedHabits": number,
          "completionRate": number
        }
      }
    ],
    "weeklyStats": {
      "totalHabits": number,
      "averageCompletionRate": number
    }
  }
}
```

### Get Monthly Records

```
GET /api/records/monthly/:year/:month
```

**Response:**

```json
{
  "success": true,
  "data": {
    "year": number,
    "month": number,
    "monthName": "string",
    "daysInMonth": number,
    "habitRecords": [
      {
        "habitId": "string",
        "habitName": "string",
        "dailyCompletions": {
          "1": boolean,
          "2": boolean,
          // ... for each day of the month
          "31": boolean
        },
        "stats": {
          "totalPossibleDays": number,
          "completedDays": number,
          "completionRate": number
        }
      }
    ],
    "monthlyStats": {
      "totalHabits": number,
      "averageCompletionRate": number
    }
  }
}
```

## 5. Notes Management (`/notes`)

### Get All Notes

```
GET /api/notes
```

**Example:**

```bash
curl http://localhost:5002/api/notes
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "588f6ba0-ca7e-47d9-aae0-9ef30725859b",
      "date": "2025-05-27",
      "content": "بسم الله",
      "mood": "جديد",
      "productivityLevel": "High ⚡⚡⚡⚡",
      "createdAt": "2025-05-27T10:45:58.994Z",
      "updatedAt": "2025-05-27T16:37:59.974Z"
    },
    {
      "id": "350a61c0-3ba3-46af-b7a6-b95ca9cb0f9f",
      "date": "2025-05-28",
      "content": "بسم الله نبدأ\n\n## لعل الله يحدث بعد ذلك أمرا 🤲\n\nشد حيلك وعيش ايام من الخير تمحوا ما مضي\n\nفلن يزيل الكثير من السواد علي القلب إلا الكثير من الماء الأبيض",
      "mood": "أمل",
      "productivityLevel": "High ⚡⚡⚡⚡",
      "createdAt": "2025-05-28T03:13:25.170Z",
      "updatedAt": "2025-05-28T03:13:42.706Z"
    },
    {
      "id": "66980aca-b04f-4332-abd8-a8db2a5317d8",
      "date": "2025-05-29",
      "content": "# Weekly Review - 5/25/2025 to 5/31/2025\n\n## Accomplishments\n\n\n## Challenges\n\n\n## Next Week Goals",
      "mood": "هادي",
      "productivityLevel": "Low ⚡⚡",
      "createdAt": "2025-05-28T23:51:25.819Z",
      "updatedAt": "2025-05-28T23:51:25.819Z"
    }
  ]
}
```

### Get Note by Date

```
GET /api/notes/:date
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "date": "YYYY-MM-DD",
    "content": "string",
    "mood": "string",
    "productivityLevel": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

### Create Note

```
POST /api/notes
```

**Request Body:**

```json
{
  "date": "YYYY-MM-DD",
  "content": "string",
  "mood": "string",
  "productivityLevel": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "date": "YYYY-MM-DD",
    "content": "string",
    "mood": "string",
    "productivityLevel": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  },
  "message": "Note created successfully"
}
```

### Update Note

```
PUT /api/notes/:id
```

**Request Body:**

```json
{
  "content": "string",
  "mood": "string",
  "productivityLevel": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "date": "YYYY-MM-DD",
    "content": "string",
    "mood": "string",
    "productivityLevel": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  },
  "message": "Note updated successfully"
}
```

### Delete Note

```
DELETE /api/notes/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

### Get Notes Analytics Overview

```
GET /api/notes/analytics/overview
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalNotes": number,
    "moodDistribution": [
      {
        "mood": "string",
        "count": number,
        "percentage": number
      }
    ],
    "productivityDistribution": [
      {
        "level": "string",
        "count": number,
        "percentage": number
      }
    ],
    "recentMoodTrend": [
      {
        "date": "YYYY-MM-DD",
        "mood": "string",
        "moodValue": number
      }
    ]
  }
}
```

### Get Mood Trends

```
GET /api/notes/analytics/mood-trends
```

**Response:**

```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "date": "YYYY-MM-DD",
        "mood": "string",
        "moodValue": number
      }
    ],
    "weekly": [
      {
        "weekStart": "YYYY-MM-DD",
        "weekEnd": "YYYY-MM-DD",
        "averageMood": number,
        "dominantMood": "string"
      }
    ],
    "monthly": [
      {
        "month": number,
        "year": number,
        "monthName": "string",
        "averageMood": number,
        "dominantMood": "string"
      }
    ]
  }
}
```

### Get Productivity Correlation

```
GET /api/notes/analytics/productivity-correlation
```

**Response:**

```json
{
  "success": true,
  "data": {
    "moodToProductivity": [
      {
        "mood": "string",
        "averageProductivity": number,
        "occurrences": number
      }
    ],
    "productivityToHabitCompletion": [
      {
        "productivityLevel": "string",
        "averageCompletionRate": number,
        "occurrences": number
      }
    ],
    "dayOfWeekToProductivity": [
      {
        "dayOfWeek": number,
        "dayName": "string",
        "averageProductivity": number
      }
    ]
  }
}
```

### Get Notes Calendar

```
GET /api/notes/calendar/:year/:month
```

**Response:**

```json
{
  "success": true,
  "data": {
    "year": number,
    "month": number,
    "monthName": "string",
    "days": [
      {
        "date": "YYYY-MM-DD",
        "hasNote": boolean,
        "mood": "string",
        "productivity": "string"
      }
    ]
  }
}
```

## 6. Settings Management (`/settings`)

### Get Settings

```
GET /api/settings
```

**Example:**

```bash
curl http://localhost:5002/api/settings
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "38ae7e2d-ab34-4991-908a-ca70bf457e19",
    "theme": "dark",
    "reminderEnabled": true,
    "reminderTime": "09:00",
  }
}
```

### Update Settings

```
PUT /api/settings
```

**Request Body:**

```json
{
  "theme": "string",
  "reminderEnabled": boolean,
  "reminderTime": "HH:MM",
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "string",
    "theme": "string",
    "reminderEnabled": boolean,
    "reminderTime": "HH:MM",
  },
  "message": "Settings updated successfully"
}
```

## 7. Options Management (`/options`)

### Get Moods

```
GET /api/options/moods
```

**Example:**

```bash
curl http://localhost:5002/api/options/moods
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "label": "مبسوط",
      "value": 10
    },
    {
      "label": "حزين",
      "value": 2
    },
    {
      "label": "عادي",
      "value": 5
    },
    {
      "label": "متوتر",
      "value": 3
    },
    {
      "label": "هادي",
      "value": 6
    }
    // More moods...
  ]
}
```

### Add Mood

```
POST /api/options/moods
```

**Request Body:**

```json
{
  "label": "string",
  "value": number
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "label": "string",
      "value": number
    }
  ],
  "message": "Mood added successfully"
}
```

### Remove Mood

```
DELETE /api/options/moods/:mood
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "label": "string",
      "value": number
    }
  ],
  "message": "Mood removed successfully"
}
```

### Get Productivity Levels

```
GET /api/options/productivity-levels
```

**Example:**

```bash
curl http://localhost:5002/api/options/productivity-levels
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "label": "Bruh",
      "value": 1
    },
    {
      "label": "Very Low ⚡",
      "value": 2
    },
    {
      "label": "Low ⚡⚡",
      "value": 3
    },
    {
      "label": "Medium ⚡⚡",
      "value": 4
    },
    {
      "label": "High ⚡⚡⚡⚡",
      "value": 5
    },
    {
      "label": "Very High ⚡⚡⚡⚡⚡⚡",
      "value": 6
    }
  ]
}
```

### Add Productivity Level

```
POST /api/options/productivity-levels
```

**Request Body:**

```json
{
  "label": "string",
  "value": number
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "label": "string",
      "value": number
    }
  ],
  "message": "Productivity level added successfully"
}
```

### Remove Productivity Level

```
DELETE /api/options/productivity-levels/:level
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "label": "string",
      "value": number
    }
  ],
  "message": "Productivity level removed successfully"
}
```


## 9. Tags Management (`/tags`)

### Get All Tags

```
GET /api/tags
```

**Example:**

```bash
curl http://localhost:5002/api/tags
```

**Response:**

```json
[
  {
    "id": "1",
    "name": "Health",
    "color": "#FF5733"
  },
  {
    "id": "2",
    "name": "Productivity",
    "color": "#33FF57"
  },
  {
    "id": "3",
    "name": "Learning",
    "color": "#3357FF"
  }
]
```

### Get Single Tag

```
GET /api/tags/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "color": "string"
  }
}
```

### Create Tag

```
POST /api/tags
```

**Request Body:**

```json
{
  "name": "string",
  "color": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "color": "string"
  },
  "message": "Tag created successfully"
}
```

### Update Tag

```
PUT /api/tags/:id
```

**Request Body:**

```json
{
  "name": "string",
  "color": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "color": "string"
  },
  "message": "Tag updated successfully"
}
```

### Delete Tag

```
DELETE /api/tags/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

## 10. Note Templates Management (`/templates`)

### Get All Templates

```
GET /api/templates
```

**Example:**

```bash
curl http://localhost:5002/api/templates
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "daily",
      "name": "Daily Note",
      "template": "## 1. # Daily Note - {{date}}\n\n## Tasks\n- [ ] \n1. \n## Notes\n\n\n## Mood\n\n\n## Achievements\n\n",
      "updatedAt": "2025-05-27T16:38:32.651Z"
    },
    {
      "id": "weekly",
      "name": "Weekly Review",
      "template": "# Weekly Review - {{weekStart}} to {{weekEnd}}\n\n## Accomplishments\n\n\n## Challenges\n\n\n## Next Week Goals\n\n"
    },
    {
      "id": "monthly",
      "name": "Monthly Review",
      "template": "# Monthly Review - {{month}} {{year}}\n\n## Overview\n\n\n## Wins\n\n\n## Areas to Improve\n\n\n## Goals for Next Month\n\n",
      "updatedAt": "2025-05-27T15:43:58.539Z"
    }
  ]
}
```

### Get Template By ID

```
GET /api/templates/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "template": "string",
    "updatedAt": "ISO date string"
  }
}
```

### Create Template

```
POST /api/templates
```

**Request Body:**

```json
{
  "name": "string",
  "template": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "template": "string",
    "updatedAt": "ISO date string"
  },
  "message": "Template created successfully"
}
```

### Update Template

```
PUT /api/templates/:id
```

**Request Body:**

```json
{
  "name": "string",
  "template": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "template": "string",
    "updatedAt": "ISO date string"
  },
  "message": "Template updated successfully"
}
```

### Delete Template

```
DELETE /api/templates/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

## Error Responses

All API endpoints return a consistent error format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "stack": "Stack trace (in development environment only)"
}
```

**Example error (resource not found):**

```bash
curl http://localhost:5002/api/habits/water-999
```

**Response:**

```json
{
  "success": false,
  "message": "Habit with ID water-999 not found",
  "stack": "Error: Habit with ID water-999 not found\n    at S:\\projects\\habits-tracker\\backend\\src\\controllers\\habitController.ts:87:13"
}
```

Common error status codes:

- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
