import React, { useState } from 'react';
import { Patient, ClinicalRecord } from '../types';
import { clinicalRecordAPI } from '../services/api';

interface ClinicalRecordFormProps {
  patient: Patient;
  record?: ClinicalRecord | null;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  // Medical History
  embarazo: boolean;
  lactancia: boolean;
  hta: boolean;
  dm: boolean;
  otras: string;

  // Ophthalmic Exam - OD (Ojo Derecho)
  od_esfera: string;
  od_cilindro: string;
  od_eje: string;
  od_dp: string;

  // Ophthalmic Exam - OI (Ojo Izquierdo)
  oi_esfera: string;
  oi_cilindro: string;
  oi_eje: string;
  oi_dp: string;

  comentarios: string;
}

const ClinicalRecordForm: React.FC<ClinicalRecordFormProps> = ({
  patient,
  record,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    // Medical History
    embarazo: record?.medicalHistory.embarazo || false,
    lactancia: record?.medicalHistory.lactancia || false,
    hta: record?.medicalHistory.hta || false,
    dm: record?.medicalHistory.dm || false,
    otras: record?.medicalHistory.otras || '',

    // Ophthalmic Exam - OD
    od_esfera: record?.ophthalmicExam.od_esfera?.toString() || '',
    od_cilindro: record?.ophthalmicExam.od_cilindro?.toString() || '',
    od_eje: record?.ophthalmicExam.od_eje?.toString() || '',
    od_dp: record?.ophthalmicExam.od_dp?.toString() || '',

    // Ophthalmic Exam - OI
    oi_esfera: record?.ophthalmicExam.oi_esfera?.toString() || '',
    oi_cilindro: record?.ophthalmicExam.oi_cilindro?.toString() || '',
    oi_eje: record?.ophthalmicExam.oi_eje?.toString() || '',
    oi_dp: record?.ophthalmicExam.oi_dp?.toString() || '',

    comentarios: record?.ophthalmicExam.comentarios || ''
  });

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.checked
    }));
  };

  const handleTextChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const validateOphthalmicValue = (value: string, type: 'esfera' | 'cilindro' | 'eje' | 'dp'): boolean => {
    if (!value) return true; // Optional fields

    const num = parseFloat(value);
    if (isNaN(num)) return false;

    switch (type) {
      case 'esfera':
        return num >= -20 && num <= 20;
      case 'cilindro':
        return num >= -10 && num <= 10;
      case 'eje':
        return Number.isInteger(num) && num >= 0 && num <= 180;
      case 'dp':
        return num >= 50 && num <= 80;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate ophthalmic values
    const validationErrors: string[] = [];

    if (formData.od_esfera && !validateOphthalmicValue(formData.od_esfera, 'esfera')) {
      validationErrors.push('Esfera OD debe estar entre -20 y 20');
    }
    if (formData.od_cilindro && !validateOphthalmicValue(formData.od_cilindro, 'cilindro')) {
      validationErrors.push('Cilindro OD debe estar entre -10 y 10');
    }
    if (formData.od_eje && !validateOphthalmicValue(formData.od_eje, 'eje')) {
      validationErrors.push('Eje OD debe ser un entero entre 0 y 180');
    }
    if (formData.od_dp && !validateOphthalmicValue(formData.od_dp, 'dp')) {
      validationErrors.push('DP OD debe estar entre 50 y 80');
    }

    if (formData.oi_esfera && !validateOphthalmicValue(formData.oi_esfera, 'esfera')) {
      validationErrors.push('Esfera OI debe estar entre -20 y 20');
    }
    if (formData.oi_cilindro && !validateOphthalmicValue(formData.oi_cilindro, 'cilindro')) {
      validationErrors.push('Cilindro OI debe estar entre -10 y 10');
    }
    if (formData.oi_eje && !validateOphthalmicValue(formData.oi_eje, 'eje')) {
      validationErrors.push('Eje OI debe ser un entero entre 0 y 180');
    }
    if (formData.oi_dp && !validateOphthalmicValue(formData.oi_dp, 'dp')) {
      validationErrors.push('DP OI debe estar entre 50 y 80');
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setIsLoading(true);

    try {
      const recordData = {
        medicalHistory: {
          embarazo: formData.embarazo,
          lactancia: formData.lactancia,
          hta: formData.hta,
          dm: formData.dm,
          otras: formData.otras
        },
        ophthalmicExam: {
          od_esfera: formData.od_esfera ? parseFloat(formData.od_esfera) : null,
          od_cilindro: formData.od_cilindro ? parseFloat(formData.od_cilindro) : null,
          od_eje: formData.od_eje ? parseInt(formData.od_eje) : null,
          od_dp: formData.od_dp ? parseFloat(formData.od_dp) : null,
          oi_esfera: formData.oi_esfera ? parseFloat(formData.oi_esfera) : null,
          oi_cilindro: formData.oi_cilindro ? parseFloat(formData.oi_cilindro) : null,
          oi_eje: formData.oi_eje ? parseInt(formData.oi_eje) : null,
          oi_dp: formData.oi_dp ? parseFloat(formData.oi_dp) : null,
          comentarios: formData.comentarios
        }
      };

      if (record) {
        await clinicalRecordAPI.update(record.id, recordData);
      } else {
        await clinicalRecordAPI.create(patient.id, recordData);
      }

      onSave();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar la ficha clínica');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
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
          <div>
            <h2 style={{ margin: 0, color: 'var(--carbon-black)', fontSize: '20px', textTransform: 'uppercase', fontStyle: 'italic' }}>
              📋 {record ? 'TELEMETRÍA: EDITAR FICHA' : '🏎️ TELEMETRÍA: NUEVA FICHA TÉCNICA'}
            </h2>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '5px', fontWeight: 600 }}>
              PILOTO: {patient.nombres} {patient.apellidos} ({patient.rut})
            </div>
          </div>
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

          {/* Medical History Section */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#F9F9F9', borderRadius: '8px', border: '1px solid #EEE' }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '14px',
              textTransform: 'uppercase',
              color: 'var(--racing-red)',
              borderBottom: '2px solid var(--racing-red)',
              display: 'inline-block',
              paddingBottom: '5px'
            }}>
              1. Historial de Mantenimiento (Antecedentes)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
                <input
                  type="checkbox"
                  checked={formData.embarazo}
                  onChange={handleCheckboxChange('embarazo')}
                  disabled={isLoading}
                  style={{ accentColor: 'var(--racing-red)', transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Embarazo</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
                <input
                  type="checkbox"
                  checked={formData.lactancia}
                  onChange={handleCheckboxChange('lactancia')}
                  disabled={isLoading}
                  style={{ accentColor: 'var(--racing-red)', transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Lactancia</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
                <input
                  type="checkbox"
                  checked={formData.hta}
                  onChange={handleCheckboxChange('hta')}
                  disabled={isLoading}
                  style={{ accentColor: 'var(--racing-red)', transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 600, fontSize: '14px' }}>HTA</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #ddd' }}>
                <input
                  type="checkbox"
                  checked={formData.dm}
                  onChange={handleCheckboxChange('dm')}
                  disabled={isLoading}
                  style={{ accentColor: 'var(--racing-red)', transform: 'scale(1.2)' }}
                />
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Diabetes Mellitus</span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#444' }}>
                Otros Antecedentes / Observaciones Previas
              </label>
              <textarea
                value={formData.otras}
                onChange={handleTextChange('otras')}
                disabled={isLoading}
                placeholder="Describa otros antecedentes médicos relevantes..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '60px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Ophthalmic Exam Section */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '14px',
              textTransform: 'uppercase',
              color: 'var(--racing-red)',
              borderBottom: '2px solid var(--racing-red)',
              display: 'inline-block',
              paddingBottom: '5px'
            }}>
              2. Calibración Óptica (Examen)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Ojo Derecho */}
              <div style={{ backgroundColor: '#FFF5F5', padding: '20px', borderRadius: '8px', border: '1px solid #FFCDD2' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#D32F2F', fontSize: '16px', borderBottom: '1px solid #FFCDD2', paddingBottom: '5px', textTransform: 'uppercase' }}>
                  👁️ Ojo Derecho (OD)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 700, color: '#666' }}>ESFERA</label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.od_esfera}
                      onChange={handleTextChange('od_esfera')}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 700, color: '#666' }}>CILINDRO</label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.od_cilindro}
                      onChange={handleTextChange('od_cilindro')}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 700, color: '#666' }}>EJE</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.od_eje}
                      onChange={handleTextChange('od_eje')}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 700, color: '#666' }}>DP</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.od_dp}
                      onChange={handleTextChange('od_dp')}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                </div>
              </div>

              {/* Ojo Izquierdo */}
              <div style={{ backgroundColor: '#F0F7FF', padding: '20px', borderRadius: '8px', border: '1px solid #BBDEFB' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#1976d2', fontSize: '16px', borderBottom: '1px solid #BBDEFB', paddingBottom: '5px', textTransform: 'uppercase' }}>
                  👁️ Ojo Izquierdo (OI)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 700, color: '#666' }}>ESFERA</label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.oi_esfera}
                      onChange={handleTextChange('oi_esfera')}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 700, color: '#666' }}>CILINDRO</label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.oi_cilindro}
                      onChange={handleTextChange('oi_cilindro')}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 700, color: '#666' }}>EJE</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.oi_eje}
                      onChange={handleTextChange('oi_eje')}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 700, color: '#666' }}>DP</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.oi_dp}
                      onChange={handleTextChange('oi_dp')}
                      disabled={isLoading}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comentarios */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#444' }}>
                Notas de Carrera (Comentarios Finales)
              </label>
              <textarea
                value={formData.comentarios}
                onChange={handleTextChange('comentarios')}
                disabled={isLoading}
                placeholder="Observaciones adicionales del examen..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #EEE' }}>
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
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              {isLoading ? 'Guardando...' : '💾 Confirmar Datos Técnicos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicalRecordForm;