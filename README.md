<p align="center">
  <img src="./frontend/src/images/SwiftChat.png" width="80" alt="SwiftChat logo" />
</p>

<h1 align="center">SwiftChat</h1>

<p align="center">
  Real-time private messaging — fast, simple, instant
</p>

<p align="center">
  <a href="https://swiftchat-seven.vercel.app">🔗 Live Demo</a> &nbsp;·&nbsp;
  <a href="#getting-started">Getting Started</a> &nbsp;·&nbsp;
  <a href="#api-routes">API Routes</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Socket.IO-4-black?logo=socket.io" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---


## Features

- **Real-time messaging** — instant private messages via Socket.IO WebSockets
- **Typing indicators** — see when the other person is typing in real time
- **Read receipts** — single tick ✓ (sent) and double tick ✓✓ (read) on every message
- **Unread badge counts** — red badge on sidebar for messages in inactive conversations
- **Online presence** — live online/offline status with last seen timestamps
- **User search** — search all registered users by name or username
- **Group chat rooms** — create rooms, join/leave, real-time group messaging
- **Room discovery** — My Rooms / Discover tabs to browse and join public rooms
- **Persistent history** — all messages saved to MongoDB, loaded on conversation open
- **Message TTL** — messages auto-deleted after 20 days
- **JWT authentication** — secure login with access + refresh token rotation
- **Rate limiting** — brute force protection on auth routes
- **Security headers** — helmet.js HTTP security headers
- **Protected routes** — unauthenticated users are redirected to login
- **Settings** — update profile details and change password

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, React Router, Socket.IO client |
| Backend | Node.js, Express 5, Socket.IO, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (access + refresh tokens), localStorage persistence |
| Security | helmet.js, express-rate-limit |
| Dev | Vite, Nodemon |

---

## Project structure

```
swiftchat/
├── backend/
│   └── src/
│       ├── controllers/     # user, message, room handlers
│       ├── db/              # MongoDB connection
│       ├── middlewares/     # JWT auth middleware
│       ├── models/          # User, Message, Room, RoomMessage schemas
│       ├── routes/          # Express routers
│       ├── socket/          # Socket.IO server + all event handlers
│       ├── utils/           # ApiError, ApiResponse, asyncHandler
│       ├── app.js           # Express app setup, CORS, rate limiting
│       └── server.js        # Entry point
└── frontend/
    └── src/
        ├── components/      # Sidebar, ConversationList, RoomList, RoomChat
        ├── context/         # AuthProvider, ModeContext, useAuth
        ├── pages/           # Chat, Settings, Login, Register
        ├── services/        # Axios API calls, token management
        └── socket/          # Socket.IO singleton
```

---

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)

---

### 1. Clone the repo

```bash
git clone https://github.com/Sanskar-Z/swiftchat.git
cd swiftchat
```

---

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```bash
cp .env.example .env
```

Fill in the values:

```env
PORT=8001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/swiftchat
ACCESS_TOKEN_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=<run the same command again for a different secret>
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Server runs at `http://localhost:8001`.

---

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

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

App runs at `http://localhost:5173`.

---

### 4. Open the app

Go to `http://localhost:5173`. Register two accounts in separate browser tabs to test real-time messaging between them.

---

## How it works

### Message flow

1. User types a message and hits send
2. Frontend emits a `private-message` socket event to the backend
3. Backend validates message length, saves to MongoDB, builds a payload with `_id` and timestamps
4. Backend emits `private-message` to the **receiver's** socket
5. Backend emits `message-sent` back to the **sender** (separate event — avoids duplicates)
6. Both sides append the message to local React state, deduplicated by `_id`

### Typing indicators

1. Sender emits `typing-start` on every keystroke
2. A 2-second debounce timer fires `typing-stop` after the user pauses
3. Backend relays the event to the receiver only — no DB involved
4. Receiver sees "typing…" in the chat header and sidebar, clears when stop fires

### Read receipts

1. Every message is saved with `read: false`
2. When a conversation is opened, receiver emits `message-read` to the backend
3. Backend marks all unread messages as `read: true` in MongoDB
4. Backend emits `messages-read` to the original sender
5. Sender's message bubbles update from ✓ to ✓✓ in real time

### Group rooms

1. Users browse all rooms in the Discover tab and click Join
2. Backend adds them to the room's members array
3. When a room is opened, frontend emits `join-room` — Socket.IO adds the socket to that room
4. Messages are broadcast to all sockets in the room via `io.to(roomId).emit(...)`
5. On leave, backend removes the member and socket leaves the room

### Authentication

1. Login returns an access token and refresh token as httpOnly cookies
2. Access token is also stored in `localStorage` for cross-origin requests
3. Every API request sends the token in the `Authorization: Bearer` header
4. `AuthProvider` checks for a current user on mount — refreshes automatically on expiry
5. On logout, localStorage is cleared and the socket disconnects

### Security

- **helmet.js** — sets 11 HTTP security headers on every response
- **express-rate-limit** — 10 requests / 15 min on `/login` and `/register` to prevent brute force
- **API rate limit** — 100 requests / min on messages and rooms routes
- **Message length validation** — enforced on both frontend (`MAX_LENGTH = 500`) and backend socket handler

---

## API routes

### Auth — `/api/v1/users`

| Method | Route | Auth | Rate limit | Description |
|---|---|---|---|---|
| POST | `/register` | No | 10/15min | Create a new account |
| POST | `/login` | No | 10/15min | Login and receive tokens |
| POST | `/logout` | Yes | — | Logout and clear cookies |
| POST | `/refresh-token` | No | — | Refresh access token |
| GET | `/current-user` | Yes | — | Get the logged-in user |
| GET | `/` | Yes | — | Get all users |
| PATCH | `/update-user` | Yes | — | Update profile details |
| PATCH | `/update-password` | Yes | — | Change password |

### Messages — `/api/v1/messages`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/:userId` | Yes | Fetch DM history with a user |

### Rooms — `/api/v1/rooms`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/create` | Yes | Create a new room |
| GET | `/` | Yes | Get all rooms |
| POST | `/:roomId/join` | Yes | Join a room |
| POST | `/:roomId/leave` | Yes | Leave a room |
| GET | `/:roomId/messages` | Yes | Fetch room message history |

### Socket.IO events

| Event | Direction | Description |
|---|---|---|
| `private-message` | client → server → receiver | Send a DM |
| `message-sent` | server → sender | DM delivery acknowledgement |
| `message-read` | client → server | Mark messages as read |
| `messages-read` | server → sender | Notify sender of read |
| `typing-start` | client → server → receiver | Started typing |
| `typing-stop` | client → server → receiver | Stopped typing |
| `join-room` | client → server | Join a Socket.IO room |
| `leave-room` | client → server | Leave a Socket.IO room |
| `room-message` | client → server → room | Send a group message |
| `online-users` | server → all | Updated online users list |

---

## Environment variables

### Backend

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default: 8001) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ACCESS_TOKEN_SECRET` | Secret for signing access JWTs |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry e.g. `15m` |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh JWTs |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry e.g. `7d` |
| `CORS_ORIGIN` | Frontend origin allowed by CORS |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API base URL |
| `VITE_SOCKET_URL` | Backend Socket.IO server URL |

---

## Author

**Sanskar Zine** — [github.com/Sanskar-Z](https://github.com/Sanskar-Z)

---

## License

MIT — free to use, modify, and distribute.