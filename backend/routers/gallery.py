from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from typing import List, Optional
from datetime import datetime
import os

from database import get_db, Base, engine
from pydantic import BaseModel
from cloudinary_helper import upload_image, delete_image, get_public_id

router = APIRouter(prefix="/gallery", tags=["gallery"])

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


Base.metadata.create_all(bind=engine)


# ── Schema ─────────────────────────────────────────────────────────────────────
class PhotoOut(BaseModel):
    id: int
    sender_name: str
    caption: Optional[str]
    photo_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Routes ─────────────────────────────────────────────────────────────────────
@router.post("", status_code=201)
async def submit_photo(
    sender_name: str = Form(...),
    caption: Optional[str] = Form(None),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not sender_name.strip():
        raise HTTPException(400, "Name is required")

    try:
        photo_url = await upload_image(photo, folder="birthday-site/gallery")
    except ValueError as e:
        raise HTTPException(400, str(e))

    db_photo = GalleryPhoto(
        sender_name=sender_name.strip(),
        caption=caption.strip() if caption and caption.strip() else None,
        photo_url=photo_url,
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


# ── Admin ──────────────────────────────────────────────────────────────────────
@router.get("/admin/all")
def list_all_photos(db: Session = Depends(get_db)):
    return db.query(GalleryPhoto).order_by(GalleryPhoto.created_at.desc()).all()


@router.patch("/admin/{photo_id}/approve")
def approve_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Photo not found")
    photo.approved = True
    db.commit()
    return {"ok": True}


@router.delete("/admin/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Photo not found")
    # Delete from Cloudinary
    public_id = get_public_id(photo.photo_url)
    if public_id:
        delete_image(public_id)
    db.delete(photo)
    db.commit()
    return {"ok": True}