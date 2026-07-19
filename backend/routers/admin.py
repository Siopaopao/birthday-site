from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from database import get_db, WallMessage
from schemas import WallMessageAdmin

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def require_admin(x_admin_password: Optional[str] = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(401, "Unauthorized")
    return True


@router.get("/messages", response_model=List[WallMessageAdmin])
def list_all_messages(
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    return db.query(WallMessage).order_by(WallMessage.created_at.desc()).all()


@router.patch("/messages/{msg_id}/approve")
def approve_message(
    msg_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    msg = db.query(WallMessage).filter(WallMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(404, "Message not found")
    msg.approved = True
    db.commit()
    return {"ok": True, "id": msg_id}


@router.patch("/messages/{msg_id}/reject")
def reject_message(
    msg_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(require_admin),
):
    msg = db.query(WallMessage).filter(WallMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(404, "Message not found")
    db.delete(msg)
    db.commit()
    return {"ok": True, "id": msg_id}
