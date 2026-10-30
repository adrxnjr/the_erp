import uuid
from datetime import datetime, date, time
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Vehicle(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    School bus and transport fleet master record.
    """
    __tablename__ = "vehicles"

    registration_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    device_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True)
    insurance_expiry: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fitness_expiry: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    routes: Mapped[List["TransportRoute"]] = relationship("TransportRoute", back_populates="vehicle")
    trips: Mapped[List["VehicleTrip"]] = relationship("VehicleTrip", back_populates="vehicle")

    def __repr__(self) -> str:
        return f"<Vehicle {self.registration_number} (Capacity: {self.capacity})>"


class Driver(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Driver and vehicle attendant master record.
    Optionally links to a User account for driver mobile login.
    """
    __tablename__ = "drivers"

    full_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    phone_number: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    license_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    license_expiry: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True
    )

    # Relationships
    routes: Mapped[List["TransportRoute"]] = relationship("TransportRoute", back_populates="driver")
    trips: Mapped[List["VehicleTrip"]] = relationship("VehicleTrip", back_populates="driver")

    def __repr__(self) -> str:
        return f"<Driver {self.full_name} ({self.phone_number})>"


class TransportRoute(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Reusable daily route plan (e.g. Route 1 Morning Pick-up, Route 1 Evening Drop).
    """
    __tablename__ = "transport_routes"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    direction: Mapped[str] = mapped_column(String(20), default="pickup", nullable=False)  # pickup, drop
    planned_start_time: Mapped[time] = mapped_column(Time, nullable=False)
    planned_end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    vehicle_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    driver_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Relationships
    vehicle: Mapped[Optional["Vehicle"]] = relationship("Vehicle", back_populates="routes")
    driver: Mapped[Optional["Driver"]] = relationship("Driver", back_populates="routes")
    stops: Mapped[List["RouteStop"]] = relationship(
        "RouteStop", back_populates="route", cascade="all, delete-orphan", order_by="RouteStop.stop_order"
    )
    student_assignments: Mapped[List["StudentTransport"]] = relationship(
        "StudentTransport", back_populates="route"
    )
    trips: Mapped[List["VehicleTrip"]] = relationship("VehicleTrip", back_populates="route")

    def __repr__(self) -> str:
        return f"<TransportRoute {self.name} ({self.direction})>"


class RouteStop(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Ordered stop along a transport route with GPS coordinates and scheduled time.
    """
    __tablename__ = "route_stops"
    __table_args__ = (
        UniqueConstraint("route_id", "stop_order", name="uq_route_stop_order"),
    )

    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transport_routes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    stop_order: Mapped[int] = mapped_column(Integer, nullable=False)
    planned_time: Mapped[time] = mapped_column(Time, nullable=False)

    # Relationships
    route: Mapped["TransportRoute"] = relationship("TransportRoute", back_populates="stops")
    assigned_students: Mapped[List["StudentTransport"]] = relationship(
        "StudentTransport", back_populates="stop"
    )

    def __repr__(self) -> str:
        return f"<RouteStop #{self.stop_order} {self.name}>"


class StudentTransport(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Maps student to an active route and pickup/drop stop for an academic year.
    Drives parent portal bus visibility and transport fee calculation.
    """
    __tablename__ = "student_transport"
    __table_args__ = (
        UniqueConstraint("student_id", "academic_year_id", name="uq_student_transport_year"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transport_routes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stop_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("route_stops.id", ondelete="CASCADE"), nullable=False, index=True
    )
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    student = relationship("Student", backref="transport_assignment")
    route: Mapped["TransportRoute"] = relationship("TransportRoute", back_populates="student_assignments")
    stop: Mapped["RouteStop"] = relationship("RouteStop", back_populates="assigned_students")


class VehicleTrip(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Single run of a route on a specific date (scheduled -> started -> completed / cancelled).
    """
    __tablename__ = "vehicle_trips"

    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transport_routes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vehicle_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    driver_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    trip_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), default="scheduled", nullable=False)  # scheduled, started, completed, cancelled
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    current_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    current_lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    last_ping_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    current_speed: Mapped[Optional[float]] = mapped_column(Float, default=0.0, nullable=True)

    # Relationships
    route: Mapped["TransportRoute"] = relationship("TransportRoute", back_populates="trips")
    vehicle: Mapped[Optional["Vehicle"]] = relationship("Vehicle", back_populates="trips")
    driver: Mapped[Optional["Driver"]] = relationship("Driver", back_populates="trips")
    locations: Mapped[List["VehicleLocationPing"]] = relationship(
        "VehicleLocationPing", back_populates="trip", cascade="all, delete-orphan"
    )
    alerts: Mapped[List["TransportAlert"]] = relationship(
        "TransportAlert", back_populates="trip", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<VehicleTrip {self.id} route={self.route_id} status={self.status}>"


class VehicleLocationPing(Base, UUIDPrimaryKeyMixin):
    """
    High-frequency GPS location pings from driver device or GPS hardware.
    """
    __tablename__ = "vehicle_location_pings"
    __table_args__ = (
        Index("ix_pings_trip_recorded", "trip_id", "recorded_at"),
    )

    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicle_trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    speed: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    heading: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    trip: Mapped["VehicleTrip"] = relationship("VehicleTrip", back_populates="locations")


class TransportAlert(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Generated geofence, approaching stop, delayed, or speed alerts.
    """
    __tablename__ = "transport_alerts"

    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicle_trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)  # approaching_stop, arrived_school, late_start, route_deviation, long_halt
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_acknowledged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    acknowledged_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    trip: Mapped["VehicleTrip"] = relationship("VehicleTrip", back_populates="alerts")
