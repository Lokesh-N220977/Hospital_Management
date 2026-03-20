import { request } from "./apiClient"

export const recordVisit = async (visitData: {
  appointmentId: string
  diagnosis: string
  medicines: string[]
  notes: string
}) => {
  return request("/visit-history/add", {
    method: "POST",
    body: JSON.stringify(visitData),
  })
}

export const getPrescriptionUrl = (id: string, type: string = "visit") => {
  if (type === "prescription") {
    return `http://localhost:8000/api/v1/prescriptions/${id}/download`
  }
  return `http://localhost:8000/api/v1/visit-history/prescription/${id}`
}

export const getPatientVisitHistory = () => request("/visit-history/my-history")
