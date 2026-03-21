import api from './api';

export interface User {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  role: string;
  age?: number;
  gender?: string;
  must_change_password?: boolean;
}

export interface LoginResponse {
  access_token?: string;
  token?: string; // legacy compat
  user: User;
}

// ─── Phone / OTP Flow ────────────────────────────────────────────────

export const sendOTP = async (phone: string): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/send-otp', { phone });
  return data;
};

export const verifyOTP = async (phone: string, otp: string): Promise<LoginResponse> => {
  const { data } = await api.post('/auth/verify-otp', { phone, otp });
  return data;
};

// ─── Email / Password Flow ───────────────────────────────────────────

export const loginWithEmail = async (
  email: string,
  password: string,
  role: string
): Promise<LoginResponse> => {
  const { data } = await api.post('/auth/login-email', { email, password, role });
  return data;
};

// ─── Legacy phone+password (used by admin/doctor) ────────────────────

export const loginWithPhone = async (
  phone: string,
  password: string,
  role: string
): Promise<LoginResponse> => {
  const { data } = await api.post('/auth/login', { phone, password, role });
  return data;
};

// ─── Registration ─────────────────────────────────────────────────────

export const register = async (payload: {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role?: string;
  gender?: string;
  age?: number;
}) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

// ─── Token helpers ────────────────────────────────────────────────────

export const storeSession = (res: LoginResponse) => {
  const token = res.access_token || res.token || '';
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(res.user));
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const authService = {
  sendOTP,
  verifyOTP,
  loginWithEmail,
  loginWithPhone,
  register,
  storeSession,
  clearSession,
  getStoredUser,
};

export default authService;
