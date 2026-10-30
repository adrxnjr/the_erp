import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.examination import (
    BulkMarkEntryRequest,
    ExamCreate,
    ExamResponse,
    ExamResultResponse,
    ExamSubjectCreate,
    ExamSubjectResponse,
    ExamTypeCreate,
    ExamTypeResponse,
    GradeScaleCreate,
    GradeScaleResponse,
    MarkResponse,
)
from app.services.examination_service import ExaminationService

router = APIRouter(prefix="/exams", tags=["Examinations"])


@router.post("/types", response_model=ExamTypeResponse, status_code=status.HTTP_201_CREATED)
def create_exam_type(
    payload: ExamTypeCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    return ExaminationService.create_exam_type(db, payload, current_user, request)


@router.get("/types", response_model=List[ExamTypeResponse])
def list_exam_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExaminationService.list_exam_types(db)


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_exam(
    payload: ExamCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    return ExaminationService.create_exam(db, payload, current_user, request)


@router.get("", response_model=List[ExamResponse])
def list_exams(
    academic_year_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExaminationService.list_exams(db, academic_year_id)


@router.post("/{exam_id}/subjects", response_model=ExamSubjectResponse, status_code=status.HTTP_201_CREATED)
def add_exam_subject(
    exam_id: uuid.UUID,
    payload: ExamSubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    return ExaminationService.add_exam_subject(db, exam_id, payload, current_user)


@router.post("/grade-scales", response_model=GradeScaleResponse, status_code=status.HTTP_201_CREATED)
def create_grade_scale(
    payload: GradeScaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    return ExaminationService.create_grade_scale(db, payload, current_user)


@router.get("/grade-scales", response_model=List[GradeScaleResponse])
def list_grade_scales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExaminationService.list_grade_scales(db)


@router.post("/marks/bulk", response_model=List[MarkResponse])
def record_bulk_marks(
    payload: BulkMarkEntryRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal", "teacher")),
):
    return ExaminationService.record_bulk_marks(db, payload, current_user, request)


@router.post("/{exam_id}/publish-results", response_model=List[ExamResultResponse])
def publish_results(
    exam_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "principal")),
):
    return ExaminationService.calculate_and_publish_results(db, exam_id, current_user, request)


@router.get("/{exam_id}/report-cards/{student_id}")
def download_report_card(
    exam_id: uuid.UUID,
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pdf_bytes = ExaminationService.generate_report_card_pdf(db, exam_id, student_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_card_{student_id}.pdf"},
    )
