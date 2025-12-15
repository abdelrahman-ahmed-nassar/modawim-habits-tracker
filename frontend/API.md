# Habits Tracker API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## API Endpoints

### 1. Habits Management (`/habits`)

#### Get All Habits

```http
GET /habits
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "tag": "string",
      "repetition": "daily" | "weekly" | "monthly",
      "goalType": "streak" | "counter",
      "goalValue": number,
      "currentStreak": number,
      "bestStreak": number,
      "createdAt": "string (ISO date)",
      "motivationNote": "string",
      "isActive": boolean
    }
  ]
}
```

#### Get Single Habit

```http
GET /habits/:id
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
    "repetition": "daily" | "weekly" | "monthly",
    "goalType": "streak" | "counter",
    "goalValue": number,
    "currentStreak": number,
    "bestStreak": number,
    "createdAt": "string (ISO date)",
    "motivationNote": "string",
    "isActive": boolean
  }
}
```

#### Create Habit

```http
POST /habits
```

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "repetition": "daily" | "weekly" | "monthly",
  "tag": "string",
  "goalType": "streak" | "counter",
  "goalValue": number
}
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
    "repetition": "daily" | "weekly" | "monthly",
    "goalType": "streak" | "counter",
    "goalValue": number,
    "currentStreak": number,
    "bestStreak": number,
    "createdAt": "string (ISO date)",
    "isActive": boolean
  },
  "message": "Habit created successfully"
}
```

#### Update Habit

```http
PUT /habits/:id
```

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "repetition": "daily" | "weekly" | "monthly",
  "tag": "string",
  "goalType": "streak" | "counter",
  "goalValue": number
}
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
    "repetition": "daily" | "weekly" | "monthly",
    "goalType": "streak" | "counter",
    "goalValue": number,
    "currentStreak": number,
    "bestStreak": number,
    "createdAt": "string (ISO date)",
    "motivationNote": "string",
    "isActive": boolean
  },
  "message": "Habit updated successfully"
}
```

#### Delete Habit

```http
DELETE /habits/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Habit and associated records deleted successfully"
}
```

#### Get Habit Records

```http
GET /habits/:id/records
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "string (ISO date)",
      "completed": boolean,
      "completedAt": "string (ISO date)"
    }
  ]
}
```

#### Mark Habit Complete

```http
POST /habits/:id/complete
```

**Request Body:**

```json
{
  "date": "string (ISO date)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "string (ISO date)",
    "completed": boolean,
    "completedAt": "string (ISO date)"
  },
  "message": "Habit marked as completed"
}
```

#### Delete Completion

```http
DELETE /habits/:id/complete/:date
```

**Response:**

```json
{
  "success": true,
  "message": "Completion deleted successfully"
}
```

#### Archive Habit

```http
POST /habits/:id/archive
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
    "repetition": "daily" | "weekly" | "monthly",
    "goalType": "streak" | "counter",
    "goalValue": number,
    "currentStreak": number,
    "bestStreak": number,
    "createdAt": "string (ISO date)",
    "motivationNote": "string",
    "isActive": false
  },
  "message": "Habit archived successfully"
}
```

#### Restore Habit

```http
POST /habits/:id/restore
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
    "repetition": "daily" | "weekly" | "monthly",
    "goalType": "streak" | "counter",
    "goalValue": number,
    "currentStreak": number,
    "bestStreak": number,
    "createdAt": "string (ISO date)",
    "motivationNote": "string",
    "isActive": true
  },
  "message": "Habit restored successfully"
}
```

### 2. Completions Management (`/completions`)

#### Get Daily Completions

```http
GET /completions/date/:date
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "string (ISO date)",
      "completed": boolean,
      "value": number,
      "completedAt": "string (ISO date)"
    }
  ]
}
```

#### Get Habit Completions

```http
GET /completions/habit/:habitId
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "string (ISO date)",
      "completed": boolean,
      "value": number,
      "completedAt": "string (ISO date)"
    }
  ]
}
```

#### Get Completions in Range

```http
GET /completions/range/:startDate/:endDate
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "string (ISO date)",
      "completed": boolean,
      "value": number,
      "completedAt": "string (ISO date)"
    }
  ]
}
```

#### Create Completion

```http
POST /completions
```

**Request Body:**

```json
{
  "habitId": "string",
  "date": "string (ISO date)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "string (ISO date)",
    "completed": boolean,
    "completedAt": "string (ISO date)"
  },
  "message": "Habit marked as completed"
}
```

#### Toggle Completion

```http
POST /completions/toggle
```

**Request Body:**

```json
{
  "habitId": "string",
  "date": "string (ISO date)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "string (ISO date)",
    "completed": boolean,
    "completedAt": "string (ISO date)"
  },
  "message": "Completion toggled successfully"
}
```

#### Update Completion

```http
PUT /completions/:id
```

**Request Body:**

```json
{
  "completed": boolean,
  "value": number
}
```

**Response:**

````json
{
  "success": true,
  "data": {
    "id": "string",
    "habitId": "string",
    "date": "string (ISO date)",
    "completed": boolean,
    "value": number,
    "completedAt": "string (ISO date)"
  },
  "message": "Completion updated successfully"
}


#### Delete Completion

```http
DELETE /completions/:habitId/:date
````

**Response:**

```json
{
  "success": true,
  "message": "Completion deleted successfully"
}
```

### 3. Analytics (`/analytics`)

#### Get Overall Analytics

```http
GET /analytics/overview
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalHabits": number,
    "activeHabitsCount": number,
    "completedToday": number,
    "mostConsistentHabits": [
      {
        "habitId": "string",
        "habitName": "string",
        "successRate": number,
        "currentStreak": number,
        "bestStreak": number
      }
    ],
    "longestStreakHabit": {
      "habitName": "string",
      "bestStreak": number
    },
    "last30DaysSuccessRate": number,
    "bestDayOfWeek": {
      "dayOfWeek": number,
      "dayName": "string",
      "successRate": number,
      "totalCompletions": number
    },
    "dayOfWeekStats": [
      {
        "dayOfWeek": number,
        "dayName": "string",
        "successRate": number,
        "totalCompletions": number
      }
    ]
  }
}
```

#### Get Habit Analytics

```http
GET /analytics/habits/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "habitId": "string",
    "habitName": "string",
    "successRate": number,
    "currentStreak": number,
    "bestStreak": number,
    "completionHistory": [
      {
        "date": "string (ISO date)",
        "completed": boolean
      }
    ]
  }
}
```

#### Get Daily Analytics

```http
GET /analytics/daily/:date
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "string (ISO date)",
    "totalHabits": number,
    "completedHabits": number,
    "completionRate": number,
    "habits": [
      {
        "habitId": "string",
        "habitName": "string",
        "completed": boolean,
        "value": number
      }
    ]
  }
}
```

#### Get Weekly Analytics

```http
GET /analytics/weekly/:startDate
```

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "string (ISO date)",
    "endDate": "string (ISO date)",
    "totalHabits": number,
    "completionRate": number,
    "dailyStats": [
      {
        "date": "string (ISO date)",
        "completedHabits": number,
        "completionRate": number
      }
    ]
  }
}
```

#### Get Monthly Analytics

```http
GET /analytics/monthly/:year/:month
```

**Response:**

```json
{
  "success": true,
  "data": {
    "year": number,
    "month": number,
    "totalHabits": number,
    "completionRate": number,
    "dailyStats": [
      {
        "date": "string (ISO date)",
        "completedHabits": number,
        "completionRate": number
      }
    ]
  }
}
```

#### Get Quarter Analytics

```http
GET /analytics/quarter/:startDate
```

**Parameters:**

- `startDate`: The start date in YYYY-MM-DD format for the 91-day quarter period

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "string (ISO date)",
    "endDate": "string (ISO date)",
    "totalDays": 91,
    "dailyData": [
      {
        "date": "string (ISO date)",
        "completionRate": number
      }
    ]
  }
}
```

**Note:** Returns exactly 91 objects representing each day in the quarter period, with completion rates calculated as a percentage (0-100) rounded to 2 decimal places. If no completions exist for a day, the completion rate will be 0.

### 4. Records (`/records`)

#### Get Daily Records

```http
GET /records/daily/:date
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "string (ISO date)",
    "records": [
      {
        "id": "string",
        "habitId": "string",
        "date": "string (ISO date)",
        "completed": boolean,
        "completedAt": "string (ISO date)",
        "habitName": "string",
        "habitTag": "string",
        "goalType": "string",
        "goalValue": number,
        "value": number
      }
    ],
    "stats": {
      "totalHabits": number,
      "completedHabits": number,
      "completionRate": number
    }
  }
}
```

#### Get Weekly Records

```http
GET /records/weekly/:startDate
```

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "string (ISO date)",
    "endDate": "string (ISO date)",
    "records": [
      {
        "date": "string (ISO date)",
        "records": [
          {
            "id": "string",
            "habitId": "string",
            "date": "string (ISO date)",
            "completed": boolean,
            "completedAt": "string (ISO date)",
            "habitName": "string",
            "habitTag": "string",
            "goalType": "string",
            "goalValue": number,
            "value": number
          }
        ],
        "stats": {
          "totalHabits": number,
          "completedHabits": number,
          "completionRate": number
        }
      }
    ]
  }
}
```

#### Get Monthly Records

```http
GET /records/monthly/:year/:month
```

**Response:**

```json
{
  "success": true,
  "data": {
    "year": number,
    "month": number,
    "records": [
      {
        "date": "string (ISO date)",
        "records": [
          {
            "id": "string",
            "habitId": "string",
            "date": "string (ISO date)",
            "completed": boolean,
            "completedAt": "string (ISO date)",
            "habitName": "string",
            "habitTag": "string",
            "goalType": "string",
            "goalValue": number,
            "value": number
          }
        ],
        "stats": {
          "totalHabits": number,
          "completedHabits": number,
          "completionRate": number
        }
      }
    ]
  }
}
```

### 5. Notes Management (`/notes`)

#### Get All Notes

```http
GET /notes
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "date": "string (ISO date)",
      "content": "string",
      "mood": "string",
      "productivityLevel": "string",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  ]
}
```

#### Get Note by Date

```http
GET /notes/:date
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "date": "string (ISO date)",
    "content": "string",
    "mood": "string",
    "productivityLevel": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

#### Create Note

```http
POST /notes
```

**Request Body:**

```json
{
  "date": "string (ISO date)",
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
    "date": "string (ISO date)",
    "content": "string",
    "mood": "string",
    "productivityLevel": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  },
  "message": "Note created successfully"
}
```

#### Update Note

```http
PUT /notes/:id
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
    "date": "string (ISO date)",
    "content": "string",
    "mood": "string",
    "productivityLevel": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  },
  "message": "Note updated successfully"
}
```

#### Delete Note

```http
DELETE /notes/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

### 6. Notes Analytics (`/notes/analytics`)

#### Get Notes Analytics Overview

```http
GET /notes/analytics/overview
```

**Query Parameters:**

- `startDate` (optional): Start date for analytics (ISO date string)
- `endDate` (optional): End date for analytics (ISO date string)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalNotes": number,
    "dateRange": {
      "start": "string (ISO date)",
      "end": "string (ISO date)"
    },
    "moodDistribution": {
      "happy": number,
      "neutral": number,
      "sad": number,
      "anxious": number,
      "excited": number
    },
    "productivityDistribution": {
      "very_low": number,
      "low": number,
      "medium": number,
      "high": number,
      "very_high": number
    },
    "trendsOverTime": [
      {
        "date": "string (ISO date)",
        "noteCount": number,
        "avgMoodScore": number,
        "avgProductivityScore": number
      }
    ],
    "insights": [
      "string"
    ]
  }
}
```

#### Get Mood Trends

```http
GET /notes/analytics/mood-trends
```

**Query Parameters:**

- `startDate` (optional): Start date for analytics (ISO date string)
- `endDate` (optional): End date for analytics (ISO date string)
- `period` (optional): Grouping period - "day", "week", "month" (default: "day")

**Response:**

```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "string",
        "averageMoodScore": number,
        "moodDistribution": {
          "happy": number,
          "neutral": number,
          "sad": number,
          "anxious": number,
          "excited": number
        }
      }
    ],
    "overallTrend": "improving" | "declining" | "stable",
    "insights": [
      "string"
    ]
  }
}
```

#### Get Productivity Correlation

```http
GET /notes/analytics/productivity-correlation
```

**Query Parameters:**

- `startDate` (optional): Start date for analytics (ISO date string)
- `endDate` (optional): End date for analytics (ISO date string)

**Response:**

```json
{
  "success": true,
  "data": {
    "correlations": [
      {
        "habitId": "string",
        "habitName": "string",
        "correlationScore": number,
        "significance": "high" | "medium" | "low"
      }
    ],
    "productivityTrends": [
      {
        "date": "string (ISO date)",
        "averageProductivity": number,
        "completedHabits": number
      }
    ],
    "insights": [
      "string"
    ]
  }
}
```

#### Get Notes Calendar

```http
GET /notes/calendar/:year/:month
```

**Response:**

```json
{
  "success": true,
  "data": {
    "year": number,
    "month": number,
    "notes": [
      {
        "date": "string (ISO date)",
        "hasNote": boolean,
        "mood": "string",
        "productivityLevel": "string",
        "notePreview": "string"
      }
    ]
  }
}
```

### 7. Settings Management (`/settings`)

#### Get Settings

```http
GET /settings
```

**Response:**

```json
{
  "success": true,
  "data": {
  }
}
```

#### Update Settings

```http
PUT /settings
```

**Request Body:**

```json
{
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    // settings fields here
  },
  "message": "Settings updated successfully"
}
```

### 8. Options Management (`/options`)

#### Get Moods

```http
GET /options/moods
```

**Response:**

```json
{
  "success": true,
  "data": ["string"]
}
```

#### Add Mood

```http
POST /options/moods
```

**Request Body:**

```json
{
  "mood": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Mood added successfully"
}
```

#### Remove Mood

```http
DELETE /options/moods/:mood
```

**Response:**

```json
{
  "success": true,
  "message": "Mood removed successfully"
}
```

#### Get Productivity Levels

```http
GET /options/productivity-levels
```

**Response:**

```json
{
  "success": true,
  "data": ["string"]
}
```

#### Add Productivity Level

```http
POST /options/productivity-levels
```

**Request Body:**

```json
{
  "level": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Productivity level added successfully"
}
```

#### Remove Productivity Level

```http
DELETE /options/productivity-levels/:level
```

**Response:**

```json
{
  "success": true,
  "message": "Productivity level removed successfully"
}
```

### 10. Tags Management (`/tags`)

#### Get All Tags

```http
GET /tags
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "color": "string (hex color code)"
    }
  ]
}
```

#### Get Single Tag

```http
GET /tags/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "color": "string (hex color code)"
  }
}
```

#### Create Tag

```http
POST /tags
```

**Request Body:**

```json
{
  "name": "string",
  "color": "string (hex color code)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "color": "string (hex color code)"
  },
  "message": "Tag created successfully"
}
```

#### Update Tag

```http
PUT /tags/:id
```

**Request Body:**

```json
{
  "name": "string",
  "color": "string (hex color code)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "color": "string (hex color code)"
  },
  "message": "Tag updated successfully"
}
```

#### Delete Tag

```http
DELETE /tags/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

### 11. Note Templates Management (`/templates`)

#### Get All Templates

```http
GET /templates
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "template": "string",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  ]
}
```

#### Get Template By ID

```http
GET /templates/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "template": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

#### Create Template

```http
POST /templates
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
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  },
  "message": "Template created successfully"
}
```

#### Update Template

```http
PUT /templates/:id
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
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  },
  "message": "Template updated successfully"
}
```

#### Delete Template

```http
DELETE /templates/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Best Practices

1. **Error Handling**

   - Always check the `success` field in responses
   - Handle all possible error cases
   - Display user-friendly error messages

2. **Data Validation**

   - Validate all user input before sending to the API
   - Handle validation errors gracefully
   - Show appropriate error messages for invalid data

3. **Performance**

   - Implement pagination for large data sets
   - Use appropriate loading states
   - Optimize API calls to minimize network requests

4. **Security**
   - Sanitize all user input
   - Implement proper error handling
   - Don't expose sensitive information in error messages

## Rate Limiting

Currently, there are no rate limits implemented on the API endpoints. However, it's recommended to implement reasonable throttling on the client side to prevent excessive API calls.

## Versioning

The API is currently at version 1. Any future breaking changes will be released as new versions with appropriate versioning in the URL path.
