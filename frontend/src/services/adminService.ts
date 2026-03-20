import api from './api';

export const getAdminDashboardData = () => 
    api.get(`/admin/dashboard`).then(res => res.data);

export const getAllDoctors = (search?: string, page: number = 1, limit: number = 10) => 
    api.get(`/admin/doctors`, { params: { search, page, limit } }).then(res => res.data);

export const addDoctor = (doctorData: any) => 
    api.post(`/admin/add-doctor`, doctorData).then(res => res.data);

export const updateDoctor = (doctorId: string, doctorData: any) => 
    api.put(`/admin/update-doctor/${doctorId}`, doctorData).then(res => res.data);

export const getAllPatients = () => 
    api.get(`/admin/patients`).then(res => res.data);

export const addPatient = (patientData: any) => 
    api.post(`/admin/add-patient`, patientData).then(res => res.data);

export const getAllAppointments = () => 
    api.get(`/admin/appointments`).then(res => res.data);

// Leave Management
export const getLeaveRequests = (status?: string) => 
    api.get(`/admin/leaves`, { params: { status } }).then(res => res.data);

export const updateLeaveStatus = (leaveId: string, status: 'approved' | 'rejected') => 
    api.put(`/admin/leaves/${leaveId}`, { status }).then(res => res.data);

export const getGlobalSchedules = () => 
    api.get(`/admin/schedules`).then(res => res.data);
