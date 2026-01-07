import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(credentials);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#15151E',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Track Elements */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 8px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-50px',
        right: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'var(--racing-red)',
        filter: 'blur(100px)',
        opacity: 0.2
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '50px 40px',
        borderRadius: '12px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1,
        borderTop: '4px solid var(--racing-red)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            marginBottom: '20px',
            gap: '5px'
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                width: '12px', height: '12px',
                borderRadius: '50%',
                background: i === 3 ? '#00ff00' : '#333',
                boxShadow: i === 3 ? '0 0 10px #00ff00' : 'none'
              }} />
            ))}
          </div>
          <h1 style={{
            margin: '0 0 10px 0',
            color: 'var(--carbon-black)',
            fontSize: '28px',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            letterSpacing: '-1px'
          }}>
            PIT LANE <span style={{ color: 'var(--racing-red)' }}>LOGIN</span>
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Acceso a Telemetría Oftalmológica
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            color: '#D32F2F',
            padding: '12px',
            marginBottom: '25px',
            borderLeft: '4px solid #D32F2F',
            borderRadius: '0 4px 4px 0',
            fontWeight: 500
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>
              ID Piloto (Usuario)
            </label>
            <input
              type="text"
              required
              value={credentials.username}
              onChange={handleChange('username')}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #EEE',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                backgroundColor: '#F9F9F9',
                boxSizing: 'border-box'
              }}
              placeholder="Ingrese usuario..."
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', color: '#888' }}>
              Código de Acceso
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={credentials.password}
                onChange={handleChange('password')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  paddingRight: '50px',
                  border: '2px solid #EEE',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  backgroundColor: '#F9F9F9',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  opacity: 0.5
                }}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !credentials.username || !credentials.password}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--racing-red)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: isLoading ? 'wait' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(255, 24, 1, 0.3)',
              transform: isLoading ? 'none' : 'skewX(-10deg)',
              transition: 'transform 0.2s'
            }}
          >
            {isLoading ? 'Calentando Motores...' : 'Iniciar Carrera ->'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;