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


def _delete_photo(photo_url: str):
    """Delete photo from Cloudinary or local disk."""
    if not photo_url:
        return
    if photo_url.startswith("http") and os.getenv("CLOUDINARY_CLOUD_NAME"):
        try:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
                api_key=os.getenv("CLOUDINARY_API_KEY"),
                api_secret=os.getenv("CLOUDINARY_API_SECRET"),
                secure=True,
            )
            parts = photo_url.split("/upload/")
            if len(parts) >= 2:
                after = parts[1]
                if after.startswith("v") and "/" in after:
                    after = after.split("/", 1)[1]
                public_id = after.rsplit(".", 1)[0]
                cloudinary.uploader.destroy(public_id)
        except Exception:
            pass
    else:
        filepath = photo_url.replace("/static/", "static/")
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass


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
    if getattr(msg, 'photo_url', None):
        _delete_photo(msg.photo_url)
    db.delete(msg)
    db.commit()
    return {"ok": True, "id": msg_id}