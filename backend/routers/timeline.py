from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db, TimelineEvent
from schemas import TimelineEventOut

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("", response_model=List[TimelineEventOut])
def get_timeline(db: Session = Depends(get_db)):
    return (
        db.query(TimelineEvent)
        .order_by(TimelineEvent.event_date.asc())
        .all()
    )
