import { PrismaClient } from '@prisma/client';
import { Patient, CreatePatientRequest, SearchResult } from '../types';
import { validateRUT, validateRequiredPatientFields, calculateAge } from '../utils/validators';

const prisma = new PrismaClient();

export class PatientService {
  static async createPatient(patientData: CreatePatientRequest): Promise<Patient> {
    // Validate required fields
    const missingFields = validateRequiredPatientFields({
      ...patientData,
      fechaNacimiento: new Date(patientData.fechaNacimiento)
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate RUT
    if (!validateRUT(patientData.rut)) {
      throw new Error('Invalid RUT format or check digit');
    }

    // Check if RUT already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { rut: patientData.rut }
    });

    if (existingPatient) {
      throw new Error('A patient with this RUT already exists');
    }

    // Calculate age
    const fechaNacimiento = new Date(patientData.fechaNacimiento);
    const edad = calculateAge(fechaNacimiento);

    return prisma.patient.create({
      data: {
        ...patientData,
        fechaNacimiento,
        edad
      }
    });
  }

  static async getPatientById(id: string): Promise<Patient | null> {
    return prisma.patient.findUnique({
      where: { id }
    });
  }

  static async updatePatient(id: string, patientData: Partial<CreatePatientRequest>): Promise<Patient> {
    const updateData: any = { ...patientData };

    // If fecha de nacimiento is updated, recalculate age
    if (patientData.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(patientData.fechaNacimiento);
      updateData.edad = calculateAge(updateData.fechaNacimiento);
    }

    // Validate RUT if provided
    if (patientData.rut && !validateRUT(patientData.rut)) {
      throw new Error('Invalid RUT format or check digit');
    }

    return prisma.patient.update({
      where: { id },
      data: updateData
    });
  }

  static async searchPatients(
    query?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SearchResult<Patient>> {
    const skip = (page - 1) * limit;
    
    let whereClause: any = {};

    if (query) {
      // Search by RUT (exact or partial), nombres, or apellidos
      whereClause = {
        OR: [
          { rut: { contains: query } },
          { nombres: { contains: query, mode: 'insensitive' } },
          { apellidos: { contains: query, mode: 'insensitive' } }
        ]
      };
    }

    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where: whereClause })
    ]);

    return {
      data: patients,
      totalCount,
      page,
      limit
    };
  }

  static async deletePatient(id: string): Promise<void> {
    await prisma.patient.delete({
      where: { id }
    });
  }
}