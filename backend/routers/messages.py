from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db, WallMessage
from schemas import WallMessageCreate, WallMessageOut
from cloudinary_helper import upload_image

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("", status_code=201)
async def post_message(
    sender_name: str = Form(...),
    relationship: str = Form(...),
    message: str = Form(...),
    color: Optional[str] = Form("pink"),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Validate
    data = WallMessageCreate(
        sender_name=sender_name,
        relationship=relationship,
        message=message,
        color=color or "pink",
    )

    photo_url = None
    if photo and photo.filename:
        try:
            photo_url = await upload_image(photo, folder="birthday-site/wall")
        except ValueError as e:
            raise HTTPException(400, str(e))

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