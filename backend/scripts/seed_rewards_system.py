import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.student import Student
from app.models.user import User
from app.models.rewards import (
    PointTransaction,
    StudentPointSummary,
    Badge,
    StudentBadge,
    RewardItem,
    RewardRedemption,
)
from app.services.rewards_service import calculate_level


def seed_rewards():
    print("Creating any missing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Badges
        prebuilt_badges = [
            {
                "name": "Perfect Attendance",
                "description": "100% attendance maintained for a full calendar month.",
                "icon_emoji": "🎯",
                "category": "ATTENDANCE",
                "criteria_type": "ATTENDANCE_STREAK",
                "criteria_value": 25,
                "points_reward": 100,
            },
            {
                "name": "Top Scorer",
                "description": "Scored 90% or higher in any term examination subject.",
                "icon_emoji": "📚",
                "category": "ACADEMIC",
                "criteria_type": "EXAM_SCORE",
                "criteria_value": 90,
                "points_reward": 50,
            },
            {
                "name": "Punctuality Star",
                "description": "On time without late check-ins for 30 consecutive school days.",
                "icon_emoji": "⏰",
                "category": "ATTENDANCE",
                "criteria_type": "ATTENDANCE_STREAK",
                "criteria_value": 30,
                "points_reward": 75,
            },
            {
                "name": "Champion Scholar",
                "description": "Reached 2,000 cumulative scholarship achievement points.",
                "icon_emoji": "🏆",
                "category": "SPECIAL",
                "criteria_type": "POINTS_TOTAL",
                "criteria_value": 2000,
                "points_reward": 200,
            },
            {
                "name": "All-Rounder",
                "description": "Scored above 75% in all registered curricular subjects.",
                "icon_emoji": "🌟",
                "category": "ACADEMIC",
                "criteria_type": "EXAM_SCORE",
                "criteria_value": 75,
                "points_reward": 150,
            },
            {
                "name": "On Fire",
                "description": "Achieved distinctions (>90%) across 3 consecutive term tests.",
                "icon_emoji": "🔥",
                "category": "ACADEMIC",
                "criteria_type": "EXAM_SCORE",
                "criteria_value": 90,
                "points_reward": 100,
            },
            {
                "name": "Diamond Attendance",
                "description": "Zero unexcused absences through an entire academic semester.",
                "icon_emoji": "💎",
                "category": "ATTENDANCE",
                "criteria_type": "ATTENDANCE_STREAK",
                "criteria_value": 60,
                "points_reward": 250,
            },
        ]

        badge_map = {}
        for b_data in prebuilt_badges:
            badge = db.query(Badge).filter(Badge.name == b_data["name"]).first()
            if not badge:
                badge = Badge(
                    id=uuid.uuid4(),
                    name=b_data["name"],
                    description=b_data["description"],
                    icon_emoji=b_data["icon_emoji"],
                    category=b_data["category"],
                    criteria_type=b_data["criteria_type"],
                    criteria_value=b_data["criteria_value"],
                    points_reward=b_data["points_reward"],
                    is_active=True,
                )
                db.add(badge)
                db.flush()
                print(f"Created badge: {badge.name}")
            badge_map[badge.name] = badge

        # 2. Seed Reward Store Items
        prebuilt_items = [
            {
                "name": "Canteen Gourmet Meal Combo",
                "description": "Delicious hot chef special meal voucher at the main campus dining hall.",
                "icon_emoji": "🍱",
                "points_cost": 150,
                "category": "CANTEEN",
                "stock": 50,
            },
            {
                "name": "Deluxe Stationery & Art Set",
                "description": "High-grade mechanical pencils, watercolor notebook, and precision geometry kit.",
                "icon_emoji": "✏️",
                "points_cost": 250,
                "category": "STATIONERY",
                "stock": 30,
            },
            {
                "name": "Homework Exemption Pass",
                "description": "A 24-hour deadline extension voucher on any standard homework assignment.",
                "icon_emoji": "🎫",
                "points_cost": 400,
                "category": "PRIVILEGE",
                "stock": 20,
            },
            {
                "name": "Wall of Fame Feature",
                "description": "Featured student portrait and academic profile spotlight on campus digital displays.",
                "icon_emoji": "⭐",
                "points_cost": 600,
                "category": "RECOGNITION",
                "stock": -1,
            },
            {
                "name": "Annual Honors Trophy & Ribbon",
                "description": "Custom engraved gold-plated trophy presented during the annual assembly.",
                "icon_emoji": "🏅",
                "points_cost": 1000,
                "category": "TROPHY",
                "stock": -1,
            },
        ]

        item_map = {}
        for itm in prebuilt_items:
            item = db.query(RewardItem).filter(RewardItem.name == itm["name"]).first()
            if not item:
                item = RewardItem(
                    id=uuid.uuid4(),
                    name=itm["name"],
                    description=itm["description"],
                    icon_emoji=itm["icon_emoji"],
                    points_cost=itm["points_cost"],
                    category=itm["category"],
                    stock=itm["stock"],
                    is_active=True,
                )
                db.add(item)
                db.flush()
                print(f"Created reward item: {item.name}")
            item_map[item.name] = item

        # 3. Seed demo student summaries & badges
        students = db.query(Student).all()
        admin_user = db.query(User).filter(User.username == "admin").first()

        now = datetime.now(timezone.utc)

        for idx, student in enumerate(students):
            # Check if summary already exists
            summary = db.query(StudentPointSummary).filter(StudentPointSummary.student_id == student.id).first()

            if not summary:
                # Custom point distribution:
                # Liam Smith (Grade 1): 1,450 pts (GOLD)
                # Emma Smith (Grade 1): 820 pts (SILVER)
                # First 2 other students: 2,150 pts (CHAMPION) & 1,600 pts (GOLD)
                # Others: staggered between 120 and 700 pts
                if "Liam" in student.full_name:
                    pts = 1450
                elif "Emma" in student.full_name:
                    pts = 820
                elif idx == 2:
                    pts = 2150
                elif idx == 3:
                    pts = 1600
                elif idx == 4:
                    pts = 1120
                else:
                    pts = (idx * 37 + 120) % 950

                level, _, _, _ = calculate_level(pts)

                summary = StudentPointSummary(
                    id=uuid.uuid4(),
                    student_id=student.id,
                    total_points=pts,
                    current_level=level,
                    points_this_month=min(pts, 250),
                    points_this_term=min(pts, 600),
                )
                db.add(summary)
                db.flush()

                # Add some initial transactions
                txs = [
                    PointTransaction(
                        id=uuid.uuid4(),
                        student_id=student.id,
                        points=100,
                        reason="Term Examination Excellence Award",
                        category="EXAM",
                        awarded_by=admin_user.id if admin_user else None,
                        created_at=now - timedelta(days=12),
                    ),
                    PointTransaction(
                        id=uuid.uuid4(),
                        student_id=student.id,
                        points=50,
                        reason="Full Week Perfect Attendance",
                        category="ATTENDANCE",
                        awarded_by=None,
                        created_at=now - timedelta(days=5),
                    ),
                    PointTransaction(
                        id=uuid.uuid4(),
                        student_id=student.id,
                        points=75,
                        reason="Monthly Punctuality Star",
                        category="PUNCTUALITY",
                        awarded_by=admin_user.id if admin_user else None,
                        created_at=now - timedelta(days=2),
                    ),
                ]
                for tx in txs:
                    db.add(tx)

                # Award badges
                badges_to_give = []
                if pts >= 50:
                    badges_to_give.append(badge_map.get("Top Scorer"))
                if pts >= 100:
                    badges_to_give.append(badge_map.get("Perfect Attendance"))
                if pts >= 500:
                    badges_to_give.append(badge_map.get("All-Rounder"))
                if pts >= 800:
                    badges_to_give.append(badge_map.get("Punctuality Star"))
                if pts >= 2000:
                    badges_to_give.append(badge_map.get("Champion Scholar"))

                for b in badges_to_give:
                    if b:
                        sb = StudentBadge(
                            id=uuid.uuid4(),
                            student_id=student.id,
                            badge_id=b.id,
                            notes=f"Achieved badge requirements for {b.name}",
                            awarded_at=now - timedelta(days=7),
                        )
                        db.add(sb)

                # Add a sample redemption for Liam Smith
                if "Liam" in student.full_name and item_map.get("Canteen Gourmet Meal Combo"):
                    redemption = RewardRedemption(
                        id=uuid.uuid4(),
                        student_id=student.id,
                        reward_item_id=item_map["Canteen Gourmet Meal Combo"].id,
                        points_spent=150,
                        status="APPROVED",
                        requested_at=now - timedelta(days=3),
                        processed_at=now - timedelta(days=2),
                        processed_by=admin_user.id if admin_user else None,
                        admin_notes="Coupon delivered to student during homeroom.",
                    )
                    db.add(redemption)

        db.commit()
        print("Successfully seeded rewards system, badges, store items, and student profiles!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding rewards: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_rewards()
