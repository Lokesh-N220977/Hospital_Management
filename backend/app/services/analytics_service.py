from datetime import datetime, timedelta
from app.database import users_collection, doctors_collection, appointments_collection
from app.core.logger import logger

async def get_system_analytics():
    logger.info("Fetching system analytics")
    today = datetime.now().strftime("%Y-%m-%d")
    
    total_doctors = await doctors_collection.count_documents({})
    total_patients = await users_collection.count_documents({"role": "patient"})
    total_appointments = await appointments_collection.count_documents({})
    today_appointments = await appointments_collection.count_documents({"date": today})
    
    # Status distribution
    status_counts = await appointments_collection.aggregate([
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]).to_list(length=10)
    
    # Last 7 days trend
    trend = []
    for i in range(6, -1, -1):
        day = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        count = await appointments_collection.count_documents({"date": day})
        trend.append({"date": day, "count": count})
        
    return {
        "total_doctors": total_doctors,
        "total_patients": total_patients,
        "total_appointments": total_appointments,
        "today_appointments": today_appointments,
        "status_distribution": {s["_id"]: s["count"] for s in status_counts},
        "weekly_trend": trend
    }

