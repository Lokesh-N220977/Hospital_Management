
import { request } from './apiClient';

export const bookAppointment = (data: { doctor_id: string; date: string; time: string; reason?: string }) =>
    request("/appointments/book", { method: "POST", body: JSON.stringify(data) });

export const getMyAppointments = () => request("/appointments/my-appointments");

export const cancelAppointment = (id: string, reason: string) =>
    request(`/appointments/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) });

export const getAvailableSlots = (doctorId: string, date: string) =>
    request(`/availability/${doctorId}/${date}`);

export const getDoctorAppointments = () => 
    request("/appointments/doctor/me");

export const updateAppointmentStatus = (id: string, status: string) =>
    request(`/appointments/${id}/status?status=${status}`, { method: "PATCH" });
