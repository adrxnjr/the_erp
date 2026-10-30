import sys
import os
import uuid
from datetime import datetime, date, time, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.academic import AcademicYear
from app.models.student import Student
from app.models.transport import (
    Vehicle,
    Driver,
    TransportRoute,
    RouteStop,
    StudentTransport,
    VehicleTrip,
)
from app.models.career import CareerField, CareerCourse, AssessmentQuestion
from app.routers.career import DEFAULT_CAREER_FIELDS, DEFAULT_QUESTIONS

def seed_transport_and_career():
    db = SessionLocal()
    try:
        print("[*] Seeding transport fleet, drivers, routes, and career data...")

        # 1. Vehicles
        v1 = db.execute(select(Vehicle).where(Vehicle.registration_number == "KA-01-EA-4921")).scalar_one_or_none()
        if not v1:
            v1 = Vehicle(
                id=uuid.uuid4(),
                registration_number="KA-01-EA-4921",
                capacity=35,
                model="Tata Starbus Ultra",
                device_id="GPS-98214",
                is_active=True,
            )
            db.add(v1)

        v2 = db.execute(select(Vehicle).where(Vehicle.registration_number == "KA-01-EA-4922")).scalar_one_or_none()
        if not v2:
            v2 = Vehicle(
                id=uuid.uuid4(),
                registration_number="KA-01-EA-4922",
                capacity=40,
                model="Ashok Leyland Sunshine",
                device_id="GPS-98215",
                is_active=True,
            )
            db.add(v2)
        db.flush()

        # 2. Drivers
        d1 = db.execute(select(Driver).where(Driver.phone_number == "9876543210")).scalar_one_or_none()
        if not d1:
            d1 = Driver(
                id=uuid.uuid4(),
                full_name="Ramesh Kumar",
                phone_number="9876543210",
                license_number="DL-04-2015-8841",
                is_active=True,
            )
            db.add(d1)

        d2 = db.execute(select(Driver).where(Driver.phone_number == "9876543211")).scalar_one_or_none()
        if not d2:
            d2 = Driver(
                id=uuid.uuid4(),
                full_name="Suresh Gowda",
                phone_number="9876543211",
                license_number="DL-04-2018-9123",
                is_active=True,
            )
            db.add(d2)
        db.flush()

        # 3. Routes & Stops
        r1 = db.execute(select(TransportRoute).where(TransportRoute.name == "Route 1 - Indiranagar to Campus")).scalar_one_or_none()
        if not r1:
            r1 = TransportRoute(
                id=uuid.uuid4(),
                name="Route 1 - Indiranagar to Campus",
                direction="pickup",
                planned_start_time=time(7, 0, 0),
                planned_end_time=time(8, 15, 0),
                vehicle_id=v1.id,
                driver_id=d1.id,
                is_active=True,
            )
            db.add(r1)
            db.flush()

            stops_data = [
                ("City Central Bus Terminus", 12.9716, 77.5946, 1, time(7, 10, 0)),
                ("Indiranagar Metro Station", 12.9784, 77.6408, 2, time(7, 35, 0)),
                ("Ever Grow Main Campus Gate", 12.9902, 77.6875, 3, time(8, 0, 0)),
            ]
            for s_name, lat, lng, order, p_time in stops_data:
                stop = RouteStop(
                    id=uuid.uuid4(),
                    route_id=r1.id,
                    name=s_name,
                    latitude=lat,
                    longitude=lng,
                    stop_order=order,
                    planned_time=p_time,
                )
                db.add(stop)
            db.flush()

        # 4. Assign student 1 & student 2 to Route 1
        active_year = db.execute(select(AcademicYear).where(AcademicYear.is_active == True)).scalars().first()
        students = db.execute(select(Student).order_by(Student.admission_number)).scalars().all()

        first_stop = db.execute(select(RouteStop).where(RouteStop.route_id == r1.id).order_by(RouteStop.stop_order)).scalars().first()

        if active_year and first_stop and len(students) > 0:
            for std in students[:3]:
                existing_assign = db.execute(select(StudentTransport).where(StudentTransport.student_id == std.id)).scalar_one_or_none()
                if not existing_assign:
                    assignment = StudentTransport(
                        id=uuid.uuid4(),
                        student_id=std.id,
                        route_id=r1.id,
                        stop_id=first_stop.id,
                        academic_year_id=active_year.id,
                        is_active=True,
                    )
                    db.add(assignment)

        # 5. Start an active demo trip for Route 1 today so live map is immediately alive
        today = date.today()
        trip = db.execute(
            select(VehicleTrip).where(
                VehicleTrip.route_id == r1.id,
                VehicleTrip.trip_date == today,
                VehicleTrip.status == "started",
            )
        ).scalar_one_or_none()

        if not trip:
            trip = VehicleTrip(
                id=uuid.uuid4(),
                route_id=r1.id,
                vehicle_id=v1.id,
                driver_id=d1.id,
                trip_date=today,
                status="started",
                started_at=datetime.now(timezone.utc),
                current_lat=12.9750,
                current_lng=77.6180,
                last_ping_at=datetime.now(timezone.utc),
                current_speed=32.0,
            )
            db.add(trip)

        # 6. Seed Career Questions & Fields
        q_count = db.execute(select(AssessmentQuestion)).scalars().all()
        if not q_count:
            for q_text, i_type, order in DEFAULT_QUESTIONS:
                q = AssessmentQuestion(
                    id=uuid.uuid4(),
                    question_text=q_text,
                    interest_type=i_type,
                    order_num=order,
                    is_active=True,
                )
                db.add(q)

        f_count = db.execute(select(CareerField)).scalars().all()
        if not f_count:
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
        print("[SUCCESS] Transport fleet, route, active trip, and career catalogue successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_transport_and_career()
