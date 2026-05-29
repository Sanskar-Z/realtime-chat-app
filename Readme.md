# Realtime Chat App

A full-stack real-time private messaging app built with React, Node.js, Socket.IO, and MongoDB. Users can register, log in, see who is online, and exchange private messages that are persisted to the database.

---

## Features

- **Real-time messaging** — instant private messages via Socket.IO WebSockets
- **Online presence** — live online/offline status with last seen timestamps
- **User search** — search all registered users by name or username
- **Persistent history** — all messages saved to MongoDB, loaded on conversation open
- **JWT authentication** — secure login with access + refresh token rotation via httpOnly cookies
- **Protected routes** — unauthenticated users are redirected to login
- **Settings** — update profile details and change password

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, React Router, Socket.IO client |
| Backend | Node.js, Express 5, Socket.IO, Mongoose |
| Database | MongoDB (Atlas or local) |
| Auth | JWT (access + refresh tokens), bcrypt, httpOnly cookies |
| Dev | Vite, Nodemon |

---

## Project structure

```
realtime-chat-app/
├── backend/
│   └── src/
│       ├── controllers/     # request handlers
│       ├── db/              # MongoDB connection
│       ├── middlewares/     # JWT auth middleware
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── socket/          # Socket.IO server
│       ├── utils/           # ApiError, ApiResponse, asyncHandler
│       ├── app.js           # Express app setup
│       └── server.js        # Entry point
└── frontend/
    └── src/
        ├── components/      # Sidebar, ConversationList
        ├── context/         # AuthProvider, useAuth
        ├── pages/           # Chat, Settings, Login, Register
        ├── services/        # Axios API calls
        └── socket/          # Socket.IO singleton
```

---

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier) or MongoDB running locally

---

### 1. Clone the repo

```bash
git clone https://github.com/Sanskar-Z/realtime-chat-app.git
cd realtime-chat-app
```

---

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Fill in the values in `.env`:

```env
PORT=8001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/realtime-chat-app
ACCESS_TOKEN_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=<generate a different secret the same way>
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The server runs at `http://localhost:8001`.

---

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```bash
cp .env.example .env
```

Fill in the values:

```env
VITE_API_URL=http://localhost:8001/api/v1
VITE_SOCKET_URL=http://localhost:8001
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

### 4. Open the app

Go to `http://localhost:5173` in your browser. Register two accounts in separate tabs to test real-time messaging between them.

---

## How it works

### Message flow

1. User types a message and hits send
2. Frontend emits a `private-message` socket event to the backend
3. Backend saves the message to MongoDB, builds a payload with `_id` and timestamps
4. Backend emits `private-message` to the **receiver's** socket
5. Backend emits `message-sent` back to the **sender** (separate event to avoid duplicates)
6. Both sides append the message to local React state, deduplicated by `_id`

### Authentication flow

1. Login returns an access token (15 min) and refresh token (7 days) as httpOnly cookies
2. `AuthProvider` checks for a current user on mount via `GET /api/v1/users/current-user`
3. If the access token is expired, `refreshAccessToken` is called automatically
4. On logout, both cookies are cleared and the socket disconnects

### Online presence

- Socket.IO auth middleware reads `userId` and `username` from the handshake on connect
- A server-side `Map` tracks `userId → { socketId, username }` for all connected users
- On disconnect, the user's `lastSeen` timestamp is saved to MongoDB
- `ConversationList` fetches all users via REST and merges live online status from socket events

---

## API routes

### Auth (`/api/v1/users`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create a new account |
| POST | `/login` | No | Login and get tokens |
| POST | `/logout` | Yes | Logout and clear cookies |
| POST | `/refresh-token` | No | Refresh access token |
| GET | `/current-user` | Yes | Get logged-in user |
| GET | `/` | Yes | Get all users |
| PATCH | `/update-user` | Yes | Update profile details |
| PATCH | `/update-password` | Yes | Change password |

### Messages (`/api/v1/messages`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/:userId` | Yes | Fetch message history with a user |

---

## Environment variables reference

### Backend

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default: 8001) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Secret for signing access JWTs |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry (e.g. `15m`) |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh JWTs |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry (e.g. `7d`) |
| `CORS_ORIGIN` | Frontend origin allowed by CORS |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API base URL |
| `VITE_SOCKET_URL` | Backend Socket.IO server URL |

---
