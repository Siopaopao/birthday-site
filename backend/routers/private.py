from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os, bcrypt

from database import get_db, PrivateMessage
from schemas import PrivateMessageCreate, PrivateMessageOut, PasscodeCheck

router = APIRouter(prefix="/private", tags=["private"])

PASSCODE = os.getenv("PRIVATE_PASSCODE", "diane1011010101")


def _check_passcode(passcode: str) -> bool:
    return passcode.strip() == PASSCODE


@router.post("", status_code=201)
def send_private_message(payload: PrivateMessageCreate, db: Session = Depends(get_db)):
    msg = PrivateMessage(
        sender_name=payload.sender_name,
        message=payload.message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"id": msg.id, "message": "Your private message has been saved 💌"}


@router.post("/unlock", response_model=List[PrivateMessageOut])
def unlock_private_messages(payload: PasscodeCheck, db: Session = Depends(get_db)):
    if not _check_passcode(payload.passcode):
        raise HTTPException(401, "Incorrect passcode")

    messages = (
        db.query(PrivateMessage)
        .order_by(PrivateMessage.created_at.desc())
        .all()
    )

    # mark all as viewed
    for m in messages:
        if not m.viewed:
            m.viewed = True
    db.commit()

    return messages
