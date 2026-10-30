"""add examination and finance tables

Revision ID: 73e819bcf01a
Revises: 62ef9eaabf0d
Create Date: 2026-10-29 16:02:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '73e819bcf01a'
down_revision: Union[str, None] = '62ef9eaabf0d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Examination tables
    op.create_table(
        'exam_types',
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('weightage', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )

    op.create_table(
        'grade_scales',
        sa.Column('name', sa.String(length=10), nullable=False),
        sa.Column('min_percentage', sa.Float(), nullable=False),
        sa.Column('max_percentage', sa.Float(), nullable=False),
        sa.Column('grade_point', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('description', sa.String(length=100), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )

    op.create_table(
        'exams',
        sa.Column('academic_year_id', sa.UUID(), nullable=False),
        sa.Column('exam_type_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['exam_type_id'], ['exam_types.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_exams_academic_year', 'exams', ['academic_year_id'])

    op.create_table(
        'exam_subjects',
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('class_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=False),
        sa.Column('max_marks', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('pass_marks', sa.Float(), nullable=False, server_default='35.0'),
        sa.Column('exam_date', sa.Date(), nullable=True),
        sa.Column('start_time', sa.Time(), nullable=True),
        sa.Column('end_time', sa.Time(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['exam_id'], ['exams.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('exam_id', 'class_id', 'subject_id', name='uq_exam_class_subject'),
    )

    op.create_table(
        'marks',
        sa.Column('exam_subject_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('marks_obtained', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('is_absent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='draft'),
        sa.Column('remarks', sa.String(length=255), nullable=True),
        sa.Column('entered_by_user_id', sa.UUID(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['entered_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['exam_subject_id'], ['exam_subjects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('exam_subject_id', 'student_id', name='uq_exam_subject_student'),
    )
    op.create_index('ix_marks_student', 'marks', ['student_id'])

    op.create_table(
        'exam_results',
        sa.Column('exam_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('total_marks_obtained', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_max_marks', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('percentage', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('grade', sa.String(length=10), nullable=True),
        sa.Column('rank', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='draft'),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['exam_id'], ['exams.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('exam_id', 'student_id', name='uq_exam_student_result'),
    )
    op.create_index('ix_exam_results_student', 'exam_results', ['student_id'])

    op.create_table(
        'mark_correction_requests',
        sa.Column('mark_id', sa.UUID(), nullable=False),
        sa.Column('requested_marks', sa.Float(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('requested_by_user_id', sa.UUID(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('reviewed_by_user_id', sa.UUID(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['mark_id'], ['marks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['requested_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['reviewed_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )

    # 2. Finance tables
    op.create_table(
        'fee_heads',
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('is_refundable', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code'),
        sa.UniqueConstraint('name'),
    )

    op.create_table(
        'fee_structures',
        sa.Column('academic_year_id', sa.UUID(), nullable=False),
        sa.Column('class_id', sa.UUID(), nullable=False),
        sa.Column('fee_head_id', sa.UUID(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('frequency', sa.String(length=20), nullable=False, server_default='annual'),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['fee_head_id'], ['fee_heads.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('academic_year_id', 'class_id', 'fee_head_id', name='uq_academic_class_fee_head'),
    )
    op.create_index('ix_fee_structures_class', 'fee_structures', ['class_id'])

    op.create_table(
        'student_fees',
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('academic_year_id', sa.UUID(), nullable=False),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('discounted_amount', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('paid_amount', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='unpaid'),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id', 'academic_year_id', name='uq_student_academic_fee'),
    )
    op.create_index('ix_student_fees_student', 'student_fees', ['student_id'])

    op.create_table(
        'fee_concessions',
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('fee_head_id', sa.UUID(), nullable=True),
        sa.Column('concession_type', sa.String(length=20), nullable=False, server_default='fixed'),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('approved_by_user_id', sa.UUID(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['approved_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['fee_head_id'], ['fee_heads.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'payments',
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('payment_method', sa.String(length=30), nullable=False),
        sa.Column('transaction_reference', sa.String(length=100), nullable=True),
        sa.Column('payment_date', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='completed'),
        sa.Column('received_by_user_id', sa.UUID(), nullable=False),
        sa.Column('remarks', sa.String(length=255), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['received_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('transaction_reference'),
    )
    op.create_index('ix_payments_student', 'payments', ['student_id'])
    op.create_index('ix_payments_date', 'payments', ['payment_date'])

    op.create_table(
        'receipts',
        sa.Column('payment_id', sa.UUID(), nullable=False),
        sa.Column('receipt_number', sa.String(length=50), nullable=False),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('issued_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('is_cancelled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('cancellation_reason', sa.String(length=255), nullable=True),
        sa.Column('cancelled_by_user_id', sa.UUID(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['cancelled_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['payment_id'], ['payments.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('payment_id'),
        sa.UniqueConstraint('receipt_number'),
    )
    op.create_index('ix_receipts_receipt_number', 'receipts', ['receipt_number'])

    op.create_table(
        'fee_adjustments',
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('adjustment_type', sa.String(length=20), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('approved_by_user_id', sa.UUID(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['approved_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('fee_adjustments')
    op.drop_table('receipts')
    op.drop_table('payments')
    op.drop_table('fee_concessions')
    op.drop_table('student_fees')
    op.drop_table('fee_structures')
    op.drop_table('fee_heads')
    op.drop_table('mark_correction_requests')
    op.drop_table('exam_results')
    op.drop_table('marks')
    op.drop_table('exam_subjects')
    op.drop_table('exams')
    op.drop_table('grade_scales')
    op.drop_table('exam_types')
