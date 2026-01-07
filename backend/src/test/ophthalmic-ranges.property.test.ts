/**
 * Property-based tests for ophthalmic ranges validation
 * **Feature: sistema-oftalmologia, Property 15: Validación de rangos oftalmológicos**
 * **Valida: Requerimientos 4.2**
 */

import * as fc from 'fast-check';
import {
  validateEsfera,
  validateCilindro,
  validateEje,
  validateDP,
  validateOphthalmicExam,
  OPHTHALMIC_RANGES
} from '../utils/validators';

describe('Ophthalmic Ranges Validation Properties', () => {
  describe('Property 15: Validación de rangos oftalmológicos', () => {
    test('should accept any esfera value within valid range', () => {
      const validEsferaGen = fc.float({ 
        min: OPHTHALMIC_RANGES.esfera.min, 
        max: OPHTHALMIC_RANGES.esfera.max 
      });

      fc.assert(
        fc.property(validEsferaGen, (esfera) => {
          // Property: Any esfera value within range should be valid
          expect(validateEsfera(esfera)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    test('should reject any esfera value outside valid range', () => {
      const invalidEsferaGen = fc.oneof(
        fc.float({ min: -1000, max: OPHTHALMIC_RANGES.esfera.min - 0.01 }),
        fc.float({ min: OPHTHALMIC_RANGES.esfera.max + 0.01, max: 1000 })
      );

      fc.assert(
        fc.property(invalidEsferaGen, (esfera) => {
          // Property: Any esfera value outside range should be invalid
          expect(validateEsfera(esfera)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    test('should accept any cilindro value within valid range', () => {
      const validCilindroGen = fc.float({ 
        min: OPHTHALMIC_RANGES.cilindro.min, 
        max: OPHTHALMIC_RANGES.cilindro.max 
      });

      fc.assert(
        fc.property(validCilindroGen, (cilindro) => {
          // Property: Any cilindro value within range should be valid
          expect(validateCilindro(cilindro)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    test('should accept any integer eje value within valid range', () => {
      const validEjeGen = fc.integer({ 
        min: OPHTHALMIC_RANGES.eje.min, 
        max: OPHTHALMIC_RANGES.eje.max 
      });

      fc.assert(
        fc.property(validEjeGen, (eje) => {
          // Property: Any integer eje value within range should be valid
          expect(validateEje(eje)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    test('should accept any DP value within valid range', () => {
      const validDPGen = fc.float({ 
        min: OPHTHALMIC_RANGES.dp.min, 
        max: OPHTHALMIC_RANGES.dp.max 
      });

      fc.assert(
        fc.property(validDPGen, (dp) => {
          // Property: Any DP value within range should be valid
          expect(validateDP(dp)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});