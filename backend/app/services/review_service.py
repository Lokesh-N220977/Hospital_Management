from datetime import datetime
from app.database.collections import reviews_collection, appointments_collection, doctors_collection, patients_collection
from app.models.review_model import ReviewCreate
import uuid
from bson import ObjectId

async def create_review(data: ReviewCreate, current_user):
    # 1. Get appointment
    try:
        obj_id = ObjectId(data.appointment_id)
    except:
        raise Exception("Invalid appointment ID format")

    appointment = await appointments_collection.find_one({
        "_id": obj_id
    })

    if not appointment:
        raise Exception("Appointment not found")

    # 2. Validate ownership
    # Appointment's patient must belong to current_user
    patient_id = str(appointment["patient_id"])
    user_id = str(current_user["_id"])
    
    patient = await patients_collection.find_one({"_id": ObjectId(patient_id)})
    
    if not patient or str(patient.get("user_id")) != user_id:
        raise Exception("Unauthorized: You can only review your own appointments")

    # 3. Check status
    if appointment.get("status") != "completed":
        raise Exception(f"Cannot review before completion (current: {appointment.get('status')})")

    # 4. Prevent duplicate
    existing = await reviews_collection.find_one({
        "appointment_id": data.appointment_id
    })

    if existing:
        raise Exception("Review already exists for this appointment")

    # 5. Create review
    review = {
        "patient_id": user_id,
        "doctor_id": appointment["doctor_id"],
        "appointment_id": data.appointment_id,
        "rating": data.rating,
        "comment": data.comment,
        "created_at": datetime.utcnow()
    }

    await reviews_collection.insert_one(review)

    # 6. Update appointment to mark as reviewed
    await appointments_collection.update_one(
        {"_id": obj_id},
        {"$set": {"reviewed": True}}
    )

    # 7. Update doctor rating
    doc_id = appointment["doctor_id"]
    doctor = await doctors_collection.find_one({"_id": doc_id})
    if not doctor:
        # This shouldn't happen if appointment exists
        return {"message": "Review added but doctor not found for rating update"}

    total = doctor.get("total_reviews", 0)
    avg = doctor.get("average_rating", 0)

    # new_avg = ((old_avg * total) + new_rating) / (total + 1)
    new_avg = ((avg * total) + data.rating) / (total + 1)

    await doctors_collection.update_one(
        {"_id": doc_id},
        {
            "$set": {"average_rating": round(new_avg, 2)},
            "$inc": {"total_reviews": 1}
        }
    )

    return {"message": "Review added successfully"}

async def get_doctor_reviews(doctor_id: str):
    reviews = await reviews_collection.find(
        {"doctor_id": ObjectId(doctor_id) if len(doctor_id) == 24 else doctor_id}
    ).sort("created_at", -1).to_list(100)
    
    # Map ObjectIds and fetch patient names
    for r in reviews:
        if "_id" in r:
            r["_id"] = str(r["_id"])
        if "doctor_id" in r:
            r["doctor_id"] = str(r["doctor_id"])
        if "patient_id" in r:
            pid = r["patient_id"]
            r["patient_id"] = str(pid)
            # Fetch patient name
            patient = await patients_collection.find_one({"_id": ObjectId(pid) if len(str(pid)) == 24 else pid})
            if patient:
                r["patient_name"] = patient.get("name", "Anonymous Patient")
            else:
                r["patient_name"] = "Anonymous Patient"
            
    return reviews

async def get_doctor_rating_summary(doctor_id: str):
    try:
        doc_id = ObjectId(doctor_id)
    except:
        return {"average_rating": 0, "total_reviews": 0}
        
    doctor = await doctors_collection.find_one({"_id": doc_id})
    if not doctor:
        return {"average_rating": 0, "total_reviews": 0}
        
    return {
        "average_rating": doctor.get("average_rating", 0),
        "total_reviews": doctor.get("total_reviews", 0)
    }

async def get_appointment_review(appointment_id: str):
    review = await reviews_collection.find_one({"appointment_id": appointment_id})
    if not review:
        raise Exception("Review not found")
    
    if "_id" in review:
        review["_id"] = str(review["_id"])
    if "doctor_id" in review:
        review["doctor_id"] = str(review["doctor_id"])
    if "patient_id" in review:
        review["patient_id"] = str(review["patient_id"])
    return review
