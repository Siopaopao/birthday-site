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
MAX_SIZE = 5 * 1024 * 1024   # 5 MB


@router.post("", status_code=201)
async def post_message(
    sender_name: str = Form(...),
    relationship: str = Form(...),
    message: str = Form(...),
    color: Optional[str] = Form("pink"),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Validate text fields
    data = WallMessageCreate(
        sender_name=sender_name,
        relationship=relationship,
        message=message,
        color=color or "pink",
    )

    photo_url = None
    if photo and photo.filename:
        if photo.content_type not in ALLOWED_TYPES:
            raise HTTPException(400, "Only JPEG, PNG, GIF, or WebP images are allowed")
        contents = await photo.read()
        if len(contents) > MAX_SIZE:
            raise HTTPException(400, "Image must be under 5 MB")
        ext = photo.filename.rsplit(".", 1)[-1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(contents)
        photo_url = f"/static/uploads/{filename}"

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
