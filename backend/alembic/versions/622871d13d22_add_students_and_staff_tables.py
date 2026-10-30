"""add_students_and_staff_tables

Revision ID: 622871d13d22
Revises: 0f30e845147b
Create Date: 2026-10-29 15:06:45.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '622871d13d22'
down_revision: Union[str, Sequence[str], None] = '0f30e845147b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. enquiries
    op.create_table(
        'enquiries',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('enquiry_number', sa.String(length=50), nullable=False),
        sa.Column('student_name', sa.String(length=150), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('grade_applying_for', sa.String(length=50), nullable=False),
        sa.Column('parent_name', sa.String(length=150), nullable=False),
        sa.Column('parent_phone', sa.String(length=30), nullable=False),
        sa.Column('parent_email', sa.String(length=255), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False, server_default=sa.text("'submitted'")),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('assigned_staff_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['assigned_staff_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_enquiries_enquiry_number'), 'enquiries', ['enquiry_number'], unique=True)
    op.create_index(op.f('ix_enquiries_parent_phone'), 'enquiries', ['parent_phone'], unique=False)

    # 2. students
    op.create_table(
        'students',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('admission_number', sa.String(length=50), nullable=False),
        sa.Column('roll_number', sa.String(length=30), nullable=True),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('gender', sa.String(length=20), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('photo_path', sa.String(length=255), nullable=True),
        sa.Column('admission_date', sa.Date(), nullable=False),
        sa.Column('phone_number', sa.String(length=30), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False, server_default=sa.text("'active'")),
        sa.Column('class_id', sa.UUID(), nullable=False),
        sa.Column('section_id', sa.UUID(), nullable=True),
        sa.Column('academic_year_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index(op.f('ix_students_academic_year_id'), 'students', ['academic_year_id'], unique=False)
    op.create_index(op.f('ix_students_admission_number'), 'students', ['admission_number'], unique=True)
    op.create_index(op.f('ix_students_class_id'), 'students', ['class_id'], unique=False)
    op.create_index(op.f('ix_students_full_name'), 'students', ['full_name'], unique=False)
    op.create_index(op.f('ix_students_section_id'), 'students', ['section_id'], unique=False)

    # 3. guardians
    op.create_table(
        'guardians',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('relationship_type', sa.String(length=50), nullable=False),
        sa.Column('phone_number', sa.String(length=30), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('occupation', sa.String(length=100), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('is_emergency_contact', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index(op.f('ix_guardians_full_name'), 'guardians', ['full_name'], unique=False)
    op.create_index(op.f('ix_guardians_phone_number'), 'guardians', ['phone_number'], unique=False)

    # 4. student_guardians
    op.create_table(
        'student_guardians',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('guardian_id', sa.UUID(), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('can_pickup', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['guardian_id'], ['guardians.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id', 'guardian_id', name='uq_student_guardian_pair'),
    )
    op.create_index(op.f('ix_student_guardians_guardian_id'), 'student_guardians', ['guardian_id'], unique=False)
    op.create_index(op.f('ix_student_guardians_student_id'), 'student_guardians', ['student_id'], unique=False)

    # 5. student_documents
    op.create_table(
        'student_documents',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('document_name', sa.String(length=150), nullable=False),
        sa.Column('document_type', sa.String(length=50), nullable=False),
        sa.Column('file_path', sa.String(length=255), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('uploaded_by_user_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_student_documents_student_id'), 'student_documents', ['student_id'], unique=False)

    # 6. student_status_history
    op.create_table(
        'student_status_history',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('previous_status', sa.String(length=30), nullable=False),
        sa.Column('new_status', sa.String(length=30), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('changed_by_user_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['changed_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_student_status_history_student_id'), 'student_status_history', ['student_id'], unique=False)

    # 7. staff
    op.create_table(
        'staff',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('employee_id', sa.String(length=50), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone_number', sa.String(length=30), nullable=False),
        sa.Column('designation', sa.String(length=100), nullable=False),
        sa.Column('department', sa.String(length=100), nullable=False),
        sa.Column('staff_type', sa.String(length=50), nullable=False, server_default=sa.text("'teaching'")),
        sa.Column('qualification', sa.String(length=150), nullable=True),
        sa.Column('joining_date', sa.Date(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index(op.f('ix_staff_employee_id'), 'staff', ['employee_id'], unique=True)
    op.create_index(op.f('ix_staff_full_name'), 'staff', ['full_name'], unique=False)

    # 8. staff_assignments
    op.create_table(
        'staff_assignments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('staff_id', sa.UUID(), nullable=False),
        sa.Column('class_id', sa.UUID(), nullable=False),
        sa.Column('section_id', sa.UUID(), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=False),
        sa.Column('academic_year_id', sa.UUID(), nullable=False),
        sa.Column('is_primary_teacher', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['staff_id'], ['staff.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'staff_id', 'class_id', 'section_id', 'subject_id', 'academic_year_id',
            name='uq_staff_class_section_subject_year',
        ),
    )
    op.create_index(op.f('ix_staff_assignments_academic_year_id'), 'staff_assignments', ['academic_year_id'], unique=False)
    op.create_index(op.f('ix_staff_assignments_class_id'), 'staff_assignments', ['class_id'], unique=False)
    op.create_index(op.f('ix_staff_assignments_section_id'), 'staff_assignments', ['section_id'], unique=False)
    op.create_index(op.f('ix_staff_assignments_staff_id'), 'staff_assignments', ['staff_id'], unique=False)
    op.create_index(op.f('ix_staff_assignments_subject_id'), 'staff_assignments', ['subject_id'], unique=False)


def downgrade() -> None:
    op.drop_table('staff_assignments')
    op.drop_table('staff')
    op.drop_table('student_status_history')
    op.drop_table('student_documents')
    op.drop_table('student_guardians')
    op.drop_table('guardians')
    op.drop_table('students')
    op.drop_table('enquiries')
