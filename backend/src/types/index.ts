// Type definitions for the ophthalmology system

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: Date;
  edad: number;
  telefono: string;
  correo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalHistory {
  id: string;
  embarazo: boolean;
  lactancia: boolean;
  hta: boolean;
  dm: boolean;
  otras?: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  medicalHistoryId: string;
  ophthalmicExamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
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

export interface CreateClinicalRecordRequest {
  medicalHistory: {
    embarazo: boolean;
    lactancia: boolean;
    hta: boolean;
    dm: boolean;
    otras?: string;
  };
  ophthalmicExam: {
    od_esfera?: number | null;
    od_cilindro?: number | null;
    od_eje?: number | null;
    od_dp?: number | null;
    oi_esfera?: number | null;
    oi_cilindro?: number | null;
    oi_eje?: number | null;
    oi_dp?: number | null;
    comentarios?: string;
  };
}

export interface SearchResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}