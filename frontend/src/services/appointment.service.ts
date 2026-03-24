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
    return data.success ? data.data : data as Doctor[];
  },

  async getAvailableSlots(doctorId: string, date: string) {
    const { data } = await api.get('/slots', {
      params: { doctor_id: doctorId, date }
    });
    // This wasn't changed but just in case
    return data as { slots: {time: string, booked: boolean}[]; reason?: string; success?: boolean; data?: any };
  },

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const { data } = await api.patch(`/appointments/${appointmentId}?status=${status}`);
    return data.success ? data.data : data;
  },

  async bookAppointment(bookingData: { 
    doctor_id: string; 
    patient_id: string; 
    date: string; 
    time: string; 
    reason: string 
  }) {
    const { data } = await api.post('/appointments/book', bookingData);
    return data.success ? data.data : data;
  },

  async getHardenedAvailability(doctorId: string, date: string) {
    const { data } = await api.get(`/doctors/${doctorId}/availability`, {
      params: { date }
    });
    // Now returns { date, locations: [{location_id, location_name, shifts: [...]}] }
    return data as { date: string; locations: any[] };
  },

  async getDoctorLocations(doctorId: string) {
    const { data } = await api.get(`/doctors/${doctorId}/locations`);
    return data as any[];
  },

  async bookHardenedAppointment(bookingData: { 
    doctor_id: string; 
    patient_id: string; 
    location_id: string;
    date: string; 
    shift_id: string;
    symptoms: string[];
    idempotency_key: string;
  }) {
    const { data } = await api.post('/appointments/book', bookingData);
    return data;
  },

  async getAppointmentStatus(appointmentId: string) {
    const { data } = await api.get(`/appointments/status/${appointmentId}`);
    return data;
  },

  async cancelHardenedAppointment(appointmentId: string) {
    const { data } = await api.post(`/appointments/cancel/${appointmentId}`);
    return data;
  },

  async getMyAppointments() {
    const { data } = await api.get('/appointments/my-appointments');
    return data.success ? data.data : data;
  },

  async getMyPatients() {
    const { data } = await api.get('/patients/my');
    return data.success ? data.data : data as PatientRecord[];
  },

  async getDashboardData() {
    const { data } = await api.get('/appointments/dashboard');
    return data.success ? data.data : data;
  }
};

