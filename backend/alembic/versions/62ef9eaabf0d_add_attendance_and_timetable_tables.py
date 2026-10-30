"""add_attendance_and_timetable_tables

Revision ID: 62ef9eaabf0d
Revises: 622871d13d22
Create Date: 2026-10-29 15:14:05.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '62ef9eaabf0d'
down_revision: Union[str, Sequence[str], None] = '622871d13d22'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. student_attendance
    op.create_table(
        'student_attendance',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('class_id', sa.UUID(), nullable=False),
        sa.Column('section_id', sa.UUID(), nullable=False),
        sa.Column('academic_year_id', sa.UUID(), nullable=False),
        sa.Column('attendance_date', sa.Date(), nullable=False),
        sa.Column('session', sa.String(length=20), nullable=False, server_default=sa.text("'full_day'")),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('remarks', sa.String(length=255), nullable=True),
        sa.Column('marked_by_user_id', sa.UUID(), nullable=False),
        sa.Column('is_locked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['marked_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id', 'attendance_date', 'session', name='uq_student_date_session'),
    )
    op.create_index(op.f('ix_student_attendance_attendance_date'), 'student_attendance', ['attendance_date'], unique=False)
    op.create_index('ix_student_attendance_class_date', 'student_attendance', ['class_id', 'attendance_date'], unique=False)
    op.create_index(op.f('ix_student_attendance_student_id'), 'student_attendance', ['student_id'], unique=False)

    # 2. staff_attendance
    op.create_table(
        'staff_attendance',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('staff_id', sa.UUID(), nullable=False),
        sa.Column('attendance_date', sa.Date(), nullable=False),
        sa.Column('check_in_time', sa.Time(), nullable=True),
        sa.Column('check_out_time', sa.Time(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'present'")),
        sa.Column('remarks', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['staff_id'], ['staff.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('staff_id', 'attendance_date', name='uq_staff_attendance_date'),
    )
    op.create_index(op.f('ix_staff_attendance_attendance_date'), 'staff_attendance', ['attendance_date'], unique=False)
    op.create_index(op.f('ix_staff_attendance_staff_id'), 'staff_attendance', ['staff_id'], unique=False)

    # 3. leave_requests
    op.create_table(
        'leave_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('requester_user_id', sa.UUID(), nullable=False),
        sa.Column('applicant_type', sa.String(length=20), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('leave_type', sa.String(length=50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column('reviewed_by_user_id', sa.UUID(), nullable=True),
        sa.Column('review_remarks', sa.Text(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['requester_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_leave_requests_requester_user_id'), 'leave_requests', ['requester_user_id'], unique=False)
    op.create_index(op.f('ix_leave_requests_student_id'), 'leave_requests', ['student_id'], unique=False)

    # 4. attendance_correction_requests
    op.create_table(
        'attendance_correction_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('attendance_id', sa.UUID(), nullable=False),
        sa.Column('requested_by_user_id', sa.UUID(), nullable=False),
        sa.Column('current_status', sa.String(length=20), nullable=False),
        sa.Column('requested_status', sa.String(length=20), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column('reviewed_by_user_id', sa.UUID(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['attendance_id'], ['student_attendance.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['requested_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['reviewed_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_attendance_correction_requests_attendance_id'), 'attendance_correction_requests', ['attendance_id'], unique=False)

    # 5. attendance_change_history
    op.create_table(
        'attendance_change_history',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('attendance_id', sa.UUID(), nullable=False),
        sa.Column('previous_status', sa.String(length=20), nullable=False),
        sa.Column('new_status', sa.String(length=20), nullable=False),
        sa.Column('changed_by_user_id', sa.UUID(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['attendance_id'], ['student_attendance.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['changed_by_user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_attendance_change_history_attendance_id'), 'attendance_change_history', ['attendance_id'], unique=False)

    # 6. periods
    op.create_table(
        'periods',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('period_number', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('is_break', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('period_number', name='uq_period_number'),
    )

    # 7. timetable_entries
    op.create_table(
        'timetable_entries',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('academic_year_id', sa.UUID(), nullable=False),
        sa.Column('class_id', sa.UUID(), nullable=False),
        sa.Column('section_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=False),
        sa.Column('teacher_staff_id', sa.UUID(), nullable=False),
        sa.Column('period_id', sa.UUID(), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('room_number', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['period_id'], ['periods.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['teacher_staff_id'], ['staff.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('academic_year_id', 'class_id', 'section_id', 'day_of_week', 'period_id', name='uq_timetable_section_slot'),
        sa.UniqueConstraint('academic_year_id', 'teacher_staff_id', 'day_of_week', 'period_id', name='uq_timetable_teacher_slot'),
    )
    op.create_index(op.f('ix_timetable_entries_academic_year_id'), 'timetable_entries', ['academic_year_id'], unique=False)
    op.create_index(op.f('ix_timetable_entries_class_id'), 'timetable_entries', ['class_id'], unique=False)
    op.create_index(op.f('ix_timetable_entries_period_id'), 'timetable_entries', ['period_id'], unique=False)
    op.create_index(op.f('ix_timetable_entries_section_id'), 'timetable_entries', ['section_id'], unique=False)
    op.create_index(op.f('ix_timetable_entries_subject_id'), 'timetable_entries', ['subject_id'], unique=False)
    op.create_index(op.f('ix_timetable_entries_teacher_staff_id'), 'timetable_entries', ['teacher_staff_id'], unique=False)

    # 8. substitutions
    op.create_table(
        'substitutions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('timetable_entry_id', sa.UUID(), nullable=False),
        sa.Column('original_staff_id', sa.UUID(), nullable=False),
        sa.Column('substitute_staff_id', sa.UUID(), nullable=False),
        sa.Column('substitution_date', sa.Date(), nullable=False),
        sa.Column('reason', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'assigned'")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['original_staff_id'], ['staff.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['substitute_staff_id'], ['staff.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['timetable_entry_id'], ['timetable_entries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('timetable_entry_id', 'substitution_date', name='uq_entry_substitution_date'),
    )
    op.create_index(op.f('ix_substitutions_substitute_staff_id'), 'substitutions', ['substitute_staff_id'], unique=False)
    op.create_index(op.f('ix_substitutions_substitution_date'), 'substitutions', ['substitution_date'], unique=False)
    op.create_index(op.f('ix_substitutions_timetable_entry_id'), 'substitutions', ['timetable_entry_id'], unique=False)


def downgrade() -> None:
    op.drop_table('substitutions')
    op.drop_table('timetable_entries')
    op.drop_table('periods')
    op.drop_table('attendance_change_history')
    op.drop_table('attendance_correction_requests')
    op.drop_table('leave_requests')
    op.drop_table('staff_attendance')
    op.drop_table('student_attendance')
