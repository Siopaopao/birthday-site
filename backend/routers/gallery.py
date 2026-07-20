from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from typing import List, Optional
from datetime import datetime
import os, uuid, aiofiles

from database import get_db, Base, engine
from pydantic import BaseModel

router = APIRouter(prefix="/gallery", tags=["gallery"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


# ── Model ─────────────────────────────────────────────────────────────────────
class GalleryPhoto(Base):
    __tablename__ = "gallery_photos"
    id          = Column(Integer, primary_key=True, index=True)
    sender_name = Column(String(100), nullable=False)
    caption     = Column(String(300), nullable=True)
    photo_url   = Column(String(500), nullable=False)
    approved    = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)


# Create table if it doesn't exist
Base.metadata.create_all(bind=engine)


# ── Schema ────────────────────────────────────────────────────────────────────
class PhotoOut(BaseModel):
    id: int
    sender_name: str
    caption: Optional[str]
    photo_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("", status_code=201)
async def submit_photo(
    sender_name: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if photo.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, GIF, or WebP images are allowed")

    contents = await photo.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(400, "Image must be under 10 MB")

    ext = photo.filename.rsplit(".", 1)[-1].lower() if "." in photo.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(contents)

    db_photo = GalleryPhoto(
        sender_name=sender_name.strip() if sender_name else "",
        caption=caption.strip() if caption and caption.strip() else None,
        photo_url=f"/static/uploads/{filename}",
        approved=False,
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)

    return {"id": db_photo.id, "message": "Photo submitted! It will appear after approval 📸"}


@router.get("", response_model=List[PhotoOut])
def get_approved_photos(db: Session = Depends(get_db)):
    return (
        db.query(GalleryPhoto)
        .filter(GalleryPhoto.approved == True)
        .order_by(GalleryPhoto.created_at.desc())
        .all()
    )


# ── Admin routes ──────────────────────────────────────────────────────────────
@router.get("/admin/all")
def list_all_photos(
    x_admin_password: Optional[str] = None,
    db: Session = Depends(get_db),
):
    from fastapi import Header
    return db.query(GalleryPhoto).order_by(GalleryPhoto.created_at.desc()).all()


@router.patch("/admin/{photo_id}/approve")
def approve_photo(
    photo_id: int,
    db: Session = Depends(get_db),
):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Photo not found")
    photo.approved = True
    db.commit()
    return {"ok": True}


@router.delete("/admin/{photo_id}")
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Photo not found")
    # Delete file from disk
    filepath = photo.photo_url.replace("/static/", "static/")
    if os.path.exists(filepath):
        os.remove(filepath)
    db.delete(photo)
    db.commit()
    return {"ok": True}