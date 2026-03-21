import api from "./api";

export interface ReviewCreate {
  appointment_id: string;
  rating: number;
  comment?: string;
}

export const reviewService = {
  createReview: async (data: ReviewCreate) => {
    const response = await api.post("/reviews", data);
    return response.data;
  },

  getDoctorReviews: async (doctorId: string) => {
    const response = await api.get(`/doctors/${doctorId}/reviews`);
    return response.data;
  },

  getDoctorRating: async (doctorId: string) => {
    const response = await api.get(`/doctors/${doctorId}/rating`);
    return response.data;
  },
  getAppointmentReview: async (appointmentId: string) => {
    const response = await api.get(`/appointments/${appointmentId}/review`);
    return response.data;
  },
};
