from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db, QuizQuestion, QuizScore
from schemas import (
    QuizQuestionOut, QuizAnswerCheck, QuizAnswerResult,
    QuizScoreCreate, QuizScoreOut,
)

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/questions", response_model=List[QuizQuestionOut])
def get_questions(db: Session = Depends(get_db)):
    return db.query(QuizQuestion).order_by(QuizQuestion.id).all()


@router.post("/check", response_model=QuizAnswerResult)
def check_answer(payload: QuizAnswerCheck, db: Session = Depends(get_db)):
    q = db.query(QuizQuestion).filter(QuizQuestion.id == payload.question_id).first()
    if not q:
        raise HTTPException(404, "Question not found")
    correct = payload.selected_answer.strip().lower() == q.correct_answer.strip().lower()
    return QuizAnswerResult(
        correct=correct,
        correct_answer=q.correct_answer,
        fun_fact=q.fun_fact,
    )


@router.post("/scores", response_model=QuizScoreOut, status_code=201)
def submit_score(payload: QuizScoreCreate, db: Session = Depends(get_db)):
    if payload.score > payload.total:
        raise HTTPException(400, "Score cannot exceed total questions")
    entry = QuizScore(
        player_name=payload.player_name,
        score=payload.score,
        total=payload.total,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/leaderboard", response_model=List[QuizScoreOut])
def get_leaderboard(db: Session = Depends(get_db)):
    return (
        db.query(QuizScore)
        .order_by(QuizScore.score.desc(), QuizScore.played_at.asc())
        .limit(20)
        .all()
    )
