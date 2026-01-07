/**
 * Simple ophthalmic validation test
 * **Feature: sistema-oftalmologia, Property 15: Validación de rangos oftalmológicos**
 * **Valida: Requerimientos 4.2**
 */

import * as fc from 'fast-check';
import { validateEsfera, OPHTHALMIC_RANGES } from '../utils/validators';

describe('Simple Ophthalmic Test', () => {
  test('should validate esfera correctly', () => {
    expect(validateEsfera(0)).toBe(true);
    expect(validateEsfera(-20)).toBe(true);
    expect(validateEsfera(20)).toBe(true);
    expect(validateEsfera(-21)).toBe(false);
    expect(validateEsfera(21)).toBe(false);
  });

  test('property: should accept any esfera value within valid range', () => {
    fc.assert(
      fc.property(
        fc.float({ min: OPHTHALMIC_RANGES.esfera.min, max: OPHTHALMIC_RANGES.esfera.max }),
        (esfera) => {
          expect(validateEsfera(esfera)).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
});