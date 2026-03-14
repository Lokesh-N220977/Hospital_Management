const BASE_URL = 'http://localhost:5000/api';

const request = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  } catch (error: any) {
    console.error('API Error:', error.message);
    throw error;
  }
};

export const api = {
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  // Add other methods as needed:
  getDoctors: () => request('/doctors'),
  getAppointments: () => request('/appointments'),
};

export default api;