# Learn Module API Documentation

## Base URL

```
/api/learn
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Add New Word

Add a new word to user's vocabulary.

**Endpoint:** `POST /words`

**Request Body:**

```json
{
    "word": "string (required)",
    "description": "string (optional)",
    "note": "string (optional)",
    "ai_content": "string (optional)"
}
```

**Success Response (201):**

```json
{
    "status": 201,
    "message": "Word added successfully",
    "data": {
        "id": 1,
        "user_id": 123,
        "word": "example",
        "description": "An example word",
        "note": "Personal note",
        "ai_content": "AI generated explanation",
        "created_at": "2026-02-06T10:30:00.000Z"
    }
}
```

**Error Response (400):**

```json
{
    "status": 400,
    "message": "Word is required",
    "data": null
}
```

---

### 2. Get Words (Paginated)

Retrieve user's vocabulary with pagination.

**Endpoint:** `GET /words`

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Number of words per page

**Example Request:**

```
GET /api/learn/words?page=1&limit=20
```

**Success Response (200):**

```json
{
    "status": 200,
    "message": "Words retrieved successfully",
    "data": [
        {
            "id": 1,
            "user_id": 123,
            "word": "example",
            "description": "An example word",
            "note": "Personal note",
            "ai_content": "AI generated explanation",
            "created_at": "2026-02-06T10:30:00.000Z"
        },
        {
            "id": 2,
            "user_id": 123,
            "word": "vocabulary",
            "description": "Collection of words",
            "note": "",
            "ai_content": "",
            "created_at": "2026-02-06T09:15:00.000Z"
        }
    ]
}
```

**Error Response (500):**

```json
{
    "status": 500,
    "message": "Internal server error",
    "data": null
}
```

---

### 3. Remove Word

Delete a specific word from vocabulary.

**Endpoint:** `DELETE /words/:wordId`

**URL Parameters:**

- `wordId` (required) - ID of the word to remove

**Example Request:**

```
DELETE /api/learn/words/123
```

**Success Response (200):**

```json
{
    "status": 200,
    "message": "Word removed successfully",
    "data": null
}
```

**Error Responses:**

Not Found (404):

```json
{
    "status": 404,
    "message": "Word not found",
    "data": null
}
```

Bad Request (400):

```json
{
    "status": 400,
    "message": "Word ID is required",
    "data": null
}
```

---

### 4. Update AI Content

Update the AI generated content for a specific word.

**Endpoint:** `PATCH /words/:wordId/ai-content`

**URL Parameters:**

- `wordId` (required) - ID of the word to update

**Request Body:**

```json
{
    "ai_content": "string"
}
```

**Example Request:**

```
PATCH /api/learn/words/123/ai-content
```

```json
{
    "ai_content": "Updated AI explanation for this word"
}
```

**Success Response (200):**

```json
{
    "status": 200,
    "message": "AI content updated successfully",
    "data": null
}
```

**Error Responses:**

Not Found (404):

```json
{
    "status": 404,
    "message": "Word not found",
    "data": null
}
```

Bad Request (400):

```json
{
    "status": 400,
    "message": "Word ID is required",
    "data": null
}
```

---

### 5. Get AI Content

Get AI generated content for a specific word (without authentication requirement on the word itself).

**Endpoint:** `GET /ai-content`

**Query Parameters:**

- `word` (required) - The word to get AI content for

**Example Request:**

```
GET /api/learn/ai-content?word=example
```

**Success Response (200):**

```json
{
    "status": 200,
    "message": "AI content retrieved successfully",
    "data": "AI generated content for the word 'example'"
}
```

**Error Response (400):**

```json
{
    "status": 400,
    "message": "Word is required",
    "data": null
}
```

---

### 6. Get Quiz

Get a quiz with a specified number of random words from user's vocabulary.

**Endpoint:** `GET /quiz`

**Query Parameters:**

- `count` (required) - Number of words to include in quiz (must be positive number)

**Example Request:**

```
GET /api/learn/quiz?count=10
```

**Success Response (200):**

```json
{
    "status": 200,
    "message": "Quiz data retrieved successfully",
    "data": [
        {
            "id": 5,
            "user_id": 123,
            "word": "vocabulary",
            "description": "Collection of words",
            "note": "Important for learning",
            "ai_content": "AI explanation",
            "created_at": "2026-02-06T10:30:00.000Z"
        },
        {
            "id": 4,
            "user_id": 123,
            "word": "example",
            "description": "Sample word",
            "note": "",
            "ai_content": "",
            "created_at": "2026-02-06T10:25:00.000Z"
        }
    ]
}
```

**Note:**

- If requested count exceeds available words, returns all available words
- Words are ordered by ID in descending order (newest first)
- Actual number of returned words may be less than requested count

**Error Response (400):**

```json
{
    "status": 400,
    "message": "Count must be a positive number",
    "data": null
}
```

---

### 7. Get Word Suggestions

Get word suggestions based on a keyword using external API.

**Endpoint:** `GET /suggestions`

**Query Parameters:**

- `keyword` (required) - The keyword to get suggestions for

**Example Request:**

```
GET /api/learn/suggestions?keyword=app
```

**Success Response (200):**

```json
{
    "status": 200,
    "message": "Suggested words retrieved successfully",
    "data": [
        {
            "word": "apple",
            "score": "11"
        },
        {
            "word": "application",
            "score": "23"
        },
        {
            "word": "apply",
            "score": "15"
        },
        {
            "word": "appreciate",
            "score": "18"
        }
    ]
}
```

**Note:**

- Returns a list of suggested words with relevance scores
- Higher score indicates more relevant suggestions
- Powered by external word suggestion API

**Error Response (400):**

```json
{
    "status": 400,
    "message": "Keyword is required",
    "data": null
}
```

---

## Common Error Responses

### 401 Unauthorized

When authentication token is missing or invalid:

```json
{
    "status": 401,
    "message": "Unauthorized",
    "data": null
}
```

### 500 Internal Server Error

When an unexpected server error occurs:

```json
{
    "status": 500,
    "message": "Internal server error",
    "data": null
}
```

---

## Data Types

### Word Object

```typescript
interface Word {
    id: number;
    user_id: number;
    word: string;
    description: string | null;
    note: string | null;
    ai_content: string | null;
    created_at: string; // ISO 8601 format
}
```

### Response Format

```typescript
interface ApiResponse<T> {
    status: number;
    message: string;
    data: T | null;
}
```

### Suggestion Object

```typescript
interface Suggestion {
    word: string;
    score: string;
}
```

---

## Usage Examples

### JavaScript/TypeScript (using Axios)

```javascript
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/learn";
const token = "your_jwt_token";

// Add a new word
async function addWord(word, description, note) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/words`,
            { word, description, note },
            { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log("Word added:", response.data);
    } catch (error) {
        console.error("Error:", error.response.data);
    }
}

// Get paginated words
async function getWords(page = 1, limit = 10) {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/words?page=${page}&limit=${limit}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log("Words:", response.data);
    } catch (error) {
        console.error("Error:", error.response.data);
    }
}

// Remove a word
async function removeWord(wordId) {
    try {
        const response = await axios.delete(`${API_BASE_URL}/words/${wordId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Word removed:", response.data);
    } catch (error) {
        console.error("Error:", error.response.data);
    }
}

// Get quiz
async function getQuiz(count) {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/quiz?count=${count}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log("Quiz data:", response.data);
    } catch (error) {
        console.error("Error:", error.response.data);
    }
}

// Get word suggestions
async function getSuggestions(keyword) {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/suggestions?keyword=${keyword}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log("Suggestions:", response.data);
    } catch (error) {
        console.error("Error:", error.response.data);
    }
}
```

### React Hook Example

```typescript
import { useState, useEffect } from "react";
import axios from "axios";

interface Word {
    id: number;
    word: string;
    description: string | null;
    note: string | null;
    ai_content: string | null;
    created_at: string;
}

const useWords = (page: number = 1, limit: number = 10) => {
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWords = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `/api/learn/words?page=${page}&limit=${limit}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    },
                );
                setWords(response.data.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchWords();
    }, [page, limit]);

    return { words, loading, error };
};

export default useWords;
```

---

## Notes for Frontend Developers

1. **Authentication**: Always include the JWT token in the Authorization header for all requests
2. **Error Handling**: Check the `status` field in responses to determine success/failure
3. **Pagination**: Use `page` and `limit` parameters to control data fetching for the word list
4. **Validation**: Validate required fields on the client side before sending requests
5. **Date Format**: All dates are returned in ISO 8601 format (can be parsed with `new Date()`)
6. **Quiz Count**: The quiz endpoint may return fewer words than requested if user doesn't have enough words
7. **Word ID**: When deleting or updating words, ensure the word belongs to the authenticated user
