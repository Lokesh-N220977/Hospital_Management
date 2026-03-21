from datetime import datetime, timedelta
from app.database import appointments_collection, users_collection

async def get_overview():
    pipeline = [
        {"$match": {"$or": [{"is_deleted": False}, {"is_deleted": {"$exists": False}}]}},
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]

    result = await appointments_collection.aggregate(pipeline).to_list(length=None)

    data = {
        "total": 0,
        "booked": 0,
        "completed": 0,
        "cancelled": 0,
        "no_show": 0
    }

    for r in result:
        status = r["_id"]
        count = r["count"]
        # Handle the case where a status is not initialized
        if status in data:
            data[status] = count
        else:
            data[status] = count
        data["total"] += count

    return data

async def get_daily_trend(days=7):
    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {
            "$match": {
                "slot_start": {"$gte": start_date},
                "$or": [{"is_deleted": False}, {"is_deleted": {"$exists": False}}]
            }
        },
        {
            "$group": {
                "_id": "$appointment_date", # appointment_date stores string YYYY-MM-DD
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    result = await appointments_collection.aggregate(pipeline).to_list(length=None)

    return [
        {"date": str(r["_id"]), "count": r["count"]}
        for r in result if r["_id"] is not None
    ]

async def get_doctor_workload():
    pipeline = [
        {"$match": {"$or": [{"is_deleted": False}, {"is_deleted": {"$exists": False}}]}},
        {
            "$group": {
                "_id": "$doctor_name", # using name for clearer frontend, doctor_id also ok
                "total": {"$sum": 1},
                "completed": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "completed"]}, 1, 0]
                    }
                },
                "cancelled": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "cancelled"]}, 1, 0]
                    }
                }
            }
        }
    ]

    result = await appointments_collection.aggregate(pipeline).to_list(length=None)

    format_result = []
    for r in result:
        format_result.append({
            "_id": r["_id"] if r["_id"] else "Unknown",
            "total": r["total"],
            "completed": r["completed"],
            "cancelled": r["cancelled"]
        })

    return format_result

async def get_peak_slots():
    pipeline = [
        {"$match": {"$or": [{"is_deleted": False}, {"is_deleted": {"$exists": False}}]}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%H:%M", "date": "$slot_start"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]

    result = await appointments_collection.aggregate(pipeline).to_list(length=None)

    return [
        {"slot": str(r["_id"]), "count": r["count"]}
        for r in result if r["_id"] is not None
    ]

async def get_patient_activity():
    total = await users_collection.count_documents({"role": "patient", "$or": [{"is_deleted": False}, {"is_deleted": {"$exists": False}}]})
    
    # Getting distinct patient_ids directly is faster
    active_patients_list = await appointments_collection.distinct("patient_id")
    active = len(active_patients_list)

    return {
        "total_patients": total,
        "active_patients": active
    }
