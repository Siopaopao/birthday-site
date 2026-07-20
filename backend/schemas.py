from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime, date


class WallMessageCreate(BaseModel):
    sender_name: str
    relationship: str
    message: str
    color: Optional[str] = "pink"

    @field_validator("sender_name", "relationship", "message")
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("This field cannot be empty")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_length(cls, v):
        if len(v) > 1000:
            raise ValueError("Message must be 1000 characters or fewer")
        return v

    @field_validator("color")
    @classmethod
    def valid_color(cls, v):
        allowed = {"pink", "yellow", "blue", "green", "purple", "coral"}
        return v if v in allowed else "pink"


class WallMessageOut(BaseModel):
    id: int
    sender_name: str
    relationship: str
    message: str
    photo_url: Optional[str]
    color: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TimelineEventOut(BaseModel):
    id: int
    title: str
    description: str
    event_date: date
    photo_url: Optional[str]
    tag: str

    model_config = {"from_attributes": True}


class QuizQuestionOut(BaseModel):
    id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

    model_config = {"from_attributes": True}


class QuizAnswerCheck(BaseModel):
    question_id: int
    selected_answer: str


class QuizAnswerResult(BaseModel):
    correct: bool
    correct_answer: str
    fun_fact: Optional[str]


class QuizScoreCreate(BaseModel):
    player_name: str
    score: int
    total: int

    @field_validator("player_name")
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("score", "total")
    @classmethod
    def non_negative(cls, v):
        if v < 0:
            raise ValueError("Score cannot be negative")
        return v


class QuizScoreOut(BaseModel):
    id: int
    player_name: str
    score: int
    total: int
    played_at: datetime

    model_config = {"from_attributes": True}


class PrivateMessageCreate(BaseModel):
    sender_name: str
    message: str

    @field_validator("sender_name", "message")
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("This field cannot be empty")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_length(cls, v):
        if len(v) > 2000:
            raise ValueError("Message must be 2000 characters or fewer")
        return v


class PrivateMessageOut(BaseModel):
    id: int
    sender_name: str
    message: str
    viewed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PasscodeCheck(BaseModel):
    passcode: str


class AdminLogin(BaseModel):
    password: str


class WallMessageAdmin(BaseModel):
    id: int
    sender_name: str
    relationship: str
    message: str
    photo_url: Optional[str]
    color: str
    approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}