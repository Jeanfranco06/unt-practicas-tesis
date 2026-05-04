# Estructura Modular del Sistema - UNT Prácticas y Tesis

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
4. [Backend - NestJS](#backend---nestjs)
5. [Frontend - Next.js](#frontend---nextjs)
6. [Módulos Compartidos](#módulos-compartidos)
7. [Flujos Principales](#flujos-principales)

---

## 🎯 Descripción General

Sistema modular para gestión de prácticas académicas y trabajos de tesis de la Universidad Nacional de Trujillo (UNT). Arquitectura de tres capas: **Backend API** (NestJS), **Frontend** (Next.js) y **Base de Datos** (MySQL).

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: NestJS 10.x
- **Lenguaje**: TypeScript
- **Autenticación**: JWT + Passport.js
- **ORM**: TypeORM
- **Base de Datos**: MySQL
- **Testing**: Jest, Playwright (E2E)
- **RPC Framework**: tRPC

### Frontend
- **Framework**: Next.js 15.x
- **Lenguaje**: TypeScript + React 18
- **Estilos**: Tailwind CSS + Radix UI
- **HTTP Client**: tRPC + TanStack Query
- **Formularios**: React Hook Form + Zod
- **PDF**: React-PDF Renderer
- **Análisis**: Framer Motion para animaciones

### Infraestructura
- **Containerización**: Docker + Docker Compose
- **Control de Versiones**: Git

---

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Pages / Rutas (app router)                       │   │
│  │  - Auth / Login                                   │   │
│  │  - Dashboard                                      │   │
│  │  - Student Module                                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Componentes Reutilizables                        │   │
│  │  - Auth / Forms / Charts / PDF / Notifications   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓ tRPC + HTTP
┌─────────────────────────────────────────────────────────┐
│                  BACKEND API (NestJS)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Módulos de Negocio                              │   │
│  │  - Auth / Users / Students / Internships...     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Capas Transversales (Guards, Filters...)        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓ TypeORM
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (MySQL)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend - NestJS

### Estructura de Directorios

```
backend/
├── src/
│   ├── main.ts                          # Punto de entrada
│   ├── app.module.ts                    # Módulo raíz
│   ├── common/                          # Utilidades compartidas
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts      # Obtener usuario actual
│   │   │   └── roles.decorator.ts             # Validación de roles
│   │   ├── enums.ts                           # Enumeraciones globales
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts     # Manejo de excepciones
│   │   ├── guards/
│   │   │   ├── auth.guard.ts                  # Validación JWT
│   │   │   └── roles.guard.ts                 # Control de permisos
│   │   ├── health/                            # Health Check
│   │   │   ├── health.controller.ts
│   │   │   ├── health.module.ts
│   │   │   └── health.service.ts
│   │   └── interceptors/
│   │       └── logging.interceptor.ts         # Logging de requests
│   │
│   ├── modules/                         # Módulos de Negocio
│   │
│   ├── seeds/                           # Seeds para BD
│   │   └── seed.ts
│   │
│   └── test/                            # Tests E2E
│       └── e2e/
│           └── internship-flow.spec.ts
```

### 📦 Módulos de Negocio

#### 1. **Auth Module** - Autenticación y Autorización
```
modules/auth/
├── auth.controller.ts          # Endpoints de login/logout
├── auth.module.ts              # Configuración del módulo
├── auth.service.ts             # Lógica de autenticación
└── strategies/                 # Estrategias Passport
    └── jwt.strategy.ts         # JWT Strategy
```
**Responsabilidades:**
- Login con credentials
- Generación de JWT tokens
- Refresh tokens
- Validación de credenciales

---

#### 2. **Users Module** - Gestión de Usuarios
```
modules/users/
├── users.controller.ts         # CRUD de usuarios
├── users.module.ts             # Configuración
├── users.service.ts            # Lógica de usuarios
├── roles.controller.ts         # Gestión de roles
├── roles.service.ts            # Lógica de roles
├── dto/                        # Data Transfer Objects
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-response.dto.ts
└── entities/                   # Entidades TypeORM
    ├── user.entity.ts
    └── role.entity.ts
```
**Responsabilidades:**
- CRUD completo de usuarios
- Gestión de roles y permisos
- Validación de datos de usuario
- Cambio de contraseña

---

#### 3. **Students Module** - Gestión de Estudiantes
```
modules/students/
├── students.controller.ts      # Endpoints estudiantes
├── students.module.ts
├── students.service.ts         # Lógica de estudiantes
├── students.router.ts          # Router tRPC (opcional)
├── dto/
│   ├── create-student.dto.ts
│   ├── update-student.dto.ts
│   └── student-response.dto.ts
└── entities/
    ├── student.entity.ts       # Entidad estudiante
    └── academic-record.entity.ts
```
**Responsabilidades:**
- Registro y gestión de estudiantes
- Gestión de expedientes académicos
- Validación de datos académicos
- Consulta de progreso académico

---

#### 4. **Internships Module** - Gestión de Prácticas
```
modules/internships/
├── internships.controller.ts   # Endpoints prácticas
├── internships.module.ts
├── internships.service.ts
├── internships.service.spec.ts # Tests unitarios
├── dto/
│   ├── create-internship.dto.ts
│   ├── update-internship.dto.ts
│   └── internship-status.dto.ts
└── entities/
    ├── internship.entity.ts
    ├── internship-status.entity.ts
    └── internship-evaluation.entity.ts
```
**Responsabilidades:**
- Creación y gestión de prácticas
- Seguimiento de estado de prácticas
- Evaluaciones de desempeño
- Reportes de prácticas

---

#### 5. **Thesis Module** - Gestión de Tesis
```
modules/thesis/
├── thesis.controller.ts        # Endpoints tesis
├── thesis.module.ts
├── thesis.service.ts
├── dto/
│   ├── create-thesis.dto.ts
│   ├── update-thesis.dto.ts
│   └── thesis-status.dto.ts
└── entities/
    ├── thesis.entity.ts
    ├── thesis-advisor.entity.ts
    ├── thesis-evaluation.entity.ts
    └── thesis-defense-schedule.entity.ts
```
**Responsabilidades:**
- Registro y seguimiento de tesis
- Asignación de asesores
- Evaluación y calificación
- Programación de defensas

---

#### 6. **Companies Module** - Gestión de Empresas
```
modules/companies/
├── companies.controller.ts     # CRUD empresas
├── companies.module.ts
├── companies.service.ts
├── companies.router.ts
├── dto/
│   ├── create-company.dto.ts
│   └── update-company.dto.ts
└── entities/
    ├── company.entity.ts
    └── company-contact.entity.ts
```
**Responsabilidades:**
- Registro de empresas
- Gestión de contactos
- Validación de datos empresariales
- Consultas de disponibilidad

---

#### 7. **Academic Module** - Gestión Académica
```
modules/academic/
├── academic.module.ts
├── controllers/                # Múltiples controllers
│   ├── careers.controller.ts
│   ├── programs.controller.ts
│   └── courses.controller.ts
├── services/                   # Servicios
│   ├── careers.service.ts
│   ├── programs.service.ts
│   └── courses.service.ts
├── dto/
│   ├── career.dto.ts
│   ├── program.dto.ts
│   └── course.dto.ts
└── entities/
    ├── career.entity.ts
    ├── program.entity.ts
    └── course.entity.ts
```
**Responsabilidades:**
- Gestión de carreras
- Gestión de programas/planes
- Gestión de cursos
- Definición de requisitos académicos

---

#### 8. **Agreements Module** - Convenios
```
modules/agreements/
├── agreements.controller.ts
├── agreements.module.ts
├── agreements.service.ts
├── dto/
└── entities/
    └── agreement.entity.ts
```
**Responsabilidades:**
- Registro de convenios
- Gestión de acuerdos interinstitucionales

---

#### 9. **Dashboard Module** - Dashboard/Reportes
```
modules/dashboard/
├── dashboard.controller.ts
├── dashboard.module.ts
├── dashboard.service.ts
└── dto/
    ├── dashboard-stats.dto.ts
    └── dashboard-chart.dto.ts
```
**Responsabilidades:**
- Estadísticas generales
- Datos para gráficos
- KPIs del sistema

---

#### 10. **Reports Module** - Generación de Reportes
```
modules/reports/
├── reports.controller.ts
├── reports.module.ts
├── reports.service.ts
└── dto/
    ├── report-params.dto.ts
    └── report-output.dto.ts
```
**Responsabilidades:**
- Generación de reportes PDF
- Exportación de datos
- Consolidación de información

---

#### 11. **Notifications Module** - Sistema de Notificaciones
```
modules/notifications/
├── notifications.controller.ts
├── notifications.module.ts
├── notifications.service.ts
├── dto/
│   ├── create-notification.dto.ts
│   └── notification-response.dto.ts
└── entities/
    └── notification.entity.ts
```
**Responsabilidades:**
- Envío de notificaciones
- Gestión de preferencias
- Historial de notificaciones

---

#### 12. **tRPC Module** - API RPC TypeScript
```
modules/trpc/
├── trpc.module.ts
├── trpc.router.ts
├── trpc.service.ts
└── routers/                    # Routers por feature
    ├── auth.router.ts
    ├── students.router.ts
    ├── internships.router.ts
    └── thesis.router.ts
```
**Responsabilidades:**
- Rutas tRPC para comunicación RPC
- Validación con Zod
- Type-safe API calls

---

### 📝 Capas Transversales (Common)

| Componente | Ubicación | Propósito |
|-----------|-----------|----------|
| **Current User Decorator** | `common/decorators/current-user.decorator.ts` | Inyecta usuario actual en handlers |
| **Roles Decorator** | `common/decorators/roles.decorator.ts` | Define roles requeridos en endpoints |
| **Auth Guard** | `common/guards/auth.guard.ts` | Valida presencia de JWT token |
| **Roles Guard** | `common/guards/roles.guard.ts` | Valida roles del usuario |
| **Global Exception Filter** | `common/filters/global-exception.filter.ts` | Manejo centralizado de errores |
| **Logging Interceptor** | `common/interceptors/logging.interceptor.ts` | Registra todas las requests |
| **Health Controller** | `common/health/health.controller.ts` | Endpoint de health check |
| **Enums** | `common/enums.ts` | Constantes y tipos globales |

---

## 🎨 Frontend - Next.js

### Estructura de Directorios

```
frontend/
├── src/
│   ├── middleware.ts                # Middleware Next.js
│   │
│   ├── app/                         # App Router (Next.js 13+)
│   │   ├── layout.tsx               # Layout raíz
│   │   ├── page.tsx                 # Home page
│   │   ├── (auth)/                  # Grupo de rutas auth
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── api/                     # API routes
│   │   │   ├── auth/
│   │   │   └── trpc/
│   │   ├── dashboard/               # Dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   └── student/                 # Módulo estudiante
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── internships/
│   │       ├── thesis/
│   │       └── profile/
│   │
│   ├── components/                  # Componentes Reutilizables
│   │   ├── auth/                    # Componentes de auth
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── password-reset-form.tsx
│   │   ├── charts/                  # Gráficos
│   │   │   ├── bar-chart.tsx
│   │   │   ├── line-chart.tsx
│   │   │   └── pie-chart.tsx
│   │   ├── common/                  # Componentes generales
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── loading-spinner.tsx
│   │   ├── forms/                   # Formularios específicos
│   │   │   ├── student-form.tsx
│   │   │   ├── internship-form.tsx
│   │   │   └── thesis-form.tsx
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── main-layout.tsx
│   │   │   └── auth-layout.tsx
│   │   ├── notifications/           # Sistema de notificaciones
│   │   │   ├── notification-center.tsx
│   │   │   ├── notification-item.tsx
│   │   │   └── toast-notifier.tsx
│   │   ├── pdf/                     # Componentes PDF
│   │   │   ├── internship-report.tsx
│   │   │   └── thesis-report.tsx
│   │   ├── student/                 # Componentes módulo estudiante
│   │   │   ├── student-card.tsx
│   │   │   ├── student-list.tsx
│   │   │   └── student-detail.tsx
│   │   ├── ui/                      # Componentes base UI (Radix)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── switch.tsx
│   │   │   └── modal.tsx
│   │   └── user-profile-selector.tsx # Selector de perfil
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── index.ts                 # Exportación centralizada
│   │   ├── useAuth.ts               # Gestión de autenticación
│   │   ├── useNotifications.ts      # Gestión de notificaciones
│   │   ├── useFetch.ts              # Fetching de datos
│   │   └── useLocalStorage.ts       # Persistencia local
│   │
│   ├── lib/                         # Utilidades y configuración
│   │   ├── jwt.ts                   # Utilidades JWT
│   │   ├── utils.ts                 # Funciones helper
│   │   ├── validations/             # Esquemas Zod
│   │   │   ├── auth.validation.ts
│   │   │   ├── student.validation.ts
│   │   │   ├── internship.validation.ts
│   │   │   └── thesis.validation.ts
│   │   └── trpc/                    # Configuración tRPC
│   │       ├── client.ts            # Cliente tRPC
│   │       ├── server.ts            # Servidor tRPC
│   │       └── react.ts             # React utilities
│   │
│   ├── styles/                      # Estilos globales
│   │   └── globals.css              # CSS global + Tailwind
│   │
│   └── types/                       # Tipos TypeScript
│       ├── index.ts
│       ├── auth.types.ts
│       ├── student.types.ts
│       ├── internship.types.ts
│       └── thesis.types.ts
│
├── public/                          # Archivos estáticos
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── jest.config.js
```

### 🧩 Componentes Principales

#### Auth Components
- `LoginForm` - Formulario de login
- `RegisterForm` - Registro de usuarios
- `PasswordResetForm` - Reset de contraseña
- `ProtectedRoute` - Rutas protegidas

#### Dashboard Components
- Gráficos estadísticos
- Widgets KPI
- Resumen de actividades

#### Student Module Components
- `StudentCard` - Tarjeta de estudiante
- `StudentList` - Listado de estudiantes
- `StudentDetail` - Detalle de estudiante
- `InternshipForm` - Formulario de prácticas
- `ThesisForm` - Formulario de tesis

#### Shared UI Components (Base)
- Button, Card, Input, Select, Tabs, Switch, Modal
- Construidos con Radix UI + Tailwind CSS

---

## 🔄 Módulos Compartidos

### Backend Shared

#### Common Utilities
```
backend/src/common/
├── decorators/          # @CurrentUser, @Roles
├── enums.ts             # Enumeraciones del sistema
├── filters/             # Manejo de excepciones
├── guards/              # Autenticación y autorización
├── health/              # Health checks
└── interceptors/        # Logging, transformación
```

#### Entity Base
- Clase base para todas las entidades
- Timestamps (createdAt, updatedAt)
- Control de auditoría

### Frontend Shared

#### Hooks
- `useAuth` - Estado de autenticación
- `useNotifications` - Notificaciones
- `useFetch` - Fetching de datos
- `useLocalStorage` - Persistencia

#### Utils
- Funciones de formato
- Validación de datos
- Conversión de tipos

#### Validation Schemas
- Esquemas Zod para validación cliente-lado
- Sincronización con DTOs backend

---

## 📊 Flujos Principales

### 1. Flujo de Autenticación

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ POST /auth/login
       ▼
┌──────────────────────┐
│  Auth Controller     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Auth Service        │
│ - Validar creds      │
│ - Generar JWT        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Frontend (Next.js)  │
│ - Almacenar JWT      │
│ - Redirigir          │
└──────────────────────┘
```

### 2. Flujo de Registro de Práctica

```
┌──────────────────┐
│   Estudiante     │
└────────┬─────────┘
         │ Crear práctica
         ▼
┌──────────────────────────────┐
│  Internship Controller        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Internship Service          │
│ - Validar datos              │
│ - Crear registro             │
│ - Generar notificación       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Base de Datos               │
│ - Guardar práctica           │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Notifications Service       │
│ - Notificar a asesor         │
└──────────────────────────────┘
```

### 3. Flujo de Evaluación de Tesis

```
┌──────────────────┐
│   Evaluador      │
└────────┬─────────┘
         │ Enviar evaluación
         ▼
┌──────────────────────────────┐
│  Thesis Controller           │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Thesis Service              │
│ - Guardar evaluación         │
│ - Calcular promedio          │
│ - Determinar estado          │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Base de Datos               │
│ - Actualizar tesis           │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Notifications Service       │
│ - Notificar al estudiante    │
└──────────────────────────────┘
```

---

## 🔐 Seguridad y Permisos

### Roles del Sistema
- **ADMIN** - Acceso total
- **DIRECTOR** - Gestión de programa
- **ADVISOR** - Asesor de prácticas/tesis
- **EVALUATOR** - Evaluador
- **STUDENT** - Estudiante

### Guardias de Acceso
```
Todos los endpoints protegidos

@UseGuards(AuthGuard('jwt'))        ✓ Requiere JWT válido
@UseGuards(RolesGuard)              ✓ Requiere rol específico
@Roles(Role.STUDENT, Role.ADVISOR)  ✓ Roles permitidos
```

---

## 📚 Patrones y Convenciones

### Nomenclatura
- **Servicios**: `{entidad}.service.ts`
- **Controllers**: `{entidad}.controller.ts`
- **DTOs**: `create-{entidad}.dto.ts`, `update-{entidad}.dto.ts`
- **Entidades**: `{entidad}.entity.ts`
- **Módulos**: `{entidad}.module.ts`

### Estructura de Respuestas
```typescript
// Éxito
{
  "data": { /* entidad */ },
  "message": "Operación exitosa",
  "statusCode": 200
}

// Error
{
  "message": "Descripción del error",
  "statusCode": 400,
  "error": "BadRequest"
}
```

### DTOs (Data Transfer Objects)
```typescript
// Create DTO - Para creación
export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsEmail()
  email: string;
}

// Update DTO - Para actualización (campos opcionales)
export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName?: string;
}

// Response DTO - Para respuestas
export class StudentResponseDto {
  id: string;
  firstName: string;
  email: string;
  createdAt: Date;
}
```

---

## 🧪 Testing

### Backend
- **Unit Tests**: Jest
- **E2E Tests**: Playwright
- **Coverage**: Objetivo 80%+
- **Ubicación**: `test/`, `*.spec.ts`

### Frontend
- **Unit Tests**: Jest
- **Testing Library**: React Testing Library
- **Coverage**: Objetivo 80%+

---

## 📦 Infraestructura

### Docker
```yaml
# docker-compose.yml
- Backend (Node.js + NestJS)
- Frontend (Node.js + Next.js)
- MySQL (Base de datos)
```

### Variables de Entorno
```
BACKEND: PORT, DATABASE_URL, JWT_SECRET
FRONTEND: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL
DATABASE: MYSQL_ROOT_PASSWORD, MYSQL_DATABASE
```

---

## 🚀 Puntos de Entrada

### Backend
- `backend/src/main.ts` - Bootstrapping de NestJS
- `backend/src/app.module.ts` - Módulo raíz
- Puerto por defecto: 3000

### Frontend
- `frontend/src/app/layout.tsx` - Layout raíz
- `frontend/src/app/page.tsx` - Home
- Puerto por defecto: 3001

### Base de Datos
- `init-scripts/` - Scripts de inicialización
- `create-db.sql` - Creación de base de datos
- Normalizaciones: `DATABASE_NORMALIZATION_SUMMARY.md`

---

## 📖 Documentación Adicional

- **Database Normalization**: [DATABASE_NORMALIZATION_SUMMARY.md](./DATABASE_NORMALIZATION_SUMMARY.md)
- **Docker Setup**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Admin Flow**: [ADMIN_USER_CREATION_FLOW.md](./ADMIN_USER_CREATION_FLOW.md)
- **User Management**: [USER_MANAGEMENT_FLOW.md](./USER_MANAGEMENT_FLOW.md)

---

## 📝 Resumen de Capas

| Capa | Tecnología | Módulos |
|------|-----------|---------|
| **Frontend** | Next.js 15 | Pages, Components, Hooks, Lib |
| **API Gateway** | tRPC | Type-safe RPC |
| **Backend** | NestJS 10 | 12 módulos de negocio |
| **Base de Datos** | MySQL | Entidades normalizadas |
| **DevOps** | Docker | Containerización |

---

**Última actualización**: Mayo 2026
**Versión del Sistema**: 1.0.0
