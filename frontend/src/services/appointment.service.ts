import api from './api';

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: string;
  consultation_fee: string;
  degree?: string;
  about?: string;
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
    // Handle backend returning an array directly
    if (Array.isArray(data)) {
        return { slots: data.map(s => ({ time: s.time, booked: s.is_full })) };
    }
    // Handle backend returning { success: true, data: [...] } or { slots: [...] }
    const actualSlots = data.slots || data.data || [];
    return { slots: actualSlots.map((s:any) => ({ time: s.time, booked: s.booked ?? s.is_full })) };
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
    const { data } = await api.get(`/slots`, {
      params: { doctor_id: doctorId, date }
    });
    return data as any[];
  },

  async getDoctorLocations(doctorId: string) {
    const { data } = await api.get(`/doctors/${doctorId}/locations`);
    return data as any[];
  },


  async getEmergencySlot(symptoms: string, preferredDate: string) {
    const { data } = await api.post('/emergency-slot', { symptoms, preferred_date: preferredDate });
    return data;
  },

  async getRelatedDoctors(doctorId: string, date: string) {
    const { data } = await api.get(`/related-doctors/${doctorId}`, { params: { date } });
    return data;
  },

  async bookHardenedAppointment(bookingData: { 
    doctor_id: string; 
    patient_id: string; 
    date: string; 
    slot_time: string;
    symptoms: string[];
    idempotency_key: string;
  }) {
    const { data } = await api.post('/appointments', bookingData);
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

  async cancelAppointment(appointmentId: string) {
    return this.cancelHardenedAppointment(appointmentId);
  },

  async getMyAppointments() {
    const { data } = await api.get('/appointments/my-appointments');
    return data.success ? data.data : data;
  },

  async getMyPatients() {
    const { data } = await api.get('/patients/my');
    return data.success ? data.data : data as PatientRecord[];
  },

  async getBranches() {
    const { data } = await api.get('/locations');
    return data as any[];
  },

  async getDashboardData() {
    const { data } = await api.get('/appointments/dashboard');
    return data.success ? data.data : data;
  }
};

