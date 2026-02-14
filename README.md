# QuickTask

A personal task management application built with the MERN stack and a Python analytics microservice.


https://github.com/user-attachments/assets/11a9e346-c8b5-468a-b459-229c8b1785b0




## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite, Tailwind CSS, Recharts) |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Authentication | JWT (JSON Web Tokens) |
| Analytics Service | Python (FastAPI) |
| API Calls | Axios |

## Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.9
- **MongoDB** running locally on `mongodb://localhost:27017` (or a remote URI)
- **npm** (comes with Node.js)

## Project Structure

```
QuickTask/
├── backend/            # Node.js + Express API
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers (tasks, auth, analytics)
│   ├── middleware/      # Auth & validation middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── app.js          # Express app module
│   ├── seed.js         # Database seed script
│   └── server.js       # Entry point
├── frontend/           # React application
│   └── src/
│       ├── components/  # Reusable components (Layout, TaskModal, ErrorBoundary)
│       ├── context/     # Auth & Theme contexts
│       ├── hooks/       # Custom hooks (useDebounce)
│       ├── pages/       # Page components
│       ├── api.js       # Axios instance
│       └── App.jsx      # Root component
├── analytics/          # Python FastAPI service
│   ├── main.py         # Analytics endpoints
│   └── requirements.txt
└── README.md
```

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd QuickTask
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Analytics Service Setup

```bash
cd analytics
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

> **Important:** Always activate the analytics virtual environment before running `python main.py`. If you see `ModuleNotFoundError`, ensure you are using the venv Python, not the system Python.

### 5. Seed Database (Optional)

```bash
cd backend
npm run seed
# Creates a demo user: demo@quicktask.com / demo123456
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/quicktask` |
| `JWT_SECRET` | Secret for JWT signing | (set your own) |

### Analytics (`analytics/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/quicktask` |
| `ANALYTICS_PORT` | Service port | `8000` |

### Frontend (`frontend/.env`) — optional in development

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (only if frontend deployed separately) | `/api` (Vite proxy) |

## Running the Application

Start all three services in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Analytics Service:**
```bash
cd analytics

# Windows — activate venv first
venv\Scripts\activate
python main.py

# macOS/Linux
# source venv/bin/activate && python main.py

# Runs on http://localhost:8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

## API Documentation

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

#### POST /api/auth/register
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Task Endpoints

All task endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (supports query params) |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tasks/dashboard` | Get dashboard statistics |

#### Query Parameters for GET /api/tasks

| Param | Description | Example |
|-------|-------------|---------|
| `status` | Filter by status | `Todo`, `In Progress`, `Completed` |
| `priority` | Filter by priority | `Low`, `Medium`, `High` |
| `search` | Search by title | `deploy` |
| `sortBy` | Sort field | `createdAt`, `dueDate`, `priority` |
| `order` | Sort order | `asc`, `desc` |

#### POST /api/tasks
```json
{
  "title": "Build dashboard",
  "description": "Create analytics dashboard UI",
  "priority": "High",
  "status": "Todo",
  "dueDate": "2026-02-20T00:00:00.000Z"
}
```

### Analytics Endpoints

All analytics endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/health` | Health check |
| GET | `/api/analytics/user-stats/:userId` | User aggregate statistics |
| GET | `/api/analytics/productivity/:userId?days=30` | Productivity trends |

#### GET /api/analytics/user-stats/:userId

Returns total tasks, completion rate, priority/status distribution, overdue count.

#### GET /api/analytics/productivity/:userId?days=30

Returns daily task creation and completion data for the specified period.

## Database Schema

### User
| Field | Type | Required |
|-------|------|----------|
| name | String | Yes |
| email | String (unique) | Yes |
| password | String (hashed) | Yes |
| timestamps | auto | - |

### Task
| Field | Type | Required |
|-------|------|----------|
| title | String | Yes |
| description | String | No |
| priority | Enum: Low, Medium, High | Yes (default: Medium) |
| status | Enum: Todo, In Progress, Completed | Yes (default: Todo) |
| dueDate | Date | Yes |
| user | ObjectId (ref: User) | Yes |
| timestamps | auto | - |

## Features

- User registration and login with JWT authentication
- Full CRUD operations for tasks
- Filter tasks by status and priority
- Search tasks by title (debounced for performance)
- Sort tasks by due date, priority, or creation date
- Dashboard with task statistics and charts (completed vs pending)
- Completion rate progress bar
- Priority distribution (pie chart) and status distribution (bar chart)
- Overdue task warnings (red border + label)
- Due-soon warnings for tasks due within 24 hours
- Export tasks to CSV
- Python analytics service with user stats and productivity trends
- Node.js analytics endpoints (mirrors Python logic)
- Dark mode toggle with localStorage persistence and system preference detection
- Mobile-responsive layout with hamburger menu
- Error boundary for graceful crash recovery
- React code splitting for optimized bundle size
- Production-ready API configuration via environment variables
- Proper 404 page for unmatched routes
- Responsive, minimal design

## Screenshots

<img width="1206" height="626" alt="Screenshot 2026-02-14 061056" src="https://github.com/user-attachments/assets/e9b2d1e7-320c-4c5a-b408-0d209803e3c7" />

<img width="1253" height="892" alt="Screenshot 2026-02-14 061044" src="https://github.com/user-attachments/assets/24983f4b-6817-4f73-a55c-412ccb8315eb" />

## Known Limitations

- The analytics service (Python FastAPI or Node.js mirror) must be running for dashboard productivity charts to appear
- No password reset functionality
- No real-time updates (requires page refresh for changes from other sessions)
