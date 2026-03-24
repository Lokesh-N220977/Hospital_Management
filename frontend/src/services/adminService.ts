import api from './api';

export const getAdminDashboardData = () => 
    api.get(`/admin/dashboard`).then(res => res.data);

export const getAllDoctors = (search?: string, specialization?: string, status?: string, page: number = 1, limit: number = 10) => 
    api.get(`/admin/doctors`, { params: { search, specialization, status, page, limit } }).then(res => res.data);

export const addDoctor = (formData: FormData) => 
    api.post(`/admin/add-doctor`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

export const getDoctorById = (doctorId: string) => 
    api.get(`/admin/doctor/${doctorId}`).then(res => res.data);

export const uploadDoctorImage = (doctorId: string, formData: FormData) => 
    api.post(`/admin/doctor/${doctorId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

export const updateDoctor = (doctorId: string, doctorData: any) => 
    api.put(`/admin/update-doctor/${doctorId}`, doctorData).then(res => res.data);

export const deleteDoctor = (doctorId: string) => 
    api.delete(`/admin/delete-doctor/${doctorId}`).then(res => res.data);

export const getAllPatients = (search?: string, status?: string) => 
    api.get(`/admin/patients`, { params: { search, status } }).then(res => res.data);

export const updatePatient = (patientId: string, patientData: any) => 
    api.put(`/admin/update-patient/${patientId}`, patientData).then(res => res.data);

export const deletePatient = (patientId: string) => 
    api.delete(`/admin/delete-patient/${patientId}`).then(res => res.data);

export const activatePatient = (patientId: string) => 
    api.patch(`/admin/activate-patient/${patientId}`).then(res => res.data);

export const activateDoctor = (doctorId: string) => 
    api.patch(`/admin/activate-doctor/${doctorId}`).then(res => res.data);

export const addPatient = (patientData: any) => 
    api.post(`/admin/add-patient`, patientData).then(res => res.data);

export const getAllAppointments = (search?: string, status?: string) => 
    api.get(`/admin/appointments`, { params: { search, status } }).then(res => res.data);

export const updateAppointmentStatus = (id: string, status: string) =>
    api.patch(`/admin/appointments/${id}/status`, { status }).then(res => res.data);

export const deleteAppointment = (id: string) =>
    api.delete(`/admin/appointments/${id}`).then(res => res.data);

// Leave Management
export const getLeaveRequests = (status?: string) => 
    api.get(`/admin/leaves`, { params: { status } }).then(res => res.data);

export const updateLeaveStatus = (leaveId: string, status: 'approved' | 'rejected') => 
    api.patch(`/admin/leaves/${leaveId}`, { status }).then(res => res.data);

export const getGlobalSchedules = (search?: string) => 
    api.get(`/admin/schedules`, { params: { search } }).then(res => res.data);

export const resetGlobalSchedules = () => 
    api.post(`/admin/reset-all-schedules`).then(res => res.data);

export const getPendingDoctors = () => 
    api.get(`/admin/pending-doctors`).then(res => res.data);

export const verifyDoctor = (doctorId: string, status: 'VERIFIED' | 'REJECTED') => 
    api.post(`/admin/verify-doctor/${doctorId}`, { status }).then(res => res.data);

export const updateDoctorSchedule = (scheduleId: string, data: any) => 
    api.put(`/admin/schedule/${scheduleId}`, data).then(res => res.data);
