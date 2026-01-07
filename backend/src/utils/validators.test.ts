/**
 * Tests unitarios para validadores
 */

import {
  validateRUT,
  formatRUT,
  validateEsfera,
  validateCilindro,
  validateEje,
  validateDP,
  validateOphthalmicExam,
  validateRequiredPatientFields,
  calculateAge,
  OPHTHALMIC_RANGES
} from './validators';

describe('RUT Validation', () => {
  test('should validate correct RUTs', () => {
    expect(validateRUT('12345678-5')).toBe(true);
    expect(validateRUT('11111111-1')).toBe(true);
    expect(validateRUT('22222222-2')).toBe(true);
    expect(validateRUT('1234567-4')).toBe(true); // Valid 7-digit RUT
    expect(validateRUT('9876543-3')).toBe(true); // Another valid RUT
  });

  test('should reject invalid RUTs', () => {
    expect(validateRUT('12345678-9')).toBe(false); // Wrong check digit
    expect(validateRUT('1234567')).toBe(false); // Missing check digit
    expect(validateRUT('12345678-X')).toBe(false); // Invalid check digit
    expect(validateRUT('')).toBe(false); // Empty string
    expect(validateRUT('abc-1')).toBe(false); // Non-numeric
  });

  test('should handle RUTs with dots', () => {
    expect(validateRUT('12.345.678-5')).toBe(true);
    expect(validateRUT('1.234.567-4')).toBe(true); // Valid 7-digit RUT with dots
  });

  test('should format RUTs correctly', () => {
    expect(formatRUT('12345678-5')).toBe('12.345.678-5');
    expect(formatRUT('1234567-4')).toBe('1.234.567-4'); // Valid 7-digit RUT
    expect(formatRUT('invalid')).toBe('invalid'); // Should return unchanged if invalid
  });
});

describe('Ophthalmic Validation', () => {
  test('should validate esfera values', () => {
    expect(validateEsfera(0)).toBe(true);
    expect(validateEsfera(-10)).toBe(true);
    expect(validateEsfera(15)).toBe(true);
    expect(validateEsfera(-20)).toBe(true);
    expect(validateEsfera(20)).toBe(true);
    
    expect(validateEsfera(-21)).toBe(false);
    expect(validateEsfera(21)).toBe(false);
    expect(validateEsfera(NaN)).toBe(false);
  });

  test('should validate cilindro values', () => {
    expect(validateCilindro(0)).toBe(true);
    expect(validateCilindro(-5)).toBe(true);
    expect(validateCilindro(8)).toBe(true);
    expect(validateCilindro(-10)).toBe(true);
    expect(validateCilindro(10)).toBe(true);
    
    expect(validateCilindro(-11)).toBe(false);
    expect(validateCilindro(11)).toBe(false);
    expect(validateCilindro(NaN)).toBe(false);
  });

  test('should validate eje values', () => {
    expect(validateEje(0)).toBe(true);
    expect(validateEje(90)).toBe(true);
    expect(validateEje(180)).toBe(true);
    expect(validateEje(45)).toBe(true);
    
    expect(validateEje(-1)).toBe(false);
    expect(validateEje(181)).toBe(false);
    expect(validateEje(45.5)).toBe(false); // Must be integer
    expect(validateEje(NaN)).toBe(false);
  });

  test('should validate DP values', () => {
    expect(validateDP(60)).toBe(true);
    expect(validateDP(65.5)).toBe(true);
    expect(validateDP(50)).toBe(true);
    expect(validateDP(80)).toBe(true);
    
    expect(validateDP(49)).toBe(false);
    expect(validateDP(81)).toBe(false);
    expect(validateDP(NaN)).toBe(false);
  });

  test('should validate complete ophthalmic exam', () => {
    const validExam = {
      od_esfera: -2.5,
      od_cilindro: -1.0,
      od_eje: 90,
      od_dp: 65,
      oi_esfera: -3.0,
      oi_cilindro: -0.5,
      oi_eje: 180,
      oi_dp: 64
    };

    const errors = validateOphthalmicExam(validExam);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test('should detect invalid ophthalmic values', () => {
    const invalidExam = {
      od_esfera: -25, // Invalid
      od_cilindro: 15, // Invalid
      od_eje: 200, // Invalid
      od_dp: 45, // Invalid
      oi_esfera: 25, // Invalid
      oi_cilindro: -15, // Invalid
      oi_eje: -10, // Invalid
      oi_dp: 85 // Invalid
    };

    const errors = validateOphthalmicExam(invalidExam);
    expect(Object.keys(errors)).toHaveLength(8);
    expect(errors.od_esfera).toContain('Esfera OD');
    expect(errors.od_cilindro).toContain('Cilindro OD');
    expect(errors.od_eje).toContain('Eje OD');
    expect(errors.od_dp).toContain('DP OD');
  });
});

describe('Patient Validation', () => {
  test('should detect missing required fields', () => {
    const incompletePatient = {
      rut: '12345678-5',
      nombres: 'Juan',
      // Missing apellidos, fechaNacimiento, telefono, correo
    };

    const missingFields = validateRequiredPatientFields(incompletePatient);
    expect(missingFields).toContain('Apellidos');
    expect(missingFields).toContain('Fecha de nacimiento');
    expect(missingFields).toContain('Teléfono');
    expect(missingFields).toContain('Correo electrónico');
  });

  test('should pass validation with complete patient data', () => {
    const completePatient = {
      rut: '12345678-5',
      nombres: 'Juan Carlos',
      apellidos: 'González López',
      fechaNacimiento: new Date('1990-05-15'),
      telefono: '+56912345678',
      correo: 'juan@email.com'
    };

    const missingFields = validateRequiredPatientFields(completePatient);
    expect(missingFields).toHaveLength(0);
  });
});

describe('Age Calculation', () => {
  test('should calculate age correctly', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
    
    expect(calculateAge(birthDate)).toBe(30);
  });

  test('should handle birthday not yet reached this year', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 25, today.getMonth() + 1, today.getDate());
    
    expect(calculateAge(birthDate)).toBe(24);
  });

  test('should handle birthday already passed this year', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 25, today.getMonth() - 1, today.getDate());
    
    expect(calculateAge(birthDate)).toBe(25);
  });
});