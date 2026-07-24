from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os, uuid, aiofiles

from database import get_db, WallMessage
from schemas import WallMessageCreate, WallMessageOut

router = APIRouter(prefix="/messages", tags=["messages"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


def _has_cloudinary():
    return bool(
        os.getenv("CLOUDINARY_CLOUD_NAME") and
        os.getenv("CLOUDINARY_API_KEY") and
        os.getenv("CLOUDINARY_API_SECRET")
    )


async def _upload(file: UploadFile) -> str:
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
            folder="birthday-site/wall",
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


@router.post("", status_code=201)
async def post_message(
    sender_name: str = Form(...),
    relationship: str = Form(...),
    message: str = Form(...),
    color: Optional[str] = Form("pink"),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    data = WallMessageCreate(
        sender_name=sender_name,
        relationship=relationship,
        message=message,
        color=color or "pink",
    )

    photo_url = None
    if photo and photo.filename:
        photo_url = await _upload(photo)

    db_msg = WallMessage(
        sender_name=data.sender_name,
        relationship=data.relationship,
        message=data.message,
        color=data.color,
        photo_url=photo_url,
        approved=False,
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return {"id": db_msg.id, "message": "Message submitted! It will appear after approval."}


@router.get("", response_model=List[WallMessageOut])
def get_approved_messages(db: Session = Depends(get_db)):
    return (
        db.query(WallMessage)
        .filter(WallMessage.approved == True)
        .order_by(WallMessage.created_at.desc())
        .all()
    )