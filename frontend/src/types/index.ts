// Type definitions for the frontend

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER';
  name: string;
}

export interface Patient {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  telefono: string;
  correo: string;
}

export interface MedicalHistory {
  id: string;
  embarazo: boolean;
  lactancia: boolean;
  hta: boolean;
  dm: boolean;
  otras?: string;
}

export interface OphthalmicExam {
  id: string;
  od_esfera?: number;
  od_cilindro?: number;
  od_eje?: number;
  od_dp?: number;
  oi_esfera?: number;
  oi_cilindro?: number;
  oi_eje?: number;
  oi_dp?: number;
  comentarios?: string;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  medicalHistory: MedicalHistory;
  ophthalmicExam: OphthalmicExam;
  createdBy: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreatePatientRequest {
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {}

export interface SearchPatientRequest {
  query?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}