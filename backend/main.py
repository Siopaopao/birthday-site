from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

load_dotenv()

import pymysql
pymysql.install_as_MySQLdb()

from database import engine, SessionLocal, create_tables, seed_data, WallMessage
from routers import messages, private, admin
from routers.gallery import router as gallery_router
from ws_manager import manager

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Birthday Site API", version="1.0.0")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(messages.router)
app.include_router(private.router)
app.include_router(admin.router)
app.include_router(gallery_router)


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    create_tables()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


# ── WebSocket ─────────────────────────────────────────────────────────────────
@app.websocket("/ws/wall")
async def wall_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Admin approve + broadcast ─────────────────────────────────────────────────
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.patch("/admin/messages/{msg_id}/approve-and-broadcast")
async def approve_and_broadcast(
    msg_id: int,
    x_admin_password: str = Header(None),
    db: Session = Depends(get_db),
):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(401, "Unauthorized")
    msg = db.query(WallMessage).filter(WallMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(404, "Message not found")
    msg.approved = True
    db.commit()
    db.refresh(msg)

    await manager.broadcast({
        "type": "new_message",
        "data": {
            "id": msg.id,
            "sender_name": msg.sender_name,
            "relationship": msg.relationship,
            "message": msg.message,
            "photo_url": msg.photo_url,
            "color": msg.color,
            "created_at": msg.created_at.isoformat(),
        },
    })
    return {"ok": True}