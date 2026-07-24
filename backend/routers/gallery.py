from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from typing import List, Optional
from datetime import datetime
import os, uuid, aiofiles

from database import get_db, Base, engine
from pydantic import BaseModel

router = APIRouter(prefix="/gallery", tags=["gallery"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB

# Try to use Cloudinary if configured, fall back to local storage
def _has_cloudinary():
    return bool(
        os.getenv("CLOUDINARY_CLOUD_NAME") and
        os.getenv("CLOUDINARY_API_KEY") and
        os.getenv("CLOUDINARY_API_SECRET")
    )

async def _upload(file: UploadFile, folder: str) -> str:
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(400, "Image must be under 10 MB")
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, GIF, or WebP images are allowed")

    if _has_cloudinary():
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key=os.getenv("CLOUDINARY_API_KEY"),
            api_secret=os.getenv("CLOUDINARY_API_SECRET"),
            secure=True,
        )
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="image",
            transformation=[{"quality": "auto", "fetch_format": "auto"}],
        )
        return result["secure_url"]
    else:
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(contents)
        return f"/static/uploads/{filename}"


def _delete(photo_url: str):
    if not photo_url:
        return
    if _has_cloudinary() and photo_url.startswith("http"):
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


class PhotoAdminOut(BaseModel):
    id: int
    sender_name: str
    caption: Optional[str]
    photo_url: str
    approved: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Public routes ─────────────────────────────────────────────────────────────
@router.post("", status_code=201)
async def submit_photo(
    sender_name: str = Form(...),
    caption: Optional[str] = Form(None),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not sender_name.strip():
        raise HTTPException(400, "Name is required")

    photo_url = await _upload(photo, folder="birthday-site/gallery")

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


# ── Admin routes ──────────────────────────────────────────────────────────────
@router.get("/admin/all", response_model=List[PhotoAdminOut])
def list_all_photos(
    x_admin_password: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(401, "Unauthorized")
    return db.query(GalleryPhoto).order_by(GalleryPhoto.created_at.desc()).all()


@router.patch("/admin/{photo_id}/approve")
def approve_photo(
    photo_id: int,
    x_admin_password: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(401, "Unauthorized")
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Photo not found")
    photo.approved = True
    db.commit()
    return {"ok": True}


@router.delete("/admin/{photo_id}")
def delete_photo(
    photo_id: int,
    x_admin_password: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(401, "Unauthorized")
    photo = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Photo not found")
    _delete(photo.photo_url)
    db.delete(photo)
    db.commit()
    return {"ok": True}