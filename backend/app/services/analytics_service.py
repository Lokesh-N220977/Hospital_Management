from datetime import datetime, timedelta
from app.database import users_collection, doctors_collection, appointments_collection, patients_collection
from app.core.logger import logger
from bson import ObjectId

async def get_system_analytics():
    """Legacy/Main dashboard summary."""
    overview_data = await get_system_overview()
    daily_data = await get_daily_trend()
    return {**overview_data, "weekly_trend": daily_data}

async def get_system_overview():
    """Returns basic counts and status distribution."""
    try:
        total_bookings = await appointments_collection.count_documents({})
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = await appointments_collection.aggregate(status_pipeline).to_list(100)
        
        counts = {s["_id"]: s["count"] for s in status_counts if s["_id"]}
        
        return {
            "total": total_bookings,
            "total_appointments": total_bookings,
            "booked": counts.get("booked", 0),
            "completed": counts.get("completed", 0),
            "cancelled": counts.get("cancelled", 0),
            "no_show": counts.get("no_show", 0),
            "status_distribution": counts,
            "total_doctors": await doctors_collection.count_documents({}),
            "total_patients": await patients_collection.count_documents({})
        }
    except Exception as e:
        logger.error(f"Error fetching overview stats: {e}")
        return {}

async def get_daily_trend(days=7):
    """Returns appointment counts for the last X days."""
    try:
        now = datetime.utcnow()
        trend = []
        for i in range(days-1, -1, -1):
            day = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            # Multiple fields might store date
            count = await appointments_collection.count_documents({
                "$or": [{"date": day}, {"appointment_date": day}]
            })
            trend.append({"date": day, "count": count})
        return trend
    except Exception as e:
        logger.error(f"Error fetching daily trend: {e}")
        return []

async def get_doctor_workload():
    """Aggregates total appointments by doctor."""
    try:
        pipeline = [
            {"$group": {"_id": "$doctor_name", "total": {"$sum": 1}}},
            {"$sort": {"total": -1}},
            {"$limit": 10}
        ]
        results = await appointments_collection.aggregate(pipeline).to_list(10)
        # Ensure we have a label if name is missing
        for r in results:
            if not r["_id"]: r["_id"] = "Unknown"
        return results
    except Exception as e:
        logger.error(f"Error fetching doctor workload: {e}")
        return []

async def get_peak_slots():
    """Identifies most booked time slots."""
    try:
        # Extract time part from slot_start if possible, or just use the field if stored as string
        pipeline = [
            {"$group": {"_id": "$time", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 8}
        ]
        # fallback to extracting from slot_start if 'time' field is not reliable
        results = await appointments_collection.aggregate(pipeline).to_list(10)
        return [{"slot": r["_id"] or "Unknown", "count": r["count"]} for r in results]
    except Exception as e:
        logger.error(f"Error fetching peak slots: {e}")
        return []

async def get_department_workload():
    """Aggregates total appointments by doctor specialization (department)."""
    try:
        pipeline = [
            {"$group": {"_id": "$specialization", "total": {"$sum": 1}}},
            {"$sort": {"total": -1}}
        ]
        results = await appointments_collection.aggregate(pipeline).to_list(100)
        # Ensure we have a label if specialization is missing or empty
        processed = []
        for r in results:
            # Grouping _id can be an ObjectId if raw data is inconsistent
            label = str(r["_id"]) if r["_id"] else "General/Other"
            processed.append({"_id": label, "total": r["total"]})
        return processed
    except Exception as e:
        logger.error(f"Error fetching department workload: {e}")
        return []

