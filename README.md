# 🎂 Diane's Birthday Website

A full-stack birthday website built with React, FastAPI, and MySQL.

## Features
- 💌 **Wall of Messages** — friends post wishes, you approve them, they appear live via WebSocket
- 📖 **Interactive Timeline** — scrollable story of your relationship with expandable cards
- 🎮 **"How Well Do You Know Her?" Quiz** — multiple choice with leaderboard
- 🎂 **Birthday Cake** — blow into your mic to extinguish candles + confetti
- 🔒 **Private Messages** — passcode-gated inbox only she can read
- 🎉 **Confetti burst** on first page load

---

## Project Structure

```
birthday-site/
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # SQLAlchemy models + seed data
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── ws_manager.py     # WebSocket connection manager
│   ├── routers/
│   │   ├── messages.py   # Wall messages CRUD
│   │   ├── timeline.py   # Timeline events
│   │   ├── quiz.py       # Quiz questions + scores
│   │   ├── private.py    # Private messages
│   │   └── admin.py      # Admin approval panel
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js          # Axios API client
│   │   ├── index.css       # Global styles + design tokens
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js     # Live wall updates
│   │   │   └── useAudioVolume.js   # Mic input for candles
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Toast.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── WallPage.jsx
│   │       ├── TimelinePage.jsx
│   │       ├── GamePage.jsx
│   │       ├── CakePage.jsx
│   │       ├── PrivatePage.jsx
│   │       └── AdminPage.jsx
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

---

## Quick Start (Local Development)

### Option A — Docker (easiest)

```bash
# 1. Clone / copy the project
cd birthday-site

# 2. Copy env file and edit your values
cp backend/.env.example backend/.env

# 3. Start everything
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Admin:    http://localhost:3000/admin
```

### Option B — Manual

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit .env
cp .env.example .env
# Edit DATABASE_URL, PRIVATE_PASSCODE, ADMIN_PASSWORD

# Run
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**MySQL:**  
Create a database named `birthday_db` and update `DATABASE_URL` in `.env`.  
Tables are created automatically on first startup. Seed data (quiz questions + timeline) is also inserted automatically.

---

## 🎨 Customization — Do This Before Launch!

### 1. Change her name everywhere
Search for "Diane" across all files and verify all references are updated.

### 2. Update the timeline (`backend/database.py`)
Edit the `seed_data()` function — change event dates, titles, and descriptions to match your real story.

### 3. Update quiz questions (`backend/database.py`)
Edit the quiz questions in `seed_data()` to match facts about her. The more personal, the better!

### 4. Change the private passcode
In `backend/.env`:
```
PRIVATE_PASSCODE=something_only_she_would_know
```
Tell her the passcode privately (not in the site!).

### 5. Change the admin password
```
ADMIN_PASSWORD=your_secure_password
```

### 6. Add real photos
- For timeline events: add `photo_url` to events in `seed_data()`, or upload files to `backend/static/uploads/` and reference them as `/static/uploads/filename.jpg`
- The wall supports photo uploads from friends automatically

### 7. Update birthday date
In `HomePage.jsx`, update the date displayed:
```jsx
<p>✨ JUNE 11TH ✨</p>
```

---

## 🔒 Admin Panel
Go to `/admin` to approve or reject wall messages before they appear publicly.  
Login with `ADMIN_PASSWORD` from your `.env`.

When you approve a message, it is immediately broadcast via WebSocket to anyone currently viewing the wall — it appears live without a refresh.

---

## 🚀 Deployment

### Railway (recommended — free tier)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a MySQL plugin → copy the `DATABASE_URL`
4. Set environment variables in Railway dashboard
5. Deploy backend service (set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`)
6. Deploy frontend as a static site (build command: `npm run build`, output: `dist`)
7. Set `CORS_ORIGINS` in backend to your frontend URL

### Render

Similar to Railway. Add a PostgreSQL or MySQL database, set env vars, deploy.

### Manual VPS

```bash
# On your server
docker compose up -d --build

# With a domain, add Caddy or nginx as reverse proxy
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET    | /messages | Get approved wall messages |
| POST   | /messages | Submit a new message (multipart) |
| GET    | /timeline | Get all timeline events |
| GET    | /quiz/questions | Get quiz questions |
| POST   | /quiz/check | Check an answer |
| POST   | /quiz/scores | Submit final score |
| GET    | /quiz/leaderboard | Get top 20 scores |
| POST   | /private | Send a private message |
| POST   | /private/unlock | Unlock private messages with passcode |
| GET    | /admin/messages | List all messages (auth required) |
| PATCH  | /admin/messages/{id}/approve | Approve a message |
| PATCH  | /admin/messages/{id}/approve-and-broadcast | Approve + WS broadcast |
| PATCH  | /admin/messages/{id}/reject | Delete a message |
| WS     | /ws/wall | WebSocket for live wall updates |

---

## Tips

- **Candle blowing** requires HTTPS in production for mic access (browsers block mic on HTTP)
- Test on mobile — she will likely open it on her phone first
- Share the link with friends a few days early so messages accumulate before the big day
- Keep the admin password secret and pre-approve a few heartfelt messages before she arrives

---

*Made with love 💖*
