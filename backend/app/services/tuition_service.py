import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session, selectinload

from app.models.student import Student
from app.models.academic import Subject, ClassRoom
from app.models.examination import Mark, ExamSubject, Exam
from app.models.tuition import TuitionCenter, TuitionTeacher, TuitionBatch, TuitionEnquiry
from app.schemas.tuition import WeakSubjectItem, RecommendationCard, TuitionRecommendationResponse


class TuitionService:

    @staticmethod
    def get_weak_subjects(student_id: uuid.UUID, db: Session) -> List[WeakSubjectItem]:
        """
        Calculates student subject proficiency from the most recent exam session.
        - < 60%: needs tuition (needs_tuition / Red)
        - 60% - 75%: borderline/optional (borderline / Yellow)
        - > 75%: strong mastery (strong / Green)
        If no marks exist yet, returns all core subjects as recommended.
        """
        # Fetch latest published exam session
        latest_exam = (
            db.execute(
                select(Exam)
                .where(Exam.is_published == True)
                .order_by(Exam.end_date.desc())
            )
            .scalars()
            .first()
        )

        marks = []
        if latest_exam:
            marks = (
                db.execute(
                    select(Mark)
                    .join(ExamSubject)
                    .where(
                        Mark.student_id == student_id,
                        ExamSubject.exam_id == latest_exam.id,
                    )
                )
                .scalars()
                .all()
            )

        if not marks:
            marks = db.execute(select(Mark).where(Mark.student_id == student_id)).scalars().all()

        results: List[WeakSubjectItem] = []

        if marks:
            subject_marks: Dict[str, List[float]] = {}
            for m in marks:
                subj = db.get(Subject, m.exam_subject.subject_id) if m.exam_subject else None
                s_name = subj.name if subj else "General Subject"
                score = float(m.marks_obtained or 0.0)
                max_m = float(m.exam_subject.max_marks or 100.0) if m.exam_subject else 100.0
                pct = round((score / max(max_m, 1.0)) * 100, 1)
                subject_marks.setdefault(s_name, []).append(pct)

            for s_name, pct_list in subject_marks.items():
                avg_pct = round(sum(pct_list) / len(pct_list), 1)
                if avg_pct < 60.0:
                    status_str = "needs_tuition"
                    tag_str = "Needs Tuition"
                    grade_str = "C" if avg_pct >= 40 else "D"
                elif avg_pct <= 75.0:
                    status_str = "borderline"
                    tag_str = "Optional Support"
                    grade_str = "B"
                else:
                    status_str = "strong"
                    tag_str = "Strong Mastery"
                    grade_str = "A+" if avg_pct >= 90 else "A"

                results.append(
                    WeakSubjectItem(
                        subject_name=s_name,
                        percentage=avg_pct,
                        status=status_str,
                        tag=tag_str,
                        grade=grade_str,
                    )
                )
        else:
            # Fallback when no marks exist yet: recommend all standard subjects
            default_subjects = ["Mathematics", "Physics", "Chemistry", "General Science", "English", "Computer Science"]
            for s_name in default_subjects:
                results.append(
                    WeakSubjectItem(
                        subject_name=s_name,
                        percentage=55.0,
                        status="needs_tuition",
                        tag="Recommended",
                        grade="N/A",
                    )
                )

        # Sort so weakest subjects appear first
        results.sort(key=lambda x: x.percentage)
        return results

    @staticmethod
    def get_recommendations(
        student_id: uuid.UUID,
        db: Session,
        area: Optional[str] = None,
        budget_min: Optional[int] = None,
        budget_max: Optional[int] = None,
        preferred_timing: Optional[str] = None,
    ) -> TuitionRecommendationResponse:
        """
        Synthesizes student weak subjects with active tuition batches and applies area,
        budget, and timing filters.
        """
        student = db.get(Student, student_id)
        student_name = student.full_name if student else "Student"

        # 1. Identify weak/needed subjects
        weak_subjects_list = TuitionService.get_weak_subjects(student_id, db)
        weak_subject_names = [w.subject_name.lower() for w in weak_subjects_list if w.status in ("needs_tuition", "borderline")]
        if not weak_subject_names:
            weak_subject_names = [w.subject_name.lower() for w in weak_subjects_list]

        # 2. Query Batches with joins on Center and Teacher
        stmt = (
            select(TuitionBatch)
            .join(TuitionCenter)
            .outerjoin(TuitionTeacher)
            .options(
                selectinload(TuitionBatch.tuition_center),
                selectinload(TuitionBatch.teacher),
            )
            .where(
                TuitionBatch.is_active == True,
                TuitionCenter.is_active == True,
            )
        )

        batches = db.execute(stmt).scalars().all()

        matched_cards: List[RecommendationCard] = []

        for b in batches:
            center = b.tuition_center
            teacher = b.teacher

            if not center:
                continue

            # Subject match: check if batch subject relates to any needed subject
            b_subj_lower = b.subject_name.lower()
            subject_matches = any(
                ws in b_subj_lower or b_subj_lower in ws for ws in weak_subject_names
            )
            # If no specific match, still consider it if search query didn't restrict
            if not subject_matches and len(weak_subject_names) > 0 and len(matched_cards) >= 5:
                continue

            # Budget match
            if budget_min is not None and b.fee_per_month < budget_min:
                continue
            if budget_max is not None and b.fee_per_month > budget_max:
                continue

            # Area match (check area, city, pincode, or address)
            if area and area.strip():
                search_term = area.strip().lower()
                area_matches = (
                    search_term in center.area.lower()
                    or search_term in center.city.lower()
                    or search_term in center.pincode.lower()
                    or search_term in center.address.lower()
                )
                if not area_matches:
                    continue

            # Timing match (morning < 12:00, afternoon 12:00-17:00, evening >= 17:00)
            if preferred_timing and preferred_timing.lower() != "any":
                t_pref = preferred_timing.lower()
                try:
                    hour = int(b.start_time.split(":")[0])
                except (ValueError, IndexError):
                    hour = 17

                if t_pref == "morning" and hour >= 12:
                    continue
                elif t_pref == "afternoon" and (hour < 12 or hour >= 17):
                    continue
                elif t_pref == "evening" and hour < 17:
                    continue

            seats_left = max(0, b.batch_size_max - b.current_enrolled)

            matched_cards.append(
                RecommendationCard(
                    batch_id=b.id,
                    center_id=center.id,
                    center_name=center.name,
                    center_address=center.address,
                    center_area=center.area,
                    center_city=center.city,
                    center_contact_phone=center.contact_phone,
                    center_contact_email=center.contact_email,
                    is_approved=center.is_approved,
                    subject_name=b.subject_name,
                    days_of_week=b.days_of_week or ["Mon", "Wed", "Fri"],
                    start_time=b.start_time,
                    end_time=b.end_time,
                    fee_per_month=float(b.fee_per_month),
                    batch_size_max=b.batch_size_max,
                    current_enrolled=b.current_enrolled,
                    seats_left=seats_left,
                    teacher_name=teacher.teacher_name if teacher else "Senior Faculty",
                    teacher_qualification=teacher.qualification if teacher else "M.Sc / B.Ed Specialist",
                    teacher_experience_years=teacher.experience_years if teacher else 5,
                    teacher_rating=float(teacher.rating) if teacher else 4.8,
                )
            )

        # 6. Sort results: Approved centers first, then rating descending, then fee ascending
        matched_cards.sort(
            key=lambda x: (not x.is_approved, -x.teacher_rating, x.fee_per_month)
        )

        return TuitionRecommendationResponse(
            student_id=student_id,
            student_name=student_name,
            weak_subjects=weak_subjects_list,
            total_found=len(matched_cards),
            recommendations=matched_cards,
        )


def get_weak_subjects(student_id: uuid.UUID, db: Session) -> List[WeakSubjectItem]:
    return TuitionService.get_weak_subjects(student_id, db)


def get_recommendations(
    student_id: uuid.UUID,
    area: Optional[str] = None,
    budget_min: Optional[int] = None,
    budget_max: Optional[int] = None,
    preferred_timing: Optional[str] = None,
    db: Session = None,
) -> TuitionRecommendationResponse:
    return TuitionService.get_recommendations(
        student_id=student_id,
        db=db,
        area=area,
        budget_min=budget_min,
        budget_max=budget_max,
        preferred_timing=preferred_timing,
    )

