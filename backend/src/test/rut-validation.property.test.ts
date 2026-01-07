/**
 * Property-based tests for RUT validation
 * **Feature: sistema-oftalmologia, Property 7: Validación de RUT único y formato**
 * **Valida: Requerimientos 2.2**
 */

import * as fc from 'fast-check';
import { validateRUT, formatRUT } from '../utils/validators';

describe('RUT Validation Properties', () => {
  describe('Property 7: Validación de RUT único y formato', () => {
    test('should validate any correctly formatted RUT with valid check digit', () => {
      // Generator for valid RUT numbers (7-8 digits)
      const validRutNumberGen = fc.integer({ min: 1000000, max: 99999999 });

      fc.assert(
        fc.property(validRutNumberGen, (rutNumber) => {
          // Calculate correct check digit
          const checkDigit = calculateCheckDigit(rutNumber.toString());
          const validRut = `${rutNumber}-${checkDigit}`;

          // Property: Any RUT with correct check digit should be valid
          expect(validateRUT(validRut)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    test('should reject any RUT with incorrect check digit', () => {
      const validRutNumberGen = fc.integer({ min: 1000000, max: 99999999 });
      const wrongCheckDigitGen = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'K');

      fc.assert(
        fc.property(validRutNumberGen, wrongCheckDigitGen, (rutNumber, wrongCheckDigit) => {
          const correctCheckDigit = calculateCheckDigit(rutNumber.toString());
          
          // Skip if the wrong digit happens to be correct
          fc.pre(wrongCheckDigit !== correctCheckDigit);

          const invalidRut = `${rutNumber}-${wrongCheckDigit}`;

          // Property: Any RUT with incorrect check digit should be invalid
          expect(validateRUT(invalidRut)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    test('should handle RUTs with dots consistently', () => {
      const validRutNumberGen = fc.integer({ min: 1000000, max: 99999999 });

      fc.assert(
        fc.property(validRutNumberGen, (rutNumber) => {
          const checkDigit = calculateCheckDigit(rutNumber.toString());
          const rutWithoutDots = `${rutNumber}-${checkDigit}`;
          const rutWithDots = formatRUT(rutWithoutDots);

          // Property: RUT validation should be consistent regardless of dot formatting
          expect(validateRUT(rutWithoutDots)).toBe(validateRUT(rutWithDots));
          expect(validateRUT(rutWithoutDots)).toBe(true);
          expect(validateRUT(rutWithDots)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    test('should reject malformed RUT strings', () => {
      const malformedRutGen = fc.oneof(
        fc.string().filter(s => !/^\d{7,8}-[0-9K]$/.test(s.replace(/[.\s]/g, '').toUpperCase())),
        fc.constant(''),
        fc.constant('123'),
        fc.constant('abc-1'),
        fc.constant('12345678'),
        fc.constant('-5'),
        fc.constant('12345678-')
      );

      fc.assert(
        fc.property(malformedRutGen, (malformedRut) => {
          // Property: Any malformed RUT string should be invalid
          expect(validateRUT(malformedRut)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    test('should format valid RUTs consistently', () => {
      const validRutNumberGen = fc.integer({ min: 1000000, max: 99999999 });

      fc.assert(
        fc.property(validRutNumberGen, (rutNumber) => {
          const checkDigit = calculateCheckDigit(rutNumber.toString());
          const rutWithoutDots = `${rutNumber}-${checkDigit}`;
          const formattedRut = formatRUT(rutWithoutDots);

          // Property: Formatted RUT should have dots in correct positions
          expect(formattedRut).toMatch(/^\d{1,2}\.\d{3}\.\d{3}-[0-9K]$/);
          
          // Property: Formatted RUT should still be valid
          expect(validateRUT(formattedRut)).toBe(true);
          
          // Property: Formatting should be idempotent
          expect(formatRUT(formattedRut)).toBe(formattedRut);
        }),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Helper function to calculate RUT check digit
 * (Duplicated from validators.ts for testing independence)
 */
function calculateCheckDigit(rutNumber: string): string {
  let sum = 0;
  let multiplier = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const checkDigit = 11 - remainder;

  if (checkDigit === 11) return '0';
  if (checkDigit === 10) return 'K';
  return checkDigit.toString();
}