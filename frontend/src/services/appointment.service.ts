import api from './api';

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: string;
  consultation_fee: string;
  available: boolean;
  avatar?: string;
}

export interface PatientRecord {
  _id: string;
  name: string;
  phone: string;
  user_id?: string;
}

export const appointmentService = {
  async getDoctors(specialization?: string) {
    const params = specialization && specialization !== 'All' ? { specialization } : {};
    const { data } = await api.get('/doctors/', { params });
    return data as Doctor[];
  },

  async getAvailableSlots(doctorId: string, date: string) {
    const { data } = await api.get('/slots', {
      params: { doctor_id: doctorId, date }
    });
    return data as { slots: {time: string, booked: boolean}[]; message?: string };
  },

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const { data } = await api.patch(`/appointments/${appointmentId}`, null, {
      params: { status }
    });
    return data;
  },

  async bookAppointment(bookingData: { 
    doctor_id: string; 
    patient_id: string; 
    date: string; 
    time: string; 
    reason: string 
  }) {
    const { data } = await api.post('/appointments/book', bookingData);
    return data;
  },

  async getMyAppointments() {
    const { data } = await api.get('/appointments/my-appointments');
    return data;
  },

  async getMyPatients() {
    const { data } = await api.get('/patients/my');
    return data as PatientRecord[];
  },

  async cancelAppointment(appointmentId: string) {
    const { data } = await api.put(`/appointments/${appointmentId}/cancel`);
    return data;
  },

  async getDashboardData() {
    const { data } = await api.get('/appointments/dashboard');
    return data;
  }
};
