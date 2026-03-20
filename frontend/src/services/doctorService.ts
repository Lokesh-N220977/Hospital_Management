
import { request } from './apiClient';

// Public/Patient facing
export const getAllDoctors = (params?: { specialization?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/doctors${query ? `?${query}` : ""}`);
};

export const getDoctorSlots = (doctorId: string, date: string) => 
    request(`/doctors/${doctorId}/slots?date=${date}`);

// Doctor Portal specific (/doctor prefix)
export const getPortalProfile = () => 
    request(`/doctor/profile`);

export const getPortalSchedule = (doctorId: string) => 
    request(`/doctor/schedule/${doctorId}`);

export const savePortalSchedule = (schedule: any) => 
    request(`/doctor/schedule`, {
        method: 'POST',
        body: JSON.stringify(schedule)
    });

export const getSlots = (doctorId: string, date: string) =>
    request(`/slots?doctor_id=${doctorId}&date=${date}`);

export const getPortalLeaves = (doctorId: string) => 
    request(`/doctor/leave/${doctorId}`);

export const addLeave = (leaveData: any) =>
    request(`/doctor/leave`, {
        method: 'POST',
        body: JSON.stringify(leaveData)
    });

export const getDoctorAppointments = (doctorId: string) =>
    request(`/appointments/doctor/${doctorId}`);

export const updateAppointmentStatus = (appointmentId: string, status: string) =>
    request(`/appointments/${appointmentId}?status=${status}`, {
        method: 'PATCH'
    });

export const getDoctorPatients = (doctorId: string) =>
    request(`/appointments/doctor/${doctorId}/patients`);

export const issuePrescription = (data: any) =>
    request(`/prescriptions/`, {
        method: 'POST',
        body: JSON.stringify(data)
    });

export const getIssuedPrescriptions = (doctorId: string) =>
    request(`/prescriptions/doctor/${doctorId}`);

// Legacy/Deprecated (to be removed after transition)
export const getDoctorProfile = () => request(`/doctors/me`);
export const getDoctorSchedule = () => request(`/doctors/schedule`);
export const updateDoctorSchedule = (schedule: any) => 
    request(`/doctors/schedule`, { method: 'POST', body: JSON.stringify(schedule) });
export const updateDoctorStatus = (available: boolean) => 
    request(`/doctors/status?available=${available}`, { method: 'PATCH' });
