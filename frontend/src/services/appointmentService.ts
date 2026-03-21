import { request } from './apiClient';

const unwrap = (res: any) => res.success ? res.data : res;

export const bookAppointment = (data: { doctor_id: string; date: string; time: string; reason?: string }) =>
    request("/appointments/book", { method: "POST", body: JSON.stringify(data) }).then(unwrap);

export const getMyAppointments = () => request("/appointments/my-appointments").then(unwrap);

export const cancelAppointment = (id: string, reason: string) =>
    request(`/appointments/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }).then(unwrap);

export const getAvailableSlots = (doctorId: string, date: string) =>
    request(`/availability/${doctorId}/${date}`).then(unwrap);

export const getDoctorAppointments = () => 
    request("/appointments/doctor/me").then(unwrap);

export const updateAppointmentStatus = (id: string, status: string) =>
    request(`/appointments/${id}/status?status=${status}`, { method: "PATCH" }).then(unwrap);

