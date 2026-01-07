# Documento de Diseño - Sistema de Gestión Oftalmológica

## Visión General

El Sistema de Gestión Oftalmológica es una aplicación web completa diseñada para consultorios oftalmológicos que permite la gestión integral de pacientes, desde el registro de datos personales hasta el seguimiento de exámenes y la generación de recetas médicas. El sistema implementa un modelo de autenticación basado en roles y proporciona una interfaz intuitiva para el personal médico.

## Arquitectura

### Arquitectura General
El sistema sigue una arquitectura de tres capas:

```
┌─────────────────────────────────────┐
│           Frontend (React)          │
│     - Interfaz de usuario           │
│     - Validación de formularios     │
│     - Gestión de estado             │
└─────────────────────────────────────┘
                    │
                   HTTP/REST
                    │
┌─────────────────────────────────────┐
│        Backend (Node.js/Express)   │
│     - API REST                      │
│     - Lógica de negocio            │
│     - Autenticación JWT            │
│     - Validación de datos          │
└─────────────────────────────────────┘
                    │
                   SQL
                    │
┌─────────────────────────────────────┐
│       Base de Datos (PostgreSQL)   │
│     - Almacenamiento persistente   │
│     - Relaciones entre entidades   │
│     - Índices para búsquedas       │
└─────────────────────────────────────┘
```

### Stack Tecnológico
- **Frontend**: React 18 con TypeScript, Material-UI para componentes
- **Backend**: Node.js con Express y TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Generación PDF**: jsPDF para recetas médicas
- **Validación**: Zod para validación de esquemas

## Componentes e Interfaces

### Componentes Frontend

#### 1. Componente de Autenticación
```typescript
interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
}
```

#### 2. Componente de Gestión de Pacientes
```typescript
interface PatientManagerProps {
  currentUser: User;
}

interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
}
```

#### 3. Componente de Búsqueda
```typescript
interface SearchProps {
  onPatientSelect: (patient: Patient) => void;
}

interface SearchResult {
  patients: Patient[];
  totalCount: number;
}
```

#### 4. Componente de Ficha Clínica
```typescript
interface ClinicalRecordProps {
  patient: Patient;
  onUpdate: (record: ClinicalRecord) => void;
}
```

### APIs Backend

#### 1. API de Autenticación
```typescript
POST /api/auth/login
Body: { username: string, password: string }
Response: { user: User, token: string }

POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean }
```

#### 2. API de Pacientes
```typescript
GET /api/patients?search=<query>&page=<number>
Response: { patients: Patient[], totalCount: number }

POST /api/patients
Body: Patient
Response: { patient: Patient }

PUT /api/patients/:id
Body: Partial<Patient>
Response: { patient: Patient }

GET /api/patients/:id
Response: { patient: Patient }
```

#### 3. API de Fichas Clínicas
```typescript
GET /api/patients/:id/clinical-records
Response: { records: ClinicalRecord[] }

POST /api/patients/:id/clinical-records
Body: ClinicalRecord
Response: { record: ClinicalRecord }

PUT /api/clinical-records/:id
Body: Partial<ClinicalRecord>
Response: { record: ClinicalRecord }
```

#### 4. API de Recetas
```typescript
POST /api/patients/:id/prescription/pdf
Response: PDF Buffer
```

## Modelos de Datos

### Modelo de Usuario
```typescript
interface User {
  id: string;
  username: string;
  password: string; // Encriptada con bcrypt
  role: 'admin' | 'user';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Modelo de Paciente
```typescript
interface Patient {
  id: string;
  rut: string; // Único, formato validado
  nombres: string;
  apellidos: string;
  fechaNacimiento: Date;
  edad: number; // Calculada automáticamente
  telefono: string;
  correo: string;
  createdAt: Date;
  updatedAt: Date;
  clinicalRecords: ClinicalRecord[];
}
```

### Modelo de Antecedentes Médicos
```typescript
interface MedicalHistory {
  id: string;
  embarazo: boolean;
  lactancia: boolean;
  hta: boolean; // Hipertensión Arterial
  dm: boolean;  // Diabetes Mellitus
  otras: string; // Campo de texto libre
  createdAt: Date;
  updatedAt: Date;
}
```

### Modelo de Examen Oftalmológico
```typescript
interface OphthalmicExam {
  id: string;
  // Ojo Derecho
  od_esfera: number;
  od_cilindro: number;
  od_eje: number;
  od_dp: number;
  // Ojo Izquierdo
  oi_esfera: number;
  oi_cilindro: number;
  oi_eje: number;
  oi_dp: number;
  comentarios: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Modelo de Ficha Clínica
```typescript
interface ClinicalRecord {
  id: string;
  patientId: string;
  medicalHistory: MedicalHistory;
  ophthalmicExam: OphthalmicExam;
  createdBy: string; // ID del usuario que creó
  createdAt: Date;
  updatedAt: Date;
}
```

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas de un sistema - esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de corrección verificables por máquinas.*

### Propiedades de Corrección

**Propiedad 1: Autenticación de admin otorga acceso completo**
*Para cualquier* credencial válida de admin, el sistema debe otorgar acceso a todas las funcionalidades disponibles
**Valida: Requerimientos 1.1**

**Propiedad 2: Autenticación de usuario otorga acceso limitado**
*Para cualquier* credencial válida de usuario regular, el sistema debe otorgar solo los permisos asignados a ese rol
**Valida: Requerimientos 1.2**

**Propiedad 3: Credenciales inválidas son rechazadas**
*Para cualquier* credencial inválida, el sistema debe denegar el acceso y mostrar un mensaje de error apropiado
**Valida: Requerimientos 1.3**

**Propiedad 4: Sesiones expiradas requieren reautenticación**
*Para cualquier* sesión expirada, el sistema debe requerir nueva autenticación antes de permitir acceso
**Valida: Requerimientos 1.4**

**Propiedad 5: Contraseñas siempre encriptadas**
*Para cualquier* contraseña almacenada en el sistema, debe estar encriptada usando bcrypt
**Valida: Requerimientos 1.5**

**Propiedad 6: Registro completo de pacientes**
*Para cualquier* paciente registrado exitosamente, el sistema debe almacenar todos los campos obligatorios (RUT, nombres, apellidos, edad, fecha de nacimiento, teléfono, correo)
**Valida: Requerimientos 2.1**

**Propiedad 7: Validación de RUT único y formato**
*Para cualquier* RUT ingresado, el sistema debe validar el formato chileno y garantizar unicidad en la base de datos
**Valida: Requerimientos 2.2**

**Propiedad 8: Prevención de registro incompleto**
*Para cualquier* intento de registro con datos obligatorios faltantes, el sistema debe prevenir el registro y mostrar los campos faltantes
**Valida: Requerimientos 2.3**

**Propiedad 9: Asignación de ID único**
*Para cualquier* paciente registrado exitosamente, el sistema debe asignar un identificador único y confirmar el registro
**Valida: Requerimientos 2.4**

**Propiedad 10: Cálculo automático de edad**
*Para cualquier* fecha de nacimiento válida, el sistema debe calcular automáticamente la edad correcta basada en la fecha actual
**Valida: Requerimientos 2.5**

**Propiedad 11: Almacenamiento de antecedentes como booleanos**
*Para cualquier* registro de antecedentes médicos, los campos embarazo, lactancia, HTA y DM deben almacenarse como valores booleanos
**Valida: Requerimientos 3.1**

**Propiedad 12: Campo de texto libre para otros antecedentes**
*Para cualquier* texto ingresado en el campo "otras", el sistema debe almacenarlo sin restricciones de longitud o formato
**Valida: Requerimientos 3.2**

**Propiedad 13: Historial de cambios en antecedentes**
*Para cualquier* actualización de antecedentes médicos, el sistema debe mantener un registro con fecha, hora y usuario que realizó el cambio
**Valida: Requerimientos 3.3**

**Propiedad 14: Almacenamiento separado de datos oculares**
*Para cualquier* examen oftalmológico registrado, los datos de OD y OI deben almacenarse por separado y ser independientes
**Valida: Requerimientos 4.1**

**Propiedad 15: Validación de rangos oftalmológicos**
*Para cualquier* valor de esfera, cilindro, eje y DP ingresado, el sistema debe validar que esté dentro de los rangos oftalmológicos válidos
**Valida: Requerimientos 4.2**

**Propiedad 16: Comentarios sin límite de caracteres**
*Para cualquier* texto ingresado en comentarios del examen, el sistema debe almacenarlo sin restricciones de longitud
**Valida: Requerimientos 4.3**

**Propiedad 17: Metadatos de examen**
*Para cualquier* examen oftalmológico registrado, el sistema debe asociar automáticamente fecha, hora y usuario que lo registró
**Valida: Requerimientos 4.4**

**Propiedad 18: Ordenamiento cronológico de exámenes**
*Para cualquier* consulta del historial de exámenes, el sistema debe mostrar todos los exámenes ordenados del más reciente al más antiguo
**Valida: Requerimientos 4.5**

**Propiedad 19: Búsqueda exacta por RUT**
*Para cualquier* RUT completo existente en el sistema, la búsqueda debe retornar exactamente ese paciente
**Valida: Requerimientos 5.1**

**Propiedad 20: Búsqueda parcial por RUT**
*Para cualquier* secuencia parcial de dígitos de RUT, la búsqueda debe retornar todos los pacientes cuyos RUTs contengan esa secuencia
**Valida: Requerimientos 5.2**

**Propiedad 21: Búsqueda por nombre y apellido**
*Para cualquier* texto de búsqueda, el sistema debe retornar todos los pacientes cuyos nombres o apellidos contengan ese texto (insensible a mayúsculas)
**Valida: Requerimientos 5.3**

**Propiedad 22: Generación de PDF válido para recetas**
*Para cualquier* solicitud de impresión de receta, el sistema debe generar un documento PDF válido con formato médico profesional
**Valida: Requerimientos 6.1**

**Propiedad 23: Contenido completo en recetas**
*Para cualquier* receta generada, el PDF debe incluir datos del paciente, fecha del examen y prescripción oftalmológica completa
**Valida: Requerimientos 6.2**

**Propiedad 24: Información de contacto en recetas**
*Para cualquier* receta impresa, debe incluir información de contacto de la consulta y datos del médico tratante
**Valida: Requerimientos 6.3**

**Propiedad 25: Registro de generación de recetas**
*Para cualquier* receta generada, el sistema debe registrar la acción en el historial del paciente con fecha y usuario
**Valida: Requerimientos 6.5**

**Propiedad 26: Almacenamiento en base de datos relacional**
*Para cualquier* dato ingresado al sistema, debe almacenarse correctamente en la base de datos PostgreSQL con integridad referencial
**Valida: Requerimientos 7.1**

**Propiedad 27: Confirmación de transacciones**
*Para cualquier* cambio en los datos, el sistema debe confirmar la transacción en la base de datos antes de mostrar mensaje de éxito al usuario
**Valida: Requerimientos 7.2**

**Propiedad 28: Manejo seguro de errores de base de datos**
*Para cualquier* error de base de datos, el sistema debe mostrar un mensaje de error apropiado sin exponer detalles técnicos sensibles
**Valida: Requerimientos 7.3**

**Propiedad 29: Logging de auditoría para datos sensibles**
*Para cualquier* acceso a datos sensibles de pacientes, el sistema debe registrar la actividad en logs de auditoría con usuario, fecha y acción realizada
**Valida: Requerimientos 7.5**

## Manejo de Errores

### Estrategias de Manejo de Errores

1. **Errores de Validación**
   - Validación en el frontend antes del envío
   - Validación en el backend como segunda capa
   - Mensajes de error específicos y útiles para el usuario

2. **Errores de Base de Datos**
   - Manejo de errores de conexión
   - Rollback automático de transacciones fallidas
   - Logging detallado para debugging sin exponer información sensible

3. **Errores de Autenticación**
   - Tokens JWT con expiración apropiada
   - Manejo de sesiones expiradas
   - Protección contra ataques de fuerza bruta

4. **Errores de Red**
   - Reintentos automáticos para operaciones críticas
   - Indicadores de estado de conexión
   - Modo offline para funcionalidades básicas

### Códigos de Error Estándar

```typescript
enum ErrorCodes {
  // Autenticación
  INVALID_CREDENTIALS = 'AUTH_001',
  SESSION_EXPIRED = 'AUTH_002',
  INSUFFICIENT_PERMISSIONS = 'AUTH_003',
  
  // Validación
  INVALID_RUT_FORMAT = 'VAL_001',
  DUPLICATE_RUT = 'VAL_002',
  REQUIRED_FIELD_MISSING = 'VAL_003',
  INVALID_OPHTHALMIC_VALUE = 'VAL_004',
  
  // Base de Datos
  DATABASE_CONNECTION_ERROR = 'DB_001',
  TRANSACTION_FAILED = 'DB_002',
  RECORD_NOT_FOUND = 'DB_003',
  
  // Generación de PDF
  PDF_GENERATION_FAILED = 'PDF_001',
  TEMPLATE_NOT_FOUND = 'PDF_002'
}
```

## Estrategia de Testing

### Enfoque Dual de Testing

El sistema implementará tanto pruebas unitarias como pruebas basadas en propiedades para garantizar corrección integral:

#### Pruebas Unitarias
- **Propósito**: Verificar ejemplos específicos, casos límite y condiciones de error
- **Cobertura**: Funciones individuales, componentes de React, endpoints de API
- **Herramientas**: Jest para el backend, React Testing Library para el frontend
- **Ejemplos**:
  - Validación de formato de RUT con casos específicos válidos e inválidos
  - Renderizado correcto de componentes con datos de prueba
  - Manejo de errores específicos de base de datos

#### Pruebas Basadas en Propiedades
- **Propósito**: Verificar propiedades universales que deben mantenerse en todas las entradas válidas
- **Biblioteca**: fast-check para JavaScript/TypeScript
- **Configuración**: Mínimo 100 iteraciones por propiedad
- **Etiquetado**: Cada prueba debe incluir comentario con formato: `**Feature: sistema-oftalmologia, Property {number}: {property_text}**`

#### Ejemplos de Pruebas Basadas en Propiedades

```typescript
// Ejemplo de prueba de propiedad para cálculo de edad
test('Property 10: Cálculo automático de edad', () => {
  /**Feature: sistema-oftalmologia, Property 10: Cálculo automático de edad**/
  fc.assert(fc.property(
    fc.date({ min: new Date('1900-01-01'), max: new Date() }),
    (fechaNacimiento) => {
      const edad = calcularEdad(fechaNacimiento);
      const edadEsperada = new Date().getFullYear() - fechaNacimiento.getFullYear();
      expect(edad).toBeGreaterThanOrEqual(edadEsperada - 1);
      expect(edad).toBeLessThanOrEqual(edadEsperada);
    }
  ), { numRuns: 100 });
});
```

#### Cobertura de Testing
- **Pruebas unitarias**: Casos específicos y ejemplos concretos
- **Pruebas de propiedades**: Verificación de invariantes y comportamientos universales
- **Pruebas de integración**: Flujos completos de usuario
- **Pruebas de API**: Endpoints con diferentes tipos de entrada

#### Herramientas de Testing
- **Backend**: Jest + fast-check para pruebas basadas en propiedades
- **Frontend**: React Testing Library + Jest + fast-check
- **Base de Datos**: Pruebas con base de datos en memoria (SQLite)
- **API**: Supertest para pruebas de endpoints

### Estrategia de Datos de Prueba

#### Generadores Inteligentes
- **RUT chileno**: Generador que produce RUTs válidos con dígito verificador correcto
- **Datos oftalmológicos**: Generadores que respetan rangos médicos válidos
- **Fechas**: Generadores que producen fechas realistas para pacientes
- **Nombres**: Generadores con caracteres especiales y acentos comunes en español

#### Casos Límite Específicos
- RUTs con formatos edge case (con/sin puntos, con/sin guión)
- Valores oftalmológicos en los límites de rangos válidos
- Fechas de nacimiento que resulten en edades límite (0, 100+ años)
- Campos de texto con caracteres especiales y emojis