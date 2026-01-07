/**
 * Validadores para el Sistema de Gestión Oftalmológica
 * Incluye validaciones para RUT chileno y rangos oftalmológicos
 */

/**
 * Valida el formato y dígito verificador de un RUT chileno
 * @param rut - RUT en formato "12345678-9" o "12.345.678-9"
 * @returns true si el RUT es válido, false en caso contrario
 */
export function validateRUT(rut: string): boolean {
  if (!rut || typeof rut !== 'string') {
    return false;
  }

  // Limpiar el RUT: remover puntos y espacios, convertir a mayúsculas
  const cleanRut = rut.replace(/[.\s]/g, '').toUpperCase();

  // Verificar formato básico: números seguidos de guión y dígito verificador
  const rutRegex = /^(\d{7,8})-([0-9K])$/;
  const match = cleanRut.match(rutRegex);

  if (!match) {
    return false;
  }

  const [, rutNumber, checkDigit] = match;

  // Calcular dígito verificador
  const calculatedCheckDigit = calculateRUTCheckDigit(rutNumber);

  return calculatedCheckDigit === checkDigit;
}

/**
 * Calcula el dígito verificador de un RUT chileno
 * @param rutNumber - Número del RUT sin dígito verificador
 * @returns Dígito verificador calculado
 */
function calculateRUTCheckDigit(rutNumber: string): string {
  let sum = 0;
  let multiplier = 2;

  // Recorrer el RUT de derecha a izquierda
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

/**
 * Formatea un RUT agregando puntos y guión
 * @param rut - RUT sin formato
 * @returns RUT formateado (ej: "12.345.678-9")
 */
export function formatRUT(rut: string): string {
  if (!validateRUT(rut)) {
    return rut; // Retornar sin cambios si no es válido
  }

  const cleanRut = rut.replace(/[.\s]/g, '').toUpperCase();
  const [rutNumber, checkDigit] = cleanRut.split('-');

  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formattedNumber}-${checkDigit}`;
}

/**
 * Rangos válidos para valores oftalmológicos
 */
export const OPHTHALMIC_RANGES = {
  esfera: { min: -20, max: 20 },
  cilindro: { min: -10, max: 10 },
  eje: { min: 0, max: 180 },
  dp: { min: 50, max: 80 }
} as const;

/**
 * Valida si un valor de esfera está dentro del rango oftalmológico válido
 * @param esfera - Valor de esfera en dioptrías
 * @returns true si está en rango válido, false en caso contrario
 */
export function validateEsfera(esfera: number): boolean {
  if (typeof esfera !== 'number' || isNaN(esfera)) {
    return false;
  }
  return esfera >= OPHTHALMIC_RANGES.esfera.min && esfera <= OPHTHALMIC_RANGES.esfera.max;
}

/**
 * Valida si un valor de cilindro está dentro del rango oftalmológico válido
 * @param cilindro - Valor de cilindro en dioptrías
 * @returns true si está en rango válido, false en caso contrario
 */
export function validateCilindro(cilindro: number): boolean {
  if (typeof cilindro !== 'number' || isNaN(cilindro)) {
    return false;
  }
  return cilindro >= OPHTHALMIC_RANGES.cilindro.min && cilindro <= OPHTHALMIC_RANGES.cilindro.max;
}

/**
 * Valida si un valor de eje está dentro del rango oftalmológico válido
 * @param eje - Valor de eje en grados
 * @returns true si está en rango válido, false en caso contrario
 */
export function validateEje(eje: number): boolean {
  if (typeof eje !== 'number' || isNaN(eje)) {
    return false;
  }
  return Number.isInteger(eje) && eje >= OPHTHALMIC_RANGES.eje.min && eje <= OPHTHALMIC_RANGES.eje.max;
}

/**
 * Valida si un valor de distancia pupilar está dentro del rango oftalmológico válido
 * @param dp - Valor de distancia pupilar en milímetros
 * @returns true si está en rango válido, false en caso contrario
 */
export function validateDP(dp: number): boolean {
  if (typeof dp !== 'number' || isNaN(dp)) {
    return false;
  }
  return dp >= OPHTHALMIC_RANGES.dp.min && dp <= OPHTHALMIC_RANGES.dp.max;
}

/**
 * Valida todos los valores oftalmológicos de un examen
 * @param exam - Objeto con valores oftalmológicos
 * @returns Objeto con errores de validación (vacío si todo es válido)
 */
export function validateOphthalmicExam(exam: {
  od_esfera?: number | null;
  od_cilindro?: number | null;
  od_eje?: number | null;
  od_dp?: number | null;
  oi_esfera?: number | null;
  oi_cilindro?: number | null;
  oi_eje?: number | null;
  oi_dp?: number | null;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validar ojo derecho
  if (exam.od_esfera !== null && exam.od_esfera !== undefined && !validateEsfera(exam.od_esfera)) {
    errors.od_esfera = `Esfera OD debe estar entre ${OPHTHALMIC_RANGES.esfera.min} y ${OPHTHALMIC_RANGES.esfera.max}`;
  }
  if (exam.od_cilindro !== null && exam.od_cilindro !== undefined && !validateCilindro(exam.od_cilindro)) {
    errors.od_cilindro = `Cilindro OD debe estar entre ${OPHTHALMIC_RANGES.cilindro.min} y ${OPHTHALMIC_RANGES.cilindro.max}`;
  }
  if (exam.od_eje !== null && exam.od_eje !== undefined && !validateEje(exam.od_eje)) {
    errors.od_eje = `Eje OD debe ser un entero entre ${OPHTHALMIC_RANGES.eje.min} y ${OPHTHALMIC_RANGES.eje.max}`;
  }
  if (exam.od_dp !== null && exam.od_dp !== undefined && !validateDP(exam.od_dp)) {
    errors.od_dp = `DP OD debe estar entre ${OPHTHALMIC_RANGES.dp.min} y ${OPHTHALMIC_RANGES.dp.max}`;
  }

  // Validar ojo izquierdo
  if (exam.oi_esfera !== null && exam.oi_esfera !== undefined && !validateEsfera(exam.oi_esfera)) {
    errors.oi_esfera = `Esfera OI debe estar entre ${OPHTHALMIC_RANGES.esfera.min} y ${OPHTHALMIC_RANGES.esfera.max}`;
  }
  if (exam.oi_cilindro !== null && exam.oi_cilindro !== undefined && !validateCilindro(exam.oi_cilindro)) {
    errors.oi_cilindro = `Cilindro OI debe estar entre ${OPHTHALMIC_RANGES.cilindro.min} y ${OPHTHALMIC_RANGES.cilindro.max}`;
  }
  if (exam.oi_eje !== null && exam.oi_eje !== undefined && !validateEje(exam.oi_eje)) {
    errors.oi_eje = `Eje OI debe ser un entero entre ${OPHTHALMIC_RANGES.eje.min} y ${OPHTHALMIC_RANGES.eje.max}`;
  }
  if (exam.oi_dp !== null && exam.oi_dp !== undefined && !validateDP(exam.oi_dp)) {
    errors.oi_dp = `DP OI debe estar entre ${OPHTHALMIC_RANGES.dp.min} y ${OPHTHALMIC_RANGES.dp.max}`;
  }

  return errors;
}

/**
 * Valida campos obligatorios de un paciente
 * @param patient - Datos del paciente
 * @returns Array de campos faltantes
 */
export function validateRequiredPatientFields(patient: {
  rut?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: Date;
  telefono?: string;
  correo?: string;
}): string[] {
  const missingFields: string[] = [];

  if (!patient.rut || patient.rut.trim() === '') {
    missingFields.push('RUT');
  }
  if (!patient.nombres || patient.nombres.trim() === '') {
    missingFields.push('Nombres');
  }
  if (!patient.apellidos || patient.apellidos.trim() === '') {
    missingFields.push('Apellidos');
  }
  if (!patient.fechaNacimiento) {
    missingFields.push('Fecha de nacimiento');
  }
  if (!patient.telefono || patient.telefono.trim() === '') {
    missingFields.push('Teléfono');
  }
  if (!patient.correo || patient.correo.trim() === '') {
    missingFields.push('Correo electrónico');
  }

  return missingFields;
}

/**
 * Calcula la edad basada en la fecha de nacimiento
 * @param fechaNacimiento - Fecha de nacimiento
 * @returns Edad en años
 */
export function calculateAge(fechaNacimiento: Date): number {
  const today = new Date();
  const birthDate = new Date(fechaNacimiento);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}