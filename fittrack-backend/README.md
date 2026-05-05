# FitTrack Backend

Express + MongoDB backend for FitTrack. Drop-in replacement for Strapi — all API endpoints match exactly.

## Setup

```bash
cd fittrack-backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `1337` — matches your old Strapi port) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:5173`) |
| `ANTHROPIC_API_KEY` | For AI Food Snap image analysis |

## Frontend Change

In your frontend, update `configs/api.ts` — change the env variable name if needed:

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL  // point to this backend
});
```

In your `.env` (frontend):
```
VITE_API_URL=http://localhost:1337
```

## API Endpoints

### Auth
| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/auth/local/register` | `{ username, email, password }` | Sign up |
| POST | `/api/auth/local` | `{ identifier, password }` | Login |

Both return: `{ jwt, user: { id, username, email, age, weight, height, goal, ... } }`

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | ✅ | Get current user |
| PUT | `/api/users/:id` | ✅ | Update profile / onboarding |

### Food Logs
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/food-logs` | ✅ | Get all food logs for user |
| POST | `/api/food-logs` | ✅ | Create entry `{ data: { name, calories, mealType } }` |
| DELETE | `/api/food-logs/:documentId` | ✅ | Delete entry |

### Activity Logs
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/activity-logs` | ✅ | Get all activity logs for user |
| POST | `/api/activity-logs` | ✅ | Create entry `{ data: { name, duration, calories } }` |
| DELETE | `/api/activity-logs/:documentId` | ✅ | Delete entry |

### Image Analysis
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/image-analysis` | ✅ | Upload food image → `{ result: { name, calories } }` |

## Project Structure

```
fittrack-backend/
├── config/
│   └── db.js              # MongoDB connection
├── src/
│   ├── index.js            # Entry point
│   ├── middleware/
│   │   └── auth.js         # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── FoodLog.js
│   │   └── ActivityLog.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── foodLogs.js
│       ├── activityLogs.js
│       └── imageAnalysis.js
├── .env.example
└── package.json
```
