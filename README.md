# Sistema de Gestión Oftalmológica

Sistema de gestión de pacientes diseñado específicamente para consultas oftalmológicas, que permite el registro, almacenamiento y búsqueda de información de pacientes, incluyendo datos personales, antecedentes médicos y exámenes oftalmológicos completos.

## Características

- 🔐 **Autenticación con roles** (Admin/Usuario)
- 👥 **Gestión de pacientes** con validación de RUT chileno
- 🔍 **Búsqueda avanzada** por RUT, nombre y apellido
- 📋 **Antecedentes médicos** completos
- 👁️ **Exámenes oftalmológicos** separados por ojo (OD/OI)
- 📄 **Generación de recetas** en PDF
- 🗄️ **Base de datos PostgreSQL** con Prisma ORM
- ✅ **Testing** con Jest y Property-Based Testing

## Estructura del Proyecto

```
sistema-oftalmologia/
├── backend/          # API Node.js + Express + TypeScript
│   ├── src/         # Código fuente
│   ├── prisma/      # Esquemas y migraciones de base de datos
│   └── package.json
├── frontend/         # Aplicación React + TypeScript
│   ├── src/         # Componentes y páginas
│   └── package.json
└── package.json     # Configuración del monorepo
```

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 13

## Instalación Rápida

### Opción 1: Setup Automático
```bash
node setup-database.js
```

### Opción 2: Setup Manual

1. **Instalar dependencias**
   ```bash
   # Instalar dependencias del backend
   cd backend && npm install
   
   # Instalar dependencias del frontend
   cd ../frontend && npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp backend/.env.example backend/.env
   # Editar backend/.env con tu configuración de PostgreSQL
   ```

3. **Configurar base de datos**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

## Desarrollo

### Inicio Rápido
```bash
# Setup completo y inicio de servidores
npm run setup
npm run dev
```

### Ejecutar por separado
```bash
# Backend (puerto 3001)
npm run dev:backend

# Frontend (puerto 3000)
npm run dev:frontend
```

### Base de datos
```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Sembrar datos iniciales
npm run prisma:seed
```

## Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests del backend
npm run test:backend

# Tests del frontend
npm run test:frontend
```

## Construcción

```bash
# Construir ambos proyectos
npm run build

# Construir por separado
npm run build:backend
npm run build:frontend
```

## Usuarios por Defecto

Después de ejecutar `npm run prisma:seed`:

- **Admin**: `admin` / `admin123`
- **Usuario**: `usuario` / `user123`

## Tecnologías

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticación
- bcryptjs para encriptación
- jsPDF para generación de PDFs
- Jest + fast-check para testing

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- React Hook Form
- Axios
- Vite

## Licencia

Este proyecto es privado y confidencial.