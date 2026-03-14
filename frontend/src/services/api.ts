// API Service Layer - MedicPulse Hospital Platform
// This service is structured for easy backend integration.
// Change BASE_URL to your FastAPI server when ready.

const BASE_URL = "http://localhost:8000";

// Helper for fetch with JSON headers
const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || "Request failed");
    }
    return res.json();
};

// --- Auth ---
export const authApi = {
    login: (email: string, password: string) =>
        request("/users/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    register: (name: string, email: string, password: string, role: string) =>
        request("/users/register", { method: "POST", body: JSON.stringify({ name, email, password, role }) }),
};

// --- Doctors ---
export const doctorsApi = {
    getAll: (params?: { specialization?: string; location?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return request(`/doctors${query ? `?${query}` : ""}`);
    },
    getById: (id: string) => request(`/doctors/${id}`),
};

// --- Appointments ---
export const appointmentsApi = {
    book: (data: { doctor_id: string; date: string; time: string }) =>
        request("/appointments", { method: "POST", body: JSON.stringify(data) }),

    getMyAppointments: () => request("/appointments/my"),

    cancel: (id: string) =>
        request(`/appointments/${id}/cancel`, { method: "PATCH" }),
};

// --- Availability ---
export const availabilityApi = {
    getSlots: (doctorId: string, date: string) =>
        request(`/availability/${doctorId}?date=${date}`),
};