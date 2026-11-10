import os
import sys
import uuid
import json
from pathlib import Path
from datetime import date, time, datetime

os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from sqlalchemy import select, delete
from app.db.session import SessionLocal, engine
from app.core.security import hash_password
from app.models.user import Role, User, UserRole
from app.models.academic import AcademicYear, ClassRoom, Section, Subject, ClassSubject
from app.models.student import Student, Guardian, StudentGuardian
from app.models.staff import Staff, StaffAssignment
from app.models.timetable import Period, TimetableEntry

def seed():
    json_path = backend_dir.parent / "frontend" / "src" / "data" / "schoolData.json"
    if not json_path.exists():
        print(f"Error: {json_path} does not exist!")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data.get("meta", {})
    teachers_data = data.get("teachers", [])
    students_data = data.get("students", [])
    parents_data = data.get("parents", [])
    timetable_data = data.get("timetable", [])

    print(f"Loaded: {len(teachers_data)} teachers, {len(students_data)} students, {len(parents_data)} parents, {len(timetable_data)} timetable slots.")

    db = SessionLocal()
    try:
        # 1. Academic Year
        ay = db.execute(select(AcademicYear).where(AcademicYear.is_active == True)).scalars().first()
        if not ay:
            ay = db.execute(select(AcademicYear)).scalars().first()
        if not ay:
            ay = AcademicYear(
                name="2026-2027",
                start_date=date(2026, 6, 1),
                end_date=date(2027, 4, 30),
                is_active=True
            )
            db.add(ay)
            db.flush()
        print(f"Academic Year: {ay.name} (ID: {ay.id})")

        # 2. Roles
        teacher_role = db.execute(select(Role).where(Role.name == "teacher")).scalars().first()
        student_role = db.execute(select(Role).where(Role.name == "student")).scalars().first()
        parent_role = db.execute(select(Role).where(Role.name == "parent")).scalars().first()

        # 3. Classes and Sections
        # Classes: 10-A, 10-B, 10-C.
        # Let's create Grade 10 ClassRoom, and Sections: A, B, C
        grade_10 = db.execute(select(ClassRoom).where(ClassRoom.name == "Grade 10")).scalars().first()
        if not grade_10:
            grade_10 = ClassRoom(name="Grade 10", level=10)
            db.add(grade_10)
            db.flush()

        sections = {}
        for sec_name in ["A", "B", "C"]:
            sec = db.execute(select(Section).where(Section.class_id == grade_10.id, Section.name == sec_name)).scalars().first()
            if not sec:
                sec = Section(name=sec_name, class_id=grade_10.id, capacity=50)
                db.add(sec)
                db.flush()
            sections[sec_name] = sec
            sections[f"10-{sec_name}"] = sec

        # Also map ClassRoom "10-A", "10-B", "10-C" if needed directly
        for cls_name in ["10-A", "10-B", "10-C"]:
            c_obj = db.execute(select(ClassRoom).where(ClassRoom.name == cls_name)).scalars().first()
            if not c_obj:
                c_obj = ClassRoom(name=cls_name, level=10)
                db.add(c_obj)
                db.flush()
            # and section A for it
            sec_obj = db.execute(select(Section).where(Section.class_id == c_obj.id)).scalars().first()
            if not sec_obj:
                sec_obj = Section(name=cls_name.split("-")[1], class_id=c_obj.id, capacity=50)
                db.add(sec_obj)
                db.flush()

        # 4. Subjects
        subject_objs = {}
        for subj_name in meta.get("subjects", []):
            code = subj_name.upper()[:4]
            subj = db.execute(select(Subject).where((Subject.name == subj_name) | (Subject.code == code))).scalars().first()
            if not subj:
                # generate unique code if code collision
                existing_code = db.execute(select(Subject).where(Subject.code == code)).scalars().first()
                if existing_code:
                    code = f"{subj_name.upper()[:3]}_{uuid.uuid4().hex[:2].upper()}"
                subj = Subject(name=subj_name, code=code)
                db.add(subj)
                db.flush()
            subject_objs[subj_name] = subj

        # 5. Periods
        period_objs = {}
        for idx, p_time in enumerate(meta.get("periods", []), start=1):
            start_str, end_str = p_time.split("-")
            sh, sm = map(int, start_str.split(":"))
            eh, em = map(int, end_str.split(":"))
            p_obj = db.execute(select(Period).where(Period.period_number == idx)).scalars().first()
            if not p_obj:
                p_obj = Period(
                    name=f"Period {idx}",
                    period_number=idx,
                    start_time=time(sh, sm),
                    end_time=time(eh, em),
                    is_break=False
                )
                db.add(p_obj)
                db.flush()
            else:
                p_obj.start_time = time(sh, sm)
                p_obj.end_time = time(eh, em)
                p_obj.name = f"Period {idx}"
                db.flush()
            period_objs[idx] = p_obj

        # 6. Teachers
        teacher_map = {}
        for t in teachers_data:
            t_id = t["teacher_id"]
            name = t["name"]
            phone = t["phone"]
            email = t["email"]
            qualification = t["qualification"]
            subject = t["subject"]

            # User account
            username = email.split("@")[0].replace(".", "_")
            user = db.execute(select(User).where(User.email == email)).scalars().first()
            if not user:
                user = User(
                    email=email,
                    username=username,
                    hashed_password=hash_password("123"),
                    full_name=name,
                    phone_number=phone,
                    portal_type="staff",
                    is_active=True
                )
                db.add(user)
                db.flush()
                if teacher_role:
                    db.add(UserRole(user_id=user.id, role_id=teacher_role.id))

            # Staff
            staff = db.execute(select(Staff).where(Staff.employee_id == t_id)).scalars().first()
            if not staff:
                staff = Staff(
                    user_id=user.id,
                    employee_id=t_id,
                    full_name=name,
                    email=email,
                    phone_number=phone,
                    department=subject,
                    designation=f"Subject Teacher - {subject}",
                    qualification=qualification,
                    joining_date=date(2022, 6, 1)
                )
                db.add(staff)
                db.flush()
            teacher_map[t_id] = staff

        # 7. Students & Parents
        student_id_map = {}
        for s in students_data:
            adm_no = s["admission_no"]
            s_id = s["student_id"]
            name = s["name"]
            gender = s["gender"]
            class_sec = s["class_section"]
            roll_no = s["roll_no"]
            dob_parts = list(map(int, s["dob"].split("-")))
            sec_letter = class_sec.split("-")[1]
            sec_obj = sections.get(sec_letter) or sections.get(class_sec)

            std = db.execute(select(Student).where(Student.admission_number == adm_no)).scalars().first()
            if not std:
                std = Student(
                    admission_number=adm_no,
                    full_name=name,
                    date_of_birth=date(dob_parts[0], dob_parts[1], dob_parts[2]),
                    gender="male" if gender == "M" else "female",
                    class_id=grade_10.id,
                    section_id=sec_obj.id if sec_obj else None,
                    academic_year_id=ay.id,
                    admission_date=date(2026, 6, 1),
                    status="active"
                )
                db.add(std)
                db.flush()
            student_id_map[s_id] = std

        # Parents / Guardians
        for p in parents_data:
            p_id = p["parent_id"]
            p_name = p["name"]
            p_rel = p["relation"].lower()
            p_phone = p["phone"]
            p_occ = p.get("occupation")
            email = f"{p_name.lower().replace(' ', '')}.{p_id.lower()}@evergrow.demo"

            g = db.execute(select(Guardian).where(Guardian.phone_number == p_phone)).scalars().first()
            if not g:
                g = Guardian(
                    full_name=p_name,
                    relationship_type=p_rel,
                    phone_number=p_phone,
                    email=email,
                    occupation=p_occ,
                    is_emergency_contact=True
                )
                db.add(g)
                db.flush()

            # Link to students
            for linked_sid in p.get("student_ids", []):
                std_obj = student_id_map.get(linked_sid)
                if std_obj:
                    sg = db.execute(
                        select(StudentGuardian).where(
                            StudentGuardian.student_id == std_obj.id,
                            StudentGuardian.guardian_id == g.id
                        )
                    ).scalars().first()
                    if not sg:
                        sg = StudentGuardian(
                            student_id=std_obj.id,
                            guardian_id=g.id,
                            is_primary=True,
                            can_pickup=True
                        )
                        db.add(sg)
        db.flush()

        # 8. Timetable
        day_map = {
            "Monday": 0,
            "Tuesday": 1,
            "Wednesday": 2,
            "Thursday": 3,
            "Friday": 4
        }
        # Clear existing entries for Grade 10 to prevent collision
        db.execute(delete(TimetableEntry).where(TimetableEntry.class_id == grade_10.id))
        db.commit()

        count_tt = 0
        for entry in timetable_data:
            class_sec = entry["class_section"]
            sec_letter = class_sec.split("-")[1]
            sec_obj = sections.get(sec_letter)
            day_str = entry["day"]
            day_idx = day_map.get(day_str, 0)
            p_idx = entry["period"]
            p_obj = period_objs.get(p_idx)
            subj_obj = subject_objs.get(entry["subject"])
            staff_obj = teacher_map.get(entry["teacher_id"])

            if sec_obj and p_obj and subj_obj and staff_obj:
                tt = TimetableEntry(
                    academic_year_id=ay.id,
                    class_id=grade_10.id,
                    section_id=sec_obj.id,
                    subject_id=subj_obj.id,
                    teacher_staff_id=staff_obj.id,
                    period_id=p_obj.id,
                    day_of_week=day_idx,
                    room_number=f"Room {class_sec}"
                )
                db.add(tt)
                count_tt += 1

        db.commit()
        print(f"Seeding completed successfully! Inserted {count_tt} timetable entries.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
