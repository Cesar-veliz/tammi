/**
 * Simple database storage test
 * **Feature: sistema-oftalmologia, Property 26: Almacenamiento en base de datos relacional**
 * **Valida: Requerimientos 7.1**
 */

// Unmock Prisma for this test file
jest.unmock('@prisma/client');

import { PrismaClient } from '@prisma/client';
import * as fc from 'fast-check';

describe('Database Storage Properties', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Use the existing dev database
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    try {
      await prisma.clinicalRecord.deleteMany();
      await prisma.medicalHistory.deleteMany();
      await prisma.ophthalmicExam.deleteMany();
      await prisma.patient.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      // Ignore errors if tables don't exist yet
    }
  });

  describe('Property 26: Almacenamiento en base de datos relacional', () => {
    test('should store and retrieve user data correctly', async () => {
      const userData = {
        username: 'testuser123',
        password: 'hashedpassword123',
        role: 'USER',
        name: 'Test User'
      };

      // Store user in database
      const createdUser = await prisma.user.create({
        data: userData
      });

      // Retrieve user from database
      const retrievedUser = await prisma.user.findUnique({
        where: { id: createdUser.id }
      });

      // Verify data integrity
      expect(retrievedUser).not.toBeNull();
      expect(retrievedUser!.username).toBe(userData.username);
      expect(retrievedUser!.password).toBe(userData.password);
      expect(retrievedUser!.role).toBe(userData.role);
      expect(retrievedUser!.name).toBe(userData.name);
      expect(retrievedUser!.id).toBe(createdUser.id);
      expect(retrievedUser!.createdAt).toBeInstanceOf(Date);
      expect(retrievedUser!.updatedAt).toBeInstanceOf(Date);
    });

    test('should store and retrieve patient data correctly', async () => {
      const patientData = {
        rut: '12345678-9',
        nombres: 'Juan Carlos',
        apellidos: 'González López',
        fechaNacimiento: new Date('1990-05-15'),
        edad: 33,
        telefono: '+56912345678',
        correo: 'juan.gonzalez@email.com'
      };

      // Store patient in database
      const createdPatient = await prisma.patient.create({
        data: patientData
      });

      // Retrieve patient from database
      const retrievedPatient = await prisma.patient.findUnique({
        where: { id: createdPatient.id }
      });

      // Verify data integrity
      expect(retrievedPatient).not.toBeNull();
      expect(retrievedPatient!.rut).toBe(patientData.rut);
      expect(retrievedPatient!.nombres).toBe(patientData.nombres);
      expect(retrievedPatient!.apellidos).toBe(patientData.apellidos);
      expect(retrievedPatient!.fechaNacimiento).toEqual(patientData.fechaNacimiento);
      expect(retrievedPatient!.edad).toBe(patientData.edad);
      expect(retrievedPatient!.telefono).toBe(patientData.telefono);
      expect(retrievedPatient!.correo).toBe(patientData.correo);
    });

    test('should enforce unique constraints', async () => {
      const userData = {
        username: 'uniqueuser123',
        password: 'password123',
        role: 'USER',
        name: 'Unique User'
      };

      // Create first user
      await prisma.user.create({
        data: userData
      });

      // Attempt to create second user with same username should fail
      await expect(
        prisma.user.create({
          data: {
            ...userData,
            name: 'Different Name' // Change other fields but keep same username
          }
        })
      ).rejects.toThrow();
    });

    test('property-based: should store any valid user data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            role: fc.constantFrom('ADMIN', 'USER'),
            name: fc.string({ minLength: 2, maxLength: 50 })
          }),
          async (userData) => {
            // Make username unique by adding timestamp
            const uniqueUserData = {
              ...userData,
              username: userData.username + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            };

            // Store user in database
            const createdUser = await prisma.user.create({
              data: uniqueUserData
            });

            // Retrieve user from database
            const retrievedUser = await prisma.user.findUnique({
              where: { id: createdUser.id }
            });

            // Verify data integrity
            expect(retrievedUser).not.toBeNull();
            expect(retrievedUser!.username).toBe(uniqueUserData.username);
            expect(retrievedUser!.password).toBe(userData.password);
            expect(retrievedUser!.role).toBe(userData.role);
            expect(retrievedUser!.name).toBe(userData.name);
          }
        ),
        { numRuns: 20 } // Reduced for faster execution
      );
    });
  });
});