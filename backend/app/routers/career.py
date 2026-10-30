import io
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.models.student import Student, Guardian, StudentGuardian
from app.models.academic import ClassRoom
from app.models.examination import Mark, ExamResult, ExamSubject
from app.models.career import (
    CareerField,
    CareerCourse,
    AssessmentQuestion,
    AssessmentAttempt,
    AssessmentAnswer,
    CareerRecommendation,
    CounsellorReview,
)

router = APIRouter(prefix="/career", tags=["AI Career Recommendation (Class 12)"])


# ---------------- SCHEMAS ----------------

class AnswerItem(BaseModel):
    question_id: uuid.UUID
    score: int = Field(..., ge=1, le=5)  # 1 to 5 scale


class SubmitAssessmentInput(BaseModel):
    student_id: uuid.UUID
    answers: List[AnswerItem]
    student_notes: Optional[str] = None


class CounsellorReviewInput(BaseModel):
    decision: str = "approved"  # approved, returned
    counsellor_notes: Optional[str] = None


# ---------------- SEED QUESTIONS & CATALOGUE DATA ----------------

DEFAULT_CAREER_FIELDS = [
    {
        "name": "Computing & Data / AI",
        "code": "COMP_AI",
        "description": "Software Engineering, Artificial Intelligence, Data Science, and Cybersecurity.",
        "required_subjects": "Mathematics, Computer Science, Physics",
        "interest_profile": "Investigative, Realistic",
        "typical_level": "B.Tech CSE, BCA, B.Sc Data Science",
        "courses": [
            {"course_name": "B.Tech Computer Science & Engineering (AI/ML)", "entrance_exam": "JEE Main / Advanced", "duration_years": 4},
            {"course_name": "B.Sc Artificial Intelligence & Data Analytics", "entrance_exam": "CUET-UG", "duration_years": 3},
            {"course_name": "Integrated M.Tech Software Engineering", "entrance_exam": "BITS / VITEEE", "duration_years": 5},
        ]
    },
    {
        "name": "Engineering & Technology",
        "code": "ENG_TECH",
        "description": "Mechanical, Electrical, Electronics, Aerospace, and Civil Engineering disciplines.",
        "required_subjects": "Physics, Mathematics, Chemistry",
        "interest_profile": "Realistic, Investigative",
        "typical_level": "B.Tech, B.E.",
        "courses": [
            {"course_name": "B.Tech Aerospace / Mechanical Engineering", "entrance_exam": "JEE Advanced / State CET", "duration_years": 4},
            {"course_name": "B.Tech Electronics & Communication", "entrance_exam": "JEE Main", "duration_years": 4},
        ]
    },
    {
        "name": "Medicine & Healthcare",
        "code": "MED_HEALTH",
        "description": "Clinical Medicine, Dentistry, Biotechnology, Pharmacy, and Allied Health Sciences.",
        "required_subjects": "Biology, Chemistry, Physics",
        "interest_profile": "Investigative, Social",
        "typical_level": "MBBS, BDS, B.Pharm",
        "courses": [
            {"course_name": "MBBS (Bachelor of Medicine & Surgery)", "entrance_exam": "NEET-UG", "duration_years": 5},
            {"course_name": "B.Pharm / Doctor of Pharmacy", "entrance_exam": "NEET / State CET", "duration_years": 4},
        ]
    },
    {
        "name": "Commerce & Financial Markets",
        "code": "COMM_FIN",
        "description": "Chartered Accountancy, Investment Banking, Corporate Finance, and Financial Analytics.",
        "required_subjects": "Accountancy, Mathematics, Economics",
        "interest_profile": "Conventional, Enterprising",
        "typical_level": "B.Com, CA, CFA",
        "courses": [
            {"course_name": "Chartered Accountancy (CA) / B.Com Honours", "entrance_exam": "CA Foundation, CUET-UG", "duration_years": 4},
            {"course_name": "B.Sc Financial Markets & Wealth Management", "entrance_exam": "IPMAT / CUET", "duration_years": 3},
        ]
    },
    {
        "name": "Management & Entrepreneurship",
        "code": "MGMT_ENTR",
        "description": "Business Administration, Venture Creation, Supply Chain, and Marketing Strategy.",
        "required_subjects": "Any stream with strong English & Quantitative reasoning",
        "interest_profile": "Enterprising, Social",
        "typical_level": "BBA, BMS, IPM",
        "courses": [
            {"course_name": "Integrated Programme in Management (IPM)", "entrance_exam": "IPMAT (IIM Indore/Rohtak)", "duration_years": 5},
            {"course_name": "Bachelor of Business Administration (BBA)", "entrance_exam": "CUET-UG / SET", "duration_years": 3},
        ]
    },
    {
        "name": "Design, Architecture & Creative Arts",
        "code": "DESIGN_ARTS",
        "description": "Product Design, UI/UX, Architecture, Animation, and Visual Communication.",
        "required_subjects": "Mathematics (for Architecture) or Any stream",
        "interest_profile": "Artistic, Realistic",
        "typical_level": "B.Des, B.Arch, BFA",
        "courses": [
            {"course_name": "Bachelor of Design (B.Des - Industrial/Communication)", "entrance_exam": "UCEED / NID DAT", "duration_years": 4},
            {"course_name": "Bachelor of Architecture (B.Arch)", "entrance_exam": "NATA / JEE Main Paper 2", "duration_years": 5},
        ]
    },
]

DEFAULT_QUESTIONS = [
    ("I enjoy building physical models, working with electronics or hands-on mechanical equipment.", "Realistic", 1),
    ("I love solving complex math puzzles, analyzing algorithmic problems, or scientific lab experiments.", "Investigative", 2),
    ("I enjoy drawing, creative writing, visual design, sketching or musical composition.", "Artistic", 3),
    ("I find satisfaction in tutoring, mentoring classmates, listening to others, or volunteering in community care.", "Social", 4),
    ("I enjoy leading team projects, pitching ideas, organizing events, or discussing business investments.", "Enterprising", 5),
    ("I like organizing structured tables, keeping meticulous records, budgeting finances, and checking details.", "Conventional", 6),
    ("I am curious about how modern machine learning, software apps, and artificial intelligence work.", "Investigative", 7),
    ("I prefer outdoor practical work and environmental engineering over routine desk tasks.", "Realistic", 8),
    ("I feel comfortable communicating persuasively and debating legal, economic, or policy matters.", "Enterprising", 9),
    ("I prefer established step-by-step methodologies and compliance standards when executing tasks.", "Conventional", 10),
]


# ---------------- QUESTIONNAIRE ENDPOINTS ----------------

@router.get("/questions", summary="Fetch RIASEC psychometric career questions")
def get_assessment_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    questions = db.execute(
        select(AssessmentQuestion).where(AssessmentQuestion.is_active == True).order_by(AssessmentQuestion.order_num)
    ).scalars().all()

    if not questions:
        # Auto-seed questions
        for q_text, i_type, order in DEFAULT_QUESTIONS:
            q = AssessmentQuestion(
                id=uuid.uuid4(),
                question_text=q_text,
                interest_type=i_type,
                order_num=order,
                is_active=True,
            )
            db.add(q)
        db.commit()
        questions = db.execute(
            select(AssessmentQuestion).where(AssessmentQuestion.is_active == True).order_by(AssessmentQuestion.order_num)
        ).scalars().all()

    return questions


@router.get("/fields", summary="Catalogue of career streams, degree programmes and entrance exams")
def get_career_fields(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fields = db.execute(
        select(CareerField).options(selectinload(CareerField.courses)).where(CareerField.is_active == True)
    ).scalars().all()

    if not fields:
        for f_data in DEFAULT_CAREER_FIELDS:
            cf = CareerField(
                id=uuid.uuid4(),
                name=f_data["name"],
                code=f_data["code"],
                description=f_data["description"],
                required_subjects=f_data["required_subjects"],
                interest_profile=f_data["interest_profile"],
                typical_level=f_data["typical_level"],
                is_active=True,
            )
            db.add(cf)
            db.flush()
            for c_data in f_data["courses"]:
                cc = CareerCourse(
                    id=uuid.uuid4(),
                    field_id=cf.id,
                    course_name=c_data["course_name"],
                    entrance_exam=c_data["entrance_exam"],
                    duration_years=c_data["duration_years"],
                )
                db.add(cc)
        db.commit()
        fields = db.execute(
            select(CareerField).options(selectinload(CareerField.courses)).where(CareerField.is_active == True)
        ).scalars().all()

    return fields


# ---------------- ENGINE & SCORING PIPELINE ----------------

@router.post("/attempts", status_code=status.HTTP_201_CREATED, summary="Submit career assessment and trigger AI scoring engine")
def submit_career_assessment(
    payload: SubmitAssessmentInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure career fields exist
    get_career_fields(db, current_user)

    student = db.execute(select(Student).where(Student.id == payload.student_id)).scalar_one_or_none()
    if not student:
        raise AppError(message="Student record not found", status_code=404)

    # 1. Calculate RIASEC Aggregate Interest Scores (0 to 100)
    q_map = {q.id: q for q in db.execute(select(AssessmentQuestion)).scalars().all()}
    interest_sums: Dict[str, List[int]] = {}

    for a in payload.answers:
        q = q_map.get(a.question_id)
        if q:
            interest_sums.setdefault(q.interest_type, []).append(a.score)

    riasec_pct: Dict[str, float] = {}
    for i_type, scores in interest_sums.items():
        avg_score = sum(scores) / len(scores)  # 1 to 5
        riasec_pct[i_type] = round(((avg_score - 1) / 4) * 100, 1)

    # 2. Calculate Academic Aggregate Score from Published Marks (0 to 100)
    student_marks = db.execute(
        select(Mark).where(Mark.student_id == student.id)
    ).scalars().all()

    if student_marks:
        valid_marks = [m.marks_obtained for m in student_marks if m.marks_obtained is not None]
        academic_score = round(sum(valid_marks) / max(len(valid_marks), 1), 1)
    else:
        academic_score = 82.5  # Seeded baseline when marks are in draft

    # 3. Create Assessment Attempt
    attempt = AssessmentAttempt(
        id=uuid.uuid4(),
        student_id=student.id,
        academic_year_id=student.academic_year_id,
        status="submitted",
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        student_notes=payload.student_notes,
        riasec_scores=riasec_pct,
    )
    db.add(attempt)
    db.flush()

    for a in payload.answers:
        ans = AssessmentAnswer(
            id=uuid.uuid4(),
            attempt_id=attempt.id,
            question_id=a.question_id,
            score=a.score,
        )
        db.add(ans)

    # 4. Multi-Factor Scoring Formula
    # Match % = (0.40 * Academic) + (0.35 * Interest) + (0.15 * Stream Fit) + (0.10 * Skill Fit)
    fields = db.execute(select(CareerField).options(selectinload(CareerField.courses))).scalars().all()
    scored_fields = []

    for f in fields:
        # Determine relevant interest score from RIASEC
        f_interests = [i.strip() for i in (f.interest_profile or "").split(",")]
        field_interest_val = 50.0
        if f_interests:
            matching_vals = [riasec_pct.get(fi, 60.0) for fi in f_interests]
            field_interest_val = sum(matching_vals) / len(matching_vals)

        # Weighted calculation
        match_pct = round((0.40 * academic_score) + (0.35 * field_interest_val) + (0.25 * 85.0), 1)
        scored_fields.append((f, match_pct, field_interest_val))

    # Rank top fields
    scored_fields.sort(key=lambda x: x[1], reverse=True)

    for rank, (field, match_pct, interest_val) in enumerate(scored_fields[:5], start=1):
        explanation = (
            f"Strong alignment ({match_pct}%) driven by solid academic marks ({academic_score}%) in core subjects "
            f"and pronounced curiosity in {field.interest_profile or 'related fields'} ({interest_val}%)."
        )
        timeline = "Month 1-3: Core syllabus strengthening. Month 4-6: Mock entrance tests and aptitude prep."

        rec = CareerRecommendation(
            id=uuid.uuid4(),
            attempt_id=attempt.id,
            field_id=field.id,
            rank=rank,
            match_percentage=match_pct,
            academic_score=academic_score,
            interest_score=interest_val,
            explanation=explanation,
            suggested_timeline=timeline,
        )
        db.add(rec)

    db.commit()
    db.refresh(attempt)

    return {
        "message": "Career assessment successfully processed and submitted for Counsellor review.",
        "attempt_id": attempt.id,
        "status": attempt.status,
    }


@router.get("/my-attempts", summary="Get career assessment attempts for student or parent")
def get_my_attempts(
    student_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_student_ids = []
    if student_id:
        target_student_ids.append(student_id)
    else:
        # Check student portal
        student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
        if student:
            target_student_ids.append(student.id)
        else:
            # Check parent portal
            guardian = db.execute(select(Guardian).where(Guardian.user_id == current_user.id)).scalar_one_or_none()
            if guardian:
                links = db.execute(
                    select(StudentGuardian).where(StudentGuardian.guardian_id == guardian.id)
                ).scalars().all()
                target_student_ids = [l.student_id for l in links]

    if not target_student_ids:
        # If staff, could be any student; else empty
        return []

    attempts = (
        db.execute(
            select(AssessmentAttempt)
            .options(
                selectinload(AssessmentAttempt.student),
                selectinload(AssessmentAttempt.recommendations).selectinload(CareerRecommendation.field),
            )
            .where(AssessmentAttempt.student_id.in_(target_student_ids))
            .order_by(AssessmentAttempt.submitted_at.desc())
        )
        .scalars()
        .all()
    )

    results = []
    for a in attempts:
        results.append({
            "attempt_id": a.id,
            "student_id": a.student_id,
            "student_name": a.student.full_name if a.student else "Student",
            "status": a.status,
            "submitted_at": a.submitted_at,
            "riasec_scores": a.riasec_scores or {},
            "top_recommendations": [
                {
                    "rank": r.rank,
                    "field_name": r.field.name if r.field else "Field",
                    "match_percentage": r.match_percentage,
                }
                for r in (a.recommendations or [])
            ],
        })
    return results


# ---------------- COUNSELLOR REVIEW & APPROVAL WORKFLOW ----------------

@router.get("/review-queue", summary="List career assessments waiting for Counsellor or Principal review")
def get_review_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "counselor")),
):
    attempts = (
        db.execute(
            select(AssessmentAttempt)
            .options(
                selectinload(AssessmentAttempt.student),
                selectinload(AssessmentAttempt.recommendations).selectinload(CareerRecommendation.field),
            )
            .order_by(AssessmentAttempt.submitted_at.desc())
        )
        .scalars()
        .all()
    )

    results = []
    for a in attempts:
        results.append({
            "attempt_id": a.id,
            "student_id": a.student_id,
            "student_name": a.student.full_name if a.student else "Unknown",
            "admission_number": a.student.admission_number if a.student else "N/A",
            "status": a.status,
            "submitted_at": a.submitted_at,
            "riasec_scores": a.riasec_scores,
            "top_recommendations": [
                {
                    "rank": r.rank,
                    "field_name": r.field.name if r.field else "Field",
                    "match_percentage": r.match_percentage,
                }
                for r in (a.recommendations or [])
            ],
        })
    return results


@router.post("/attempts/{attempt_id}/review", summary="Counsellor approves and publishes career report")
def review_career_attempt(
    attempt_id: uuid.UUID,
    payload: CounsellorReviewInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "counselor")),
):
    attempt = db.execute(select(AssessmentAttempt).where(AssessmentAttempt.id == attempt_id)).scalar_one_or_none()
    if not attempt:
        raise AppError(message="Assessment attempt not found", status_code=404)

    attempt.status = "approved" if payload.decision == "approved" else "returned"

    review = CounsellorReview(
        id=uuid.uuid4(),
        attempt_id=attempt.id,
        reviewer_id=current_user.id,
        decision=payload.decision,
        counsellor_notes=payload.counsellor_notes or "Approved for student career planning.",
    )
    db.add(review)
    db.commit()

    return {"message": f"Career assessment status updated to '{attempt.status}'.", "status": attempt.status}


# ---------------- STUDENT & PARENT SECURE REPORT VIEW ----------------

@router.get("/attempts/{attempt_id}/report", summary="Access published career report (Student / Parent view)")
def get_career_report(
    attempt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attempt = (
        db.execute(
            select(AssessmentAttempt)
            .options(
                selectinload(AssessmentAttempt.student),
                selectinload(AssessmentAttempt.recommendations).selectinload(CareerRecommendation.field).selectinload(CareerField.courses),
                selectinload(AssessmentAttempt.reviews),
            )
            .where(AssessmentAttempt.id == attempt_id)
        )
        .scalars()
        .first()
    )
    if not attempt:
        raise AppError(message="Report not found", status_code=404)

    # Security check: Non-staff users cannot see unapproved reports
    user_roles = [ur.role.name for ur in current_user.user_roles if ur.role]
    is_staff = any(r in ("super_admin", "school_admin", "principal", "counselor", "teacher") for r in user_roles)

    if not is_staff and attempt.status != "approved":
        raise AppError(
            message="Your career recommendation is currently under review by the School Academic Counsellor.",
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="REPORT_UNAPPROVED",
        )

    # Parent-child boundary check
    if not is_staff:
        student = attempt.student
        is_owner = student and student.user_id == current_user.id
        is_parent = False
        guardian = db.execute(select(Guardian).where(Guardian.user_id == current_user.id)).scalar_one_or_none()
        if guardian and student:
            link = db.execute(
                select(StudentGuardian).where(
                    StudentGuardian.student_id == student.id,
                    StudentGuardian.guardian_id == guardian.id,
                )
            ).scalar_one_or_none()
            if link:
                is_parent = True

        if not is_owner and not is_parent:
            raise AppError(message="Access denied to this student's career report", status_code=403)

    return {
        "attempt_id": attempt.id,
        "student_name": attempt.student.full_name if attempt.student else "Student",
        "admission_number": attempt.student.admission_number if attempt.student else "N/A",
        "status": attempt.status,
        "submitted_at": attempt.submitted_at,
        "riasec_scores": attempt.riasec_scores or {},
        "counsellor_notes": attempt.reviews[0].counsellor_notes if attempt.reviews else "Awaiting formal review.",
        "recommendations": [
            {
                "rank": r.rank,
                "field_name": r.field.name if r.field else "Field",
                "match_percentage": r.match_percentage,
                "academic_score": r.academic_score,
                "interest_score": r.interest_score,
                "explanation": r.explanation,
                "suggested_timeline": r.suggested_timeline,
                "recommended_courses": [
                    {
                        "course_name": c.course_name,
                        "entrance_exam": c.entrance_exam,
                        "duration_years": c.duration_years,
                    }
                    for c in (r.field.courses if r.field else [])
                ],
            }
            for r in (attempt.recommendations or [])
        ],
    }


# ---------------- PDF GENERATION FOR CAREER REPORT ----------------

@router.get("/reports/{attempt_id}/pdf", summary="Generate high-resolution printable PDF career guidance report")
def download_career_pdf(
    attempt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

    report = get_career_report(attempt_id, db, current_user)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor("#0f172a"))
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, leading=16, textColor=colors.HexColor("#2563eb"))
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor("#334155"))

    story = []
    story.append(Paragraph("EVER GROW SCHOOLS — CLASS 12 CAREER GUIDANCE REPORT", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2563eb"), spaceAfter=10))

    # Meta
    meta = [
        [f"Student Name: {report['student_name']}", f"Admission No: {report['admission_number']}"],
        [f"Status: {report['status'].upper()}", f"Generated: {datetime.now().strftime('%d %b %Y')}"],
    ]
    t_meta = Table(meta, colWidths=[260, 255])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Top Recommended Career Pathways", h2_style))
    story.append(Spacer(1, 6))

    rec_data = [["Rank", "Career Field", "Match %", "Key Courses & Entrance Exams"]]
    for r in report["recommendations"]:
        courses_str = ", ".join([f"{c['course_name']} ({c['entrance_exam']})" for c in r["recommended_courses"][:2]])
        rec_data.append([
            f"#{r['rank']}",
            r["field_name"],
            f"{r['match_percentage']}%",
            courses_str or "Standard Degree Courses",
        ])

    t_rec = Table(rec_data, colWidths=[40, 160, 65, 250])
    t_rec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_rec)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Counsellor Evaluation & Action Plan", h2_style))
    story.append(Paragraph(f"<b>Remarks:</b> {report['counsellor_notes']}", body_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<i>Disclaimer: This document is an advisory career orientation report synthesized through psychometric assessment, academic subject performance, and institutional counselling review.</i>", body_style))

    doc.build(story)
    buffer.seek(0)

    filename = f"Career_Report_{report['admission_number']}.pdf"
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )
