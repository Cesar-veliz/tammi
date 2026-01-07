import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Patient, SearchResult } from '../types';
import { patientAPI } from '../services/api';
import PatientForm from './PatientForm';
import ClinicalRecordForm from './ClinicalRecordForm';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showClinicalForm, setShowClinicalForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async (query?: string) => {
    setIsLoading(true);
    try {
      const result: SearchResult<Patient> = await patientAPI.search(query, 1, 20);
      setPatients(result.data);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients(searchQuery);
  };

  const handlePatientSave = (savedPatient?: Patient) => {
    setShowPatientForm(false);
    loadPatients();

    // If it was a new patient creation (savedPatient exists) and we weren't editing an existing one
    // Note: selectedPatient is the one being edited BEFORE save. 
    // If selectedPatient was null, it means we were creating a NEW one.
    // So if (!selectedPatient && savedPatient), it's a new create flow.
    if (!selectedPatient && savedPatient) {
      setSelectedPatient(savedPatient); // Set the new patient as selected
      setShowClinicalForm(true); // Open the clinical form
    }
  };

  const handleClinicalRecordSaved = () => {
    setShowClinicalForm(false);
    setSelectedPatient(null);
  };

  const formatRUT = (rut: string) => {
    return rut.replace(/(\d{1,2})(\d{3})(\d{3})(\w{1})/, '$1.$2.$3-$4');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  if (showPatientForm) {
    return (
      <PatientForm
        patient={selectedPatient}
        onSave={handlePatientSave}
        onCancel={() => {
          setShowPatientForm(false);
          setSelectedPatient(null);
        }}
      />
    );
  }

  if (showClinicalForm && selectedPatient) {
    return (
      <ClinicalRecordForm
        patient={selectedPatient}
        onSave={handleClinicalRecordSaved}
        onCancel={() => {
          setShowClinicalForm(false);
          setSelectedPatient(null);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F2', paddingBottom: '40px' }}>
      {/* Top Bar with Chequered Flag Pattern */}
      <div style={{
        background: 'var(--carbon-black)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        {/* Chequered flag strip */}
        <div style={{
          height: '10px',
          width: '100%',
          backgroundImage: `
            linear-gradient(45deg, #000 25%, transparent 25%), 
            linear-gradient(-45deg, #000 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #000 75%), 
            linear-gradient(-45deg, transparent 75%, #000 75%)
          `,
          backgroundColor: '#FFF',
          backgroundSize: '20px 20px'
        }} />

        <div style={{
          padding: '15px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '-1px'
            }}>
              Tammi <span style={{ color: 'var(--racing-red)' }}>F1</span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                marginLeft: '10px',
                color: '#888',
                letterSpacing: '1px'
              }}>
                TELEMETRY SYSTEM
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#AAA', textTransform: 'uppercase' }}>
                {user?.role === 'ADMIN' ? 'Team Principal' : 'Race Engineer'}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--racing-red)',
                border: '1px solid var(--racing-red)',
                padding: '8px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--racing-red)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--racing-red)';
              }}
            >
              Pit Stop (Salir)
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats Card - Dashboard F1 Style */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF 0%, #F8F8F8 100%)',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          borderLeft: '5px solid var(--racing-red)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#888', textTransform: 'uppercase' }}>
              Total Pilotos (Pacientes)
            </h2>
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--carbon-black)', fontFamily: 'Arial' }}>
              {totalCount}
            </div>
          </div>
          <div style={{
            fontSize: '60px',
            opacity: 0.1,
            filter: 'grayscale(100%)',
            transform: 'rotate(-20deg)'
          }}>
            🏎️
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', flex: 1 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar piloto por RUT, nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  paddingLeft: '40px',
                  border: '2px solid #EEE',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
            </div>
            <button
              type="submit"
              style={{
                padding: '0 25px',
                backgroundColor: 'var(--carbon-black)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '13px'
              }}
            >
              Buscar
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowPatientForm(true)}
            style={{
              padding: '12px 25px',
              backgroundColor: 'var(--racing-red)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '13px',
              boxShadow: '0 4px 10px rgba(255, 24, 1, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>+</span> Nuevo Piloto
          </button>
        </div>

        {/* Patients Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 30px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FAFAFA'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--carbon-black)' }}>
              Grilla de Salida {searchQuery && <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>({patients.length} resultados)</span>}
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'white', borderBottom: '2px solid #F0F0F0' }}>
                  <th style={{ padding: '15px 30px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>RUT</th>
                  <th style={{ padding: '15px 30px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Piloto</th>
                  <th style={{ padding: '15px 30px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Edad</th>
                  <th style={{ padding: '15px 30px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Contacto</th>
                  <th style={{ padding: '15px 30px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      Cargando datos de telemetría...
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      {searchQuery ? 'No se encontraron pilotos en la búsqueda' : 'No hay pilotos en la grilla'}
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} style={{ borderBottom: '1px solid #F5F5F5', transition: 'background 0.2s' }} className="patient-row">
                      <td style={{ padding: '20px 30px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          backgroundColor: '#F0F0F0',
                          color: '#333',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          {formatRUT(patient.rut)}
                        </span>
                      </td>
                      <td style={{ padding: '20px 30px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--carbon-black)' }}>
                          {patient.nombres} {patient.apellidos}
                        </div>
                      </td>
                      <td style={{ padding: '20px 30px', color: '#555' }}>
                        {calculateAge(patient.fechaNacimiento)} Años
                      </td>
                      <td style={{ padding: '20px 30px' }}>
                        <div style={{ fontSize: '13px', color: '#444' }}>📞 {patient.telefono}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>📧 {patient.correo}</div>
                      </td>
                      <td style={{ padding: '20px 30px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPatientForm(true);
                            }}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#F0F0F0',
                              color: '#333',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowClinicalForm(true);
                            }}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: 'white',
                              color: 'var(--racing-red)',
                              border: '1px solid var(--racing-red)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            + Ficha
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;