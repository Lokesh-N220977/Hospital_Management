
import { request } from './apiClient';

export const getPatientProfile = () => request("/auth/my-profile");

export const updatePatientProfile = (data: any) =>
    request("/auth/my-profile", { method: "PUT", body: JSON.stringify(data) });

export const getPatientDashboardStats = () => request("/appointments/dashboard");
