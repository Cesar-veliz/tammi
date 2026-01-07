// @ts-ignore
import axios from 'axios';
import {
  AuthResponse,
  LoginRequest,
  Patient,
  CreatePatientRequest,
  SearchResult,
  ClinicalRecord
} from '../types';

// Determine API URL based on hostname
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : 'https://tammi-o09s.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests

// Add types for axios variables
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response: any = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

export const patientAPI = {
  search: async (query?: string, page = 1, limit = 10): Promise<SearchResult<Patient>> => {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: any = await api.get(`/patients?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const response: any = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (patientData: CreatePatientRequest): Promise<Patient> => {
    const response: any = await api.post('/patients', patientData);
    return response.data;
  },

  update: async (id: string, patientData: Partial<CreatePatientRequest>): Promise<Patient> => {
    const response: any = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  }
};

export const clinicalRecordAPI = {
  getByPatient: async (patientId: string): Promise<ClinicalRecord[]> => {
    const response: any = await api.get(`/patients/${patientId}/clinical-records`);
    return response.data;
  },

  getById: async (id: string): Promise<ClinicalRecord> => {
    const response: any = await api.get(`/clinical-records/${id}`);
    return response.data;
  },

  create: async (patientId: string, recordData: any): Promise<ClinicalRecord> => {
    const response: any = await api.post(`/patients/${patientId}/clinical-records`, recordData);
    return response.data;
  },

  update: async (id: string, recordData: any): Promise<ClinicalRecord> => {
    const response: any = await api.put(`/clinical-records/${id}`, recordData);
    return response.data;
  }
};

export default api;