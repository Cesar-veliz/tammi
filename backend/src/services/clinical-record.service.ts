import { PrismaClient } from '@prisma/client';
import { ClinicalRecord, CreateClinicalRecordRequest } from '../types';
import { validateOphthalmicExam } from '../utils/validators';

const prisma = new PrismaClient();

export class ClinicalRecordService {
  static async createClinicalRecord(
    patientId: string,
    userId: string,
    recordData: CreateClinicalRecordRequest
  ): Promise<ClinicalRecord> {
    // Validate ophthalmic exam values
    const ophthalmicErrors = validateOphthalmicExam(recordData.ophthalmicExam);
    if (Object.keys(ophthalmicErrors).length > 0) {
      throw new Error(`Invalid ophthalmic values: ${Object.values(ophthalmicErrors).join(', ')}`);
    }

    // Create medical history
    const medicalHistory = await prisma.medicalHistory.create({
      data: recordData.medicalHistory
    });

    // Create ophthalmic exam
    const ophthalmicExam = await prisma.ophthalmicExam.create({
      data: recordData.ophthalmicExam
    });

    // Create clinical record
    return prisma.clinicalRecord.create({
      data: {
        patientId,
        medicalHistoryId: medicalHistory.id,
        ophthalmicExamId: ophthalmicExam.id,
        createdBy: userId
      },
      include: {
        patient: true,
        medicalHistory: true,
        ophthalmicExam: true,
        createdByUser: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  static async getClinicalRecordsByPatient(patientId: string): Promise<ClinicalRecord[]> {
    return prisma.clinicalRecord.findMany({
      where: { patientId },
      include: {
        patient: true,
        medicalHistory: true,
        ophthalmicExam: true,
        createdByUser: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getClinicalRecordById(id: string): Promise<ClinicalRecord | null> {
    return prisma.clinicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        medicalHistory: true,
        ophthalmicExam: true,
        createdByUser: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  static async updateClinicalRecord(
    id: string,
    recordData: Partial<CreateClinicalRecordRequest>
  ): Promise<ClinicalRecord> {
    const existingRecord = await prisma.clinicalRecord.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      throw new Error('Clinical record not found');
    }

    // Update medical history if provided
    if (recordData.medicalHistory) {
      await prisma.medicalHistory.update({
        where: { id: existingRecord.medicalHistoryId },
        data: recordData.medicalHistory
      });
    }

    // Update ophthalmic exam if provided
    if (recordData.ophthalmicExam) {
      const ophthalmicErrors = validateOphthalmicExam(recordData.ophthalmicExam);
      if (Object.keys(ophthalmicErrors).length > 0) {
        throw new Error(`Invalid ophthalmic values: ${Object.values(ophthalmicErrors).join(', ')}`);
      }

      await prisma.ophthalmicExam.update({
        where: { id: existingRecord.ophthalmicExamId },
        data: recordData.ophthalmicExam
      });
    }

    // Return updated record
    return this.getClinicalRecordById(id) as Promise<ClinicalRecord>;
  }

  static async deleteClinicalRecord(id: string): Promise<void> {
    await prisma.clinicalRecord.delete({
      where: { id }
    });
  }
}