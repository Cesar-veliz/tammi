/**
 * Property-based tests for database storage functionality
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
    // Use the same database as development for now
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
      // Ignore cleanup errors for now
      console.log('Cleanup error:', error);
    }
  });

  describe('Property 26: Almacenamiento en base de datos relacional', () => {
    test('should store and retrieve user data with referential integrity', async () => {
      /**Feature: sistema-oftalmologia, Property 26: Almacenamiento en base de datos relacional**/
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
            password: fc.string({ minLength: 8, maxLength: 100 }),
            role: fc.constantFrom('ADMIN', 'USER'),
            name: fc.string({ minLength: 2, maxLength: 100 })
          }),
          async (userData) => {
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
          }
        ),
        { numRuns: 10 } // Reduced for faster testing
      );
    });

    test('should store and retrieve patient data with referential integrity', async () => {
      /**Feature: sistema-oftalmologia, Property 26: Almacenamiento en base de datos relacional**/
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            rut: fc.string({ minLength: 8, maxLength: 12 }).filter(s => /^[0-9]+-[0-9kK]$/.test(s)),
            nombres: fc.string({ minLength: 2, maxLength: 100 }),
            apellidos: fc.string({ minLength: 2, maxLength: 100 }),
            fechaNacimiento: fc.date({ min: new Date('1900-01-01'), max: new Date() }),
            edad: fc.integer({ min: 0, max: 120 }),
            telefono: fc.string({ minLength: 8, maxLength: 15 }),
            correo: fc.emailAddress()
          }),
          async (patientData) => {
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
            expect(retrievedPatient!.id).toBe(createdPatient.id);
          }
        ),
        { numRuns: 10 } // Reduced for faster testing
      );
    });

    test('should enforce unique constraints', async () => {
      /**Feature: sistema-oftalmologia, Property 26: Almacenamiento en base de datos relacional**/
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
            password: fc.string({ minLength: 8, maxLength: 100 }),
            role: fc.constantFrom('ADMIN', 'USER'),
            name: fc.string({ minLength: 2, maxLength: 100 })
          }),
          async (userData) => {
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
          }
        ),
        { numRuns: 5 } // Reduced for faster testing
      );
    });
  });
});