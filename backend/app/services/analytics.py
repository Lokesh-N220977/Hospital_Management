async def doctor_workload(appointments_collection, doctor_id):

    total = await appointments_collection.count_documents(
        {"doctor_id": doctor_id}
    )

    completed = await appointments_collection.count_documents(
        {"doctor_id": doctor_id, "status": "completed"}
    )

    pending = total - completed

    return {
        "total": total,
        "completed": completed,
        "pending": pending
    }