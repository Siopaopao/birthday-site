from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import pymysql
pymysql.install_as_MySQLdb()
from dotenv import load_dotenv


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/birthday_db")

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class WallMessage(Base):
    __tablename__ = "wall_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_name = Column(String(100), nullable=False)
    relationship = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    color = Column(String(20), default="pink")   # card accent color
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    event_date = Column(Date, nullable=False)
    photo_url = Column(String(500), nullable=True)
    tag = Column(String(50), default="milestone")   # us | travel | family | milestone


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    correct_answer = Column(String(300), nullable=False)
    option_a = Column(String(300), nullable=False)
    option_b = Column(String(300), nullable=False)
    option_c = Column(String(300), nullable=False)
    option_d = Column(String(300), nullable=False)
    fun_fact = Column(Text, nullable=True)   # shown after answering


class QuizScore(Base):
    __tablename__ = "quiz_scores"
    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String(100), nullable=False)
    score = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    played_at = Column(DateTime, default=datetime.utcnow)


class PrivateMessage(Base):
    __tablename__ = "private_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_name = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    viewed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    """Seed quiz questions and timeline events if tables are empty."""
    # ── Quiz Questions ──────────────────────────────────────────────────────
    if db.query(QuizQuestion).count() == 0:
        questions = [
            QuizQuestion(
                question="What is her absolute favourite drink?",
                correct_answer="Matcha Latte",
                option_a="Spanish Latte",
                option_b="Matcha Latte",
                option_c="Coke",
                option_d="Kitkat Frappe",
                fun_fact="She could eat carbonara every single day and never get tired of it!"
            ),
            QuizQuestion(
                question="If she could travel anywhere RIGHT NOW, where would she go?",
                correct_answer="Japan",
                option_a="Paris",
                option_b="New York",
                option_c="Japan",
                option_d="Maldives",
                fun_fact="She has been dreaming about Japan since she was 14. Cherry blossoms are her reason."
            ),
            QuizQuestion(
                question="What does she do first thing every morning?",
                correct_answer="Check her phone for 20 minutes",
                option_a="Drink coffee immediately",
                option_b="Check her phone for 20 minutes",
                option_c="Go for a walk",
                option_d="Make breakfast",
                fun_fact="She claims she is 'just checking the time' but we all know the truth."
            ),
            QuizQuestion(
                question="What is her love language?",
                correct_answer="Quality time",
                option_a="Words of affirmation",
                option_b="Gift giving",
                option_c="Acts of service",
                option_d="Quality time",
                fun_fact="She will never say it out loud but she notices every little thing you do for her."
            ),
            QuizQuestion(
                question="Which movie can she watch on repeat forever?",
                correct_answer="Pride and Prejudice (2005)",
                option_a="Titanic",
                option_b="The Notebook",
                option_c="La La Land",
                option_d="Pride and Prejudice (2005)",
                fun_fact="She has seen it at least 30 times and still cries at the same scenes."
            ),
            QuizQuestion(
                question="What stresses her out the MOST?",
                correct_answer="Hot weather",
                option_a="Slow walkers",
                option_b="Entitled people",
                option_c="Hot weather",
                option_d="Loud/Crowded places",
                fun_fact="All of the above! But heat will always be her number one enemy. *Ayaw jud tawn kalimiti ang jisu life*"
            ),
        ]
        db.add_all(questions)

    # ── Timeline Events ─────────────────────────────────────────────────────
    if db.query(TimelineEvent).count() == 0:
        from datetime import date
        events = [
            TimelineEvent(
                title="The day we met",
                description="Neither of us knew this random Tuesday would change everything. You walked in and I immediately forgot what I was doing.",
                event_date=date(2022, 3, 15),
                tag="milestone"
            ),
            TimelineEvent(
                title="Our first real date",
                description="That little coffee shop on the corner. You ordered the wrong thing and pretended you liked it the whole time. I only found out months later.",
                event_date=date(2022, 4, 2),
                tag="us"
            ),
            TimelineEvent(
                title="First trip together",
                description="Four days of getting lost, laughing too loud, and realizing I wanted to get lost with you forever.",
                event_date=date(2022, 9, 10),
                tag="travel"
            ),
            TimelineEvent(
                title="Met the family",
                description="Terrifying and wonderful at the same time. They loved you immediately. I was not surprised.",
                event_date=date(2023, 1, 20),
                tag="family"
            ),
            TimelineEvent(
                title="Your birthday last year",
                description="The beginning of a tradition. Every year I will find a new way to make this day unforgettable.",
                event_date=date(2023, 6, 11),
                tag="milestone"
            ),
            TimelineEvent(
                title="Today — Happy Birthday! 🎂",
                description="Another year of you. Another year of us. I hope this one is your best yet.",
                event_date=date(2024, 6, 11),
                tag="milestone"
            ),
        ]
        db.add_all(events)

    db.commit()
