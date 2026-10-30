import math
import uuid
from datetime import datetime, date, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, and_
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.permissions import get_current_user, require_roles
from app.db.dependencies import get_db
from app.models.user import User
from app.models.student import Student, Guardian, StudentGuardian
from app.models.transport import (
    Vehicle,
    Driver,
    TransportRoute,
    RouteStop,
    StudentTransport,
    VehicleTrip,
    VehicleLocationPing,
    TransportAlert,
)

router = APIRouter(prefix="/transport", tags=["GPS Bus Tracking & Transport"])


# ---------------- SCHEMAS ----------------

class VehicleCreate(BaseModel):
    registration_number: str
    capacity: int = 30
    model: Optional[str] = None
    device_id: Optional[str] = None
    insurance_expiry: Optional[date] = None
    fitness_expiry: Optional[date] = None


class DriverCreate(BaseModel):
    full_name: str
    phone_number: str
    license_number: str
    license_expiry: Optional[date] = None


class StopInput(BaseModel):
    name: str
    latitude: float
    longitude: float
    stop_order: int
    planned_time: str  # "HH:MM:SS"


class RouteCreate(BaseModel):
    name: str
    direction: str = "pickup"
    planned_start_time: str
    planned_end_time: str
    vehicle_id: Optional[uuid.UUID] = None
    driver_id: Optional[uuid.UUID] = None
    stops: List[StopInput] = []


class StudentAssignTransport(BaseModel):
    student_id: uuid.UUID
    route_id: uuid.UUID
    stop_id: uuid.UUID
    academic_year_id: uuid.UUID


class LocationPingInput(BaseModel):
    trip_id: uuid.UUID
    latitude: float
    longitude: float
    speed: float = 0.0
    heading: Optional[float] = None
    recorded_at: Optional[datetime] = None


# ---------------- HELPERS ----------------

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# ---------------- FLEET & MASTER DATA ----------------

@router.get("/vehicles", summary="List fleet vehicles")
def list_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator", "principal")),
):
    vehicles = db.execute(select(Vehicle).where(Vehicle.is_active == True)).scalars().all()
    return vehicles


@router.post("/vehicles", status_code=status.HTTP_201_CREATED, summary="Create a new vehicle")
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator")),
):
    vehicle = Vehicle(
        id=uuid.uuid4(),
        registration_number=payload.registration_number.upper(),
        capacity=payload.capacity,
        model=payload.model,
        device_id=payload.device_id,
        insurance_expiry=payload.insurance_expiry,
        fitness_expiry=payload.fitness_expiry,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/drivers", summary="List drivers & attendants")
def list_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator", "principal")),
):
    drivers = db.execute(select(Driver).where(Driver.is_active == True)).scalars().all()
    return drivers


@router.post("/drivers", status_code=status.HTTP_201_CREATED, summary="Create a new driver")
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator")),
):
    driver = Driver(
        id=uuid.uuid4(),
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        license_number=payload.license_number,
        license_expiry=payload.license_expiry,
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


# ---------------- ROUTES & STOPS ----------------

@router.get("/routes", summary="List all routes with stops")
def list_routes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    routes = (
        db.execute(
            select(TransportRoute)
            .options(
                selectinload(TransportRoute.vehicle),
                selectinload(TransportRoute.driver),
                selectinload(TransportRoute.stops),
            )
            .where(TransportRoute.is_active == True)
        )
        .scalars()
        .all()
    )
    return routes


@router.post("/routes", status_code=status.HTTP_201_CREATED, summary="Create a new route with stops")
def create_route(
    payload: RouteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator")),
):
    from datetime import time as dt_time
    s_parts = [int(p) for p in payload.planned_start_time.split(":")]
    e_parts = [int(p) for p in payload.planned_end_time.split(":")]

    route = TransportRoute(
        id=uuid.uuid4(),
        name=payload.name,
        direction=payload.direction,
        planned_start_time=dt_time(*s_parts),
        planned_end_time=dt_time(*e_parts),
        vehicle_id=payload.vehicle_id,
        driver_id=payload.driver_id,
    )
    db.add(route)
    db.flush()

    for s in payload.stops:
        p_parts = [int(p) for p in s.planned_time.split(":")]
        stop = RouteStop(
            id=uuid.uuid4(),
            route_id=route.id,
            name=s.name,
            latitude=s.latitude,
            longitude=s.longitude,
            stop_order=s.stop_order,
            planned_time=dt_time(*p_parts),
        )
        db.add(stop)

    db.commit()
    db.refresh(route)
    return route


@router.post("/assignments", status_code=status.HTTP_201_CREATED, summary="Assign student to route and stop")
def assign_student_transport(
    payload: StudentAssignTransport,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator")),
):
    # Check existing assignment
    existing = db.execute(
        select(StudentTransport).where(
            StudentTransport.student_id == payload.student_id,
            StudentTransport.academic_year_id == payload.academic_year_id,
        )
    ).scalar_one_or_none()

    if existing:
        existing.route_id = payload.route_id
        existing.stop_id = payload.stop_id
        existing.is_active = True
        db.commit()
        return existing

    assignment = StudentTransport(
        id=uuid.uuid4(),
        student_id=payload.student_id,
        route_id=payload.route_id,
        stop_id=payload.stop_id,
        academic_year_id=payload.academic_year_id,
        is_active=True,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


# ---------------- TRIP LIFECYCLE & LIVE TRACKING ----------------

@router.post("/trips/{route_id}/start", summary="Start a daily trip (driver or coordinator)")
def start_trip(
    route_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator", "driver", "teacher")),
):
    route = db.execute(select(TransportRoute).where(TransportRoute.id == route_id)).scalar_one_or_none()
    if not route:
        raise AppError(message="Route not found", status_code=404)

    today = date.today()
    # Check existing active trip for this route today
    trip = db.execute(
        select(VehicleTrip).where(
            VehicleTrip.route_id == route_id,
            VehicleTrip.trip_date == today,
            VehicleTrip.status == "started",
        )
    ).scalar_one_or_none()

    if not trip:
        first_stop = db.execute(
            select(RouteStop).where(RouteStop.route_id == route_id).order_by(RouteStop.stop_order)
        ).scalars().first()

        trip = VehicleTrip(
            id=uuid.uuid4(),
            route_id=route_id,
            vehicle_id=route.vehicle_id,
            driver_id=route.driver_id,
            trip_date=today,
            status="started",
            started_at=datetime.now(timezone.utc),
            current_lat=first_stop.latitude if first_stop else 12.9716,
            current_lng=first_stop.longitude if first_stop else 77.5946,
            last_ping_at=datetime.now(timezone.utc),
            current_speed=25.0,
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)

    return {"message": "Trip started successfully", "trip_id": trip.id, "status": trip.status}


@router.post("/trips/{trip_id}/end", summary="End an active trip")
def end_trip(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator", "driver")),
):
    trip = db.execute(select(VehicleTrip).where(VehicleTrip.id == trip_id)).scalar_one_or_none()
    if not trip:
        raise AppError(message="Trip not found", status_code=404)

    trip.status = "completed"
    trip.ended_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Trip completed successfully", "trip_id": trip.id, "status": trip.status}


@router.post("/location", summary="Ingest vehicle location ping (Driver mobile or GPS tracker)")
def ingest_location(
    payload: LocationPingInput,
    db: Session = Depends(get_db),
):
    trip = db.execute(select(VehicleTrip).where(VehicleTrip.id == payload.trip_id)).scalar_one_or_none()
    if not trip:
        raise AppError(message="Trip not found", status_code=404)

    now = payload.recorded_at or datetime.now(timezone.utc)

    # 1. Update trip current position
    trip.current_lat = payload.latitude
    trip.current_lng = payload.longitude
    trip.current_speed = payload.speed
    trip.last_ping_at = now

    # 2. Record historical ping
    ping = VehicleLocationPing(
        id=uuid.uuid4(),
        trip_id=payload.trip_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        speed=payload.speed,
        heading=payload.heading,
        recorded_at=now,
    )
    db.add(ping)

    # 3. Geofence Check: Are we near any stops?
    route_stops = db.execute(
        select(RouteStop).where(RouteStop.route_id == trip.route_id)
    ).scalars().all()

    for stop in route_stops:
        dist_km = haversine_distance(payload.latitude, payload.longitude, stop.latitude, stop.longitude)
        if dist_km <= 0.5:  # within 500 meters
            # Trigger approaching stop alert if not already logged recently
            existing_alert = db.execute(
                select(TransportAlert).where(
                    TransportAlert.trip_id == trip.id,
                    TransportAlert.alert_type == f"approaching_stop_{stop.id}",
                )
            ).scalar_one_or_none()
            if not existing_alert:
                alert = TransportAlert(
                    id=uuid.uuid4(),
                    trip_id=trip.id,
                    alert_type=f"approaching_stop_{stop.id}",
                    title="Bus Approaching Stop",
                    message=f"Bus is approximately {int(dist_km * 1000)}m away from stop '{stop.name}'.",
                )
                db.add(alert)

    db.commit()
    return {"status": "ok", "trip_id": trip.id, "received_at": now.isoformat()}


@router.get("/live", summary="Get live fleet map positions for all active vehicles")
def get_live_fleet(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("super_admin", "school_admin", "transport_coordinator", "principal", "driver")),
):
    active_trips = (
        db.execute(
            select(VehicleTrip)
            .options(
                selectinload(VehicleTrip.route).selectinload(TransportRoute.stops),
                selectinload(VehicleTrip.vehicle),
                selectinload(VehicleTrip.driver),
            )
            .where(VehicleTrip.status == "started")
        )
        .scalars()
        .all()
    )

    results = []
    now = datetime.now(timezone.utc)
    for t in active_trips:
        is_stale = False
        if t.last_ping_at:
            delta_seconds = (now - t.last_ping_at.replace(tzinfo=timezone.utc) if t.last_ping_at.tzinfo is None else now - t.last_ping_at).total_seconds()
            if delta_seconds > 60:
                is_stale = True

        results.append({
            "trip_id": t.id,
            "route_name": t.route.name if t.route else "Unknown Route",
            "direction": t.route.direction if t.route else "pickup",
            "vehicle_reg": t.vehicle.registration_number if t.vehicle else "N/A",
            "driver_name": t.driver.full_name if t.driver else "Assigned Driver",
            "driver_phone": t.driver.phone_number if t.driver else "N/A",
            "current_lat": t.current_lat,
            "current_lng": t.current_lng,
            "current_speed": t.current_speed,
            "is_stale": is_stale,
            "last_ping_at": t.last_ping_at,
            "stops": [
                {
                    "name": s.name,
                    "lat": s.latitude,
                    "lng": s.longitude,
                    "order": s.stop_order,
                    "time": s.planned_time.strftime("%H:%M"),
                }
                for s in (t.route.stops if t.route else [])
            ],
        })
    return results


# ---------------- PARENT & STUDENT ACCESS CONTROL ----------------

@router.get("/my-child/{student_id}", summary="Strict parent view of their linked child's bus")
def get_parent_child_bus(
    student_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Enforce Parent-Child Relationship Check
    user_roles = [ur.role.name for ur in current_user.user_roles if ur.role]
    is_staff = any(r in ("super_admin", "school_admin", "transport_coordinator", "principal") for r in user_roles)

    if not is_staff:
        # Check if user is linked parent or the student themselves
        guardian = db.execute(select(Guardian).where(Guardian.user_id == current_user.id)).scalar_one_or_none()
        is_linked = False
        if guardian:
            link = db.execute(
                select(StudentGuardian).where(
                    StudentGuardian.student_id == student_id,
                    StudentGuardian.guardian_id == guardian.id,
                )
            ).scalar_one_or_none()
            if link:
                is_linked = True

        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
        if student and student.user_id == current_user.id:
            is_linked = True

        if not is_linked:
            raise AppError(
                message="Access denied. You may only view transport tracking for your verified linked children.",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code="CHILD_ACCESS_DENIED",
            )

    # 2. Lookup transport assignment
    assignment = (
        db.execute(
            select(StudentTransport)
            .options(
                selectinload(StudentTransport.route).selectinload(TransportRoute.stops),
                selectinload(StudentTransport.route).selectinload(TransportRoute.vehicle),
                selectinload(StudentTransport.route).selectinload(TransportRoute.driver),
                selectinload(StudentTransport.stop),
            )
            .where(StudentTransport.student_id == student_id, StudentTransport.is_active == True)
        )
        .scalars()
        .first()
    )

    if not assignment or not assignment.route:
        return {
            "has_transport": False,
            "message": "Student is not enrolled in school bus transportation for the current academic session.",
        }

    # 3. Find active or today's trip
    trip = db.execute(
        select(VehicleTrip).where(
            VehicleTrip.route_id == assignment.route_id,
            VehicleTrip.trip_date == date.today(),
            VehicleTrip.status == "started",
        )
    ).scalar_one_or_none()

    eta_minutes = None
    is_stale = False
    current_lat = None
    current_lng = None

    if trip and trip.current_lat and trip.current_lng and assignment.stop:
        dist_km = haversine_distance(trip.current_lat, trip.current_lng, assignment.stop.latitude, assignment.stop.longitude)
        # Average bus speed in city ~ 25 km/h
        avg_speed = max(trip.current_speed or 20.0, 15.0)
        eta_minutes = round((dist_km / avg_speed) * 60)
        current_lat = trip.current_lat
        current_lng = trip.current_lng

        if trip.last_ping_at:
            now = datetime.now(timezone.utc)
            delta = (now - trip.last_ping_at.replace(tzinfo=timezone.utc) if trip.last_ping_at.tzinfo is None else now - trip.last_ping_at).total_seconds()
            if delta > 60:
                is_stale = True

    return {
        "has_transport": True,
        "route_name": assignment.route.name,
        "direction": assignment.route.direction,
        "vehicle_registration": assignment.route.vehicle.registration_number if assignment.route.vehicle else "BUS-01",
        "driver_name": assignment.route.driver.full_name if assignment.route.driver else "Staff Driver",
        "driver_phone": assignment.route.driver.phone_number if assignment.route.driver else "N/A",
        "student_stop_name": assignment.stop.name if assignment.stop else "Assigned Stop",
        "planned_stop_time": assignment.stop.planned_time.strftime("%H:%M") if assignment.stop else "N/A",
        "trip_active": trip is not None,
        "trip_status": trip.status if trip else "scheduled",
        "bus_current_lat": current_lat,
        "bus_current_lng": current_lng,
        "eta_minutes": eta_minutes,
        "is_stale": is_stale,
    }
