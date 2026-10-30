import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CareerField(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Catalogue of professional career streams and domains (e.g. Computing & Data / AI, Engineering, Medicine).
    """
    __tablename__ = "career_fields"

    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Text] = mapped_column(Text, nullable=False)
    required_subjects: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Comma-separated or JSON
    interest_profile: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # e.g., "Investigative, Realistic"
    typical_level: Mapped[str] = mapped_column(String(50), default="Undergraduate", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    courses: Mapped[List["CareerCourse"]] = relationship(
        "CareerCourse", back_populates="field", cascade="all, delete-orphan"
    )
    recommendations: Mapped[List["CareerRecommendation"]] = relationship(
        "CareerRecommendation", back_populates="field"
    )

    def __repr__(self) -> str:
        return f"<CareerField {self.code} - {self.name}>"


class CareerCourse(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Academic degree programmes, professional certifications, and entrance examinations per field.
    """
    __tablename__ = "career_courses"

    field_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("career_fields.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_name: Mapped[str] = mapped_column(String(150), nullable=False)
    degree_type: Mapped[str] = mapped_column(String(50), default="B.Tech / B.Sc", nullable=False)
    entrance_exam: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    duration_years: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    notes: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)

    # Relationships
    field: Mapped["CareerField"] = relationship("CareerField", back_populates="courses")

    def __repr__(self) -> str:
        return f"<CareerCourse {self.course_name} (Exam: {self.entrance_exam})>"


class AssessmentQuestion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    RIASEC psychometric and career questionnaire items (Realistic, Investigative, Artistic, Social, Enterprising, Conventional).
    """
    __tablename__ = "assessment_questions"

    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    interest_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # Realistic, Investigative, Artistic, Social, Enterprising, Conventional
    order_num: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    answers: Mapped[List["AssessmentAnswer"]] = relationship(
        "AssessmentAnswer", back_populates="question", cascade="all, delete-orphan"
    )


class AssessmentAttempt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Student career assessment submission instance.
    Workflow: started -> submitted -> reviewed -> approved (published).
    """
    __tablename__ = "assessment_attempts"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    academic_year_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(30), default="submitted", nullable=False
    )  # started, submitted, reviewed, approved, returned
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    student_notes: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)

    # Computed interest aggregate scores (JSON snapshot of {Realistic: 85, Investigative: 92, ...})
    riasec_scores: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # Relationships
    student = relationship("Student", backref="career_attempts")
    answers: Mapped[List["AssessmentAnswer"]] = relationship(
        "AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan"
    )
    recommendations: Mapped[List["CareerRecommendation"]] = relationship(
        "CareerRecommendation", back_populates="attempt", cascade="all, delete-orphan", order_by="CareerRecommendation.rank"
    )
    reviews: Mapped[List["CounsellorReview"]] = relationship(
        "CounsellorReview", back_populates="attempt", cascade="all, delete-orphan"
    )


class AssessmentAnswer(Base, UUIDPrimaryKeyMixin):
    """
    Individual response to an assessment question (rating 1 to 5).
    """
    __tablename__ = "assessment_answers"
    __table_args__ = (
        UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question_answer"),
    )

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 5 Likert scale

    # Relationships
    attempt: Mapped["AssessmentAttempt"] = relationship("AssessmentAttempt", back_populates="answers")
    question: Mapped["AssessmentQuestion"] = relationship("AssessmentQuestion", back_populates="answers")


class CareerRecommendation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Ranked recommendation produced by the multi-factor scoring engine and AI explanation layer.
    """
    __tablename__ = "career_recommendations"
    __table_args__ = (
        UniqueConstraint("attempt_id", "rank", name="uq_attempt_rank"),
    )

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    field_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("career_fields.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rank: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 5 (or alternative)
    match_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    academic_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    interest_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    explanation: Mapped[Text] = mapped_column(Text, nullable=False)
    suggested_timeline: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)

    # Relationships
    attempt: Mapped["AssessmentAttempt"] = relationship("AssessmentAttempt", back_populates="recommendations")
    field: Mapped["CareerField"] = relationship("CareerField", back_populates="recommendations")


class CounsellorReview(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    School counsellor or principal review log, sign-off notes, and publishing decision.
    """
    __tablename__ = "counsellor_reviews"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    decision: Mapped[str] = mapped_column(String(30), nullable=False)  # approved, returned, edits_made
    counsellor_notes: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )

    # Relationships
    attempt: Mapped["AssessmentAttempt"] = relationship("AssessmentAttempt", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
