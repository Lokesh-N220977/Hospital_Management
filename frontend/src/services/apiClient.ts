
const BASE_URL = "http://localhost:8000/api/v1";

export const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers: any = {
        ...(options.headers as any),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const isFormData = options.body instanceof FormData;
    if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    
    if (!res.ok) {
        let errorData;
        try {
            errorData = await res.json();
        } catch (e) {
            errorData = { detail: "Unknown error" };
        }
        
        console.error("API Error Response:", errorData);
        let message = "Request failed";
        
        if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
                // Format FastAPI validation errors (e.g., body.field: message)
                message = errorData.detail.map((err: any) => {
                    const field = err.loc ? err.loc.join('.') : 'Error';
                    return `${field}: ${err.msg}`;
                }).join('\n');
            } else if (typeof errorData.detail === 'string') {
                message = errorData.detail;
            } else {
                message = JSON.stringify(errorData.detail);
            }
        }
        throw new Error(message);
    }

    return res.json();
};
