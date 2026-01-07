import React, { useState, useEffect } from 'react';
import { CreatePatientRequest } from '../types';
import { patientAPI } from '../services/api';

interface Patient {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  telefono: string;
  correo: string;
}

interface PatientFormProps {
  patient?: Patient | null;
  onSave: (savedPatient?: Patient) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreatePatientRequest>({
    rut: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    telefono: '',
    correo: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        rut: patient.rut,
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        fechaNacimiento: patient.fechaNacimiento.split('T')[0], // Format for date input
        telefono: patient.telefono,
        correo: patient.correo
      });
    }
  }, [patient]);

  const handleChange = (field: keyof CreatePatientRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const validateRUT = (rut: string): boolean => {
    if (!rut || rut.length < 2) return false;

    // Clean the RUT: remove dots, spaces, and convert to uppercase
    const cleanRut = rut.replace(/[.\s-]/g, '').toUpperCase();

    // Check if it has the right format (7-8 digits + 1 check digit)
    if (cleanRut.length < 8 || cleanRut.length > 9) return false;

    // Separate number and check digit
    const rutNumber = cleanRut.slice(0, -1);
    const checkDigit = cleanRut.slice(-1);

    // Validate that the number part contains only digits
    if (!/^\d+$/.test(rutNumber)) return false;

    // Validate that check digit is a digit or K
    if (!/^[0-9K]$/.test(checkDigit)) return false;

    // Calculate the check digit
    let sum = 0;
    let multiplier = 2;

    for (let i = rutNumber.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumber[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = sum % 11;
    const calculatedCheckDigit = 11 - remainder;

    let expectedCheckDigit: string;
    if (calculatedCheckDigit === 11) {
      expectedCheckDigit = '0';
    } else if (calculatedCheckDigit === 10) {
      expectedCheckDigit = 'K';
    } else {
      expectedCheckDigit = calculatedCheckDigit.toString();
    }

    return checkDigit === expectedCheckDigit;
  };

  const formatRUT = (rut: string): string => {
    // Remove all non-alphanumeric characters
    const cleanRut = rut.replace(/[^0-9K]/gi, '').toUpperCase();

    // Don't format if it's too short
    if (cleanRut.length < 2) {
      return cleanRut;
    }

    // Add hyphen before the last character (check digit)
    const rutNumber = cleanRut.slice(0, -1);
    const checkDigit = cleanRut.slice(-1);

    return `${rutNumber}-${checkDigit}`;
  };

  const handleRUTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow user to type freely, only format when they stop typing or on blur
    setFormData(prev => ({
      ...prev,
      rut: inputValue
    }));
  };

  const handleRUTBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatRUT(e.target.value);
    setFormData(prev => ({
      ...prev,
      rut: formatted
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateRUT(formData.rut)) {
      setError('Formato de RUT inválido. Use el formato 12345678-9');
      return;
    }

    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      setError('Nombres y apellidos son obligatorios');
      return;
    }

    if (!formData.fechaNacimiento) {
      setError('Fecha de nacimiento es obligatoria');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (patient) {
        result = await patientAPI.update(patient.id, formData);
      } else {
        result = await patientAPI.create(formData);
      }
      onSave(result);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar el paciente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        borderTop: '5px solid var(--racing-red)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 30px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#FAFAFA',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: 'var(--carbon-black)', fontSize: '20px' }}>
            {patient ? '🔧 TELEMETRÍA: EDITAR PILOTO' : '🏎️ NUEVO PILOTO: FASE 1'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#888'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            color: '#D32F2F',
            padding: '15px 30px',
            borderBottom: '1px solid #FFCDD2',
            fontWeight: 500
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 700, marginBottom: '15px', borderBottom: '1px solid #EEE', paddingBottom: '5px' }}>
                Datos de Identificación
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#444' }}>
                RUT (Licencia) *
              </label>
              <input
                type="text"
                placeholder="12345678-9"
                required
                value={formData.rut}
                onChange={handleRUTChange}
                onBlur={handleRUTBlur}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #EEE',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#999', fontSize: '11px', marginTop: '4px', display: 'block' }}>Formato: 12345678-9</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#444' }}>
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                required
                value={formData.fechaNacimiento}
                onChange={handleChange('fechaNacimiento')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #EEE',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#444' }}>
                Nombres *
              </label>
              <input
                type="text"
                required
                value={formData.nombres}
                onChange={handleChange('nombres')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #EEE',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#444' }}>
                Apellidos *
              </label>
              <input
                type="text"
                required
                value={formData.apellidos}
                onChange={handleChange('apellidos')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #EEE',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 700, marginBottom: '15px', borderBottom: '1px solid #EEE', paddingBottom: '5px' }}>
                Contacto de Pits
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#444' }}>
                Teléfono *
              </label>
              <input
                type="tel"
                placeholder="+569..."
                required
                value={formData.telefono}
                onChange={handleChange('telefono')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #EEE',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#444' }}>
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={formData.correo}
                onChange={handleChange('correo')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #EEE',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #EEE'
          }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: '12px 25px',
                border: 'none',
                backgroundColor: '#F0F0F0',
                color: '#333',
                cursor: 'pointer',
                borderRadius: '6px',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '13px'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '12px 30px',
                backgroundColor: 'var(--carbon-black)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '13px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? 'Procesando...' : (patient ? 'Actualizar Piloto' : 'Siguiente: Ficha Técnica ->')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;