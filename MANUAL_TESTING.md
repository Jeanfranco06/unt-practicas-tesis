# Manual de Testing - Sistema de Prácticas y Tesis UNT

Guía completa para probar todos los flujos del sistema paso a paso, comenzando desde el rol de Administrador.

---

## Tabla de Contenidos

1. [Preparación del Entorno](#1-preparación-del-entorno)
2. [Login como Administrador](#2-login-como-administrador)
3. [Panel de Administrador](#3-panel-de-administrador)
4. [Gestión de Empresas](#4-gestión-de-empresas)
5. [Gestión de Usuarios](#5-gestión-de-usuarios)
6. [Testing con Otros Roles](#6-testing-con-otros-roles)
7. [Panel de Coordinador](#7-panel-de-coordinador)
8. [Panel de Representante de Empresa](#8-panel-de-representante-de-empresa)
9. [Panel de Estudiante](#9-panel-de-estudiante)
10. [Panel de Asesor](#10-panel-de-asesor)
11. [Flujo de Prácticas Preprofesionales](#11-flujo-de-prácticas-preprofesionales)
12. [Flujo de Tesis](#12-flujo-de-tesis)
13. [Sistema de Notificaciones](#13-sistema-de-notificaciones)
14. [Perfil y Configuración](#14-perfil-y-configuración)

---

## 1. Preparación del Entorno

### 1.1 Verificar Servicios Activos

Antes de comenzar, asegúrate de que los servicios estén corriendo:

```bash
# Backend (Puerto 4000)
curl http://localhost:4000/api/health
# Esperado: {"status":"ok"}

# Frontend (Puerto 3000)
curl http://localhost:3000
# Esperado: HTML de la aplicación
```

### 1.2 Datos Iniciales Requeridos

El sistema debe tener configurado:
- ✅ Al menos 1 usuario administrador (para iniciar el testing)
- ✅ Carreras/escuelas profesionales en la base de datos
- ✅ Roles básicos creados (ADMIN, COORDINADOR, ASESOR, ESTUDIANTE, REPRESENTANTE_EMPRESA)

---

## 2. Login como Administrador

### 2.1 Acceso al Sistema

**Pasos:**
1. Navegar a `http://localhost:3000/auth/login`
2. Ingresar credenciales de administrador:
   ```
   Email: admin@unt.edu.pe
   Contraseña: [contraseña del admin]
   ```
3. Verificar redirección al Dashboard de Administrador (`/dashboard`)

**Checks:**
- [ ] Login exitoso redirige a `/dashboard`
- [ ] Se muestra el dashboard de administrador
- [ ] Token JWT almacenado en localStorage
- [ ] Menú lateral muestra opciones de admin

### 2.2 Verificar Permisos de Administrador

**En el Dashboard:**
- [ ] Sección "Gestión de Usuarios" visible
- [ ] Sección "Gestión de Empresas" visible
- [ ] Sección "Reportes" visible
- [ ] Estadísticas generales cargan correctamente

---

## 3. Panel de Administrador

### 3.1 Dashboard Principal

**Acceso:** `/dashboard`

**Verificar:**
- [ ] Estadísticas generales cargan
- [ ] Gráficos de usuarios por rol
- [ ] Prácticas activas
- [ ] Accesos rápidos funcionan

### 3.2 Gestión de Usuarios - Lista

**Acceso:** `/dashboard/users`

**Pasos:**
1. Verificar lista de usuarios carga
2. Probar filtros:
   - Por rol (Admin, Coordinador, Asesor, Estudiante, Representante)
   - Por estado (Activo/Inactivo)
   - Por carrera
3. Probar búsqueda por nombre/email
4. Verificar paginación (si aplica)

**Checks:**
- [ ] Lista muestra: Nombre, Email, Rol, Estado
- [ ] Filtros funcionan correctamente
- [ ] Búsqueda encuentra usuarios
- [ ] Click en usuario abre detalle

### 3.3 Crear Estudiante

**Acceso:** `/dashboard/users/new/student`

**Pasos:**
1. Completar formulario:
   ```
   Nombre: Juan
   Apellido Paterno: Pérez
   Apellido Materno: García
   Email: juan.perez@unt.edu.pe
   Contraseña: TempPass123!
   Confirmar: TempPass123!
   Carrera: Ingeniería de Sistemas
   Año de Ingreso: 2024
   ```
2. Verificar códigos autogenerados:
   - Código universitario
   - Escuela profesional
3. Crear usuario
4. Verificar mensaje de éxito

**Checks:**
- [ ] Código universitario generado automáticamente
- [ ] Escuela profesional asignada según carrera
- [ ] Rol ESTUDIANTE asignado
- [ ] Usuario aparece en lista

### 3.4 Crear Docente (Asesor/Coordinador)

**Acceso:** `/dashboard/users/new/teacher`

**Pasos:**
1. Completar datos personales
2. Seleccionar carrera
3. Completar datos académicos:
   - Especialidad
   - Categoría (Auxiliar, Asistente, Asociado, Principal)
   - Dedicación (Tiempo Completo, Medio Tiempo)
4. Seleccionar roles:
   - [x] ASESOR
   - [x] COORDINADOR (opcional)
5. Crear usuario

**Checks:**
- [ ] Perfil docente creado
- [ ] Rol(es) asignados correctamente
- [ ] Aparece en lista de docentes

### 3.5 Crear Representante de Empresa

**Acceso:** `/dashboard/users/new/representative`

**Prerrequisito:** Empresa existente

**Pasos:**
1. Seleccionar empresa existente (o crear nueva primero)
2. Completar datos personales
3. Completar datos laborales:
   - Cargo
   - Departamento
   - Teléfono directo
   - Es representante principal (checkbox)
4. Crear usuario

**Checks:**
- [ ] Vinculado correctamente a empresa
- [ ] Rol REPRESENTANTE_EMPRESA asignado
- [ ] Aparece en perfil de empresa

### 3.6 Crear Administrador

**Acceso:** `/dashboard/users/new/admin`

**Pasos:**
1. Completar datos personales
2. Verificar advertencia de "Acceso total al sistema"
3. Crear usuario

**Checks:**
- [ ] Rol ADMIN asignado
- [ ] Sin perfil adicional requerido

### 3.7 Editar Usuario

**Acceso:** `/dashboard/users/[id]/edit`

**Pasos:**
1. Modificar datos personales
2. Cambiar estado (Activo/Inactivo)
3. Agregar/Quitar roles
4. Guardar cambios

**Checks:**
- [ ] Cambios persisten
- [ ] Rol actualizado refleja en permisos

---

## 4. Gestión de Empresas

### 4.1 Lista de Empresas

**Acceso:** `/dashboard/companies`

**Verificar:**
- [ ] Lista muestra: RUC, Razón Social, Estado
- [ ] Filtros por estado funcionan
- [ ] Búsqueda por RUC o nombre funciona

### 4.2 Crear Empresa

**Acceso:** `/dashboard/companies/new`

**Pasos:**
1. Completar formulario:
   ```
   RUC: 20123456789 (11 dígitos)
   Razón Social: SOFTWARE S.A.C.
   Nombre Comercial: SoftCorp
   Dirección: Av. Principal 123
   Teléfono: 123-456-789
   Email de Contacto: contacto@software.com
   Estado: Activa
   ```
2. Verificar validación de RUC (11 dígitos)
3. Crear empresa

**Checks:**
- [ ] RUC validado (11 dígitos numéricos)
- [ ] Empresa aparece en lista
- [ ] Puede vincularse a representante

### 4.3 Ver Detalle de Empresa

**Acceso:** `/dashboard/companies/[id]`

**Verificar:**
- [ ] Información completa mostrada
- [ ] Convenios listados
- [ ] Ofertas de prácticas listadas
- [ ] Botones Editar/Eliminar funcionan

### 4.4 Editar Empresa

**Acceso:** `/dashboard/companies/[id]/edit`

**Pasos:**
1. Modificar datos
2. Cambiar estado
3. Guardar

### 4.5 Eliminar Empresa

**Pasos:**
1. Click en "Eliminar"
2. Confirmar en diálogo
3. Verificar:
   - [ ] Soft delete (marca como inactiva)
   - [ ] O permanece en BD con flag activo=false

---

## 5. Panel de Coordinador

### 5.1 Dashboard del Coordinador

**Acceso:** `/dashboard/coordinator`

**Verificar:**
- [ ] Estadísticas de su carrera/escuela
- [ ] Prácticas pendientes de aprobación
- [ ] Convenios próximos a vencer

### 5.2 Gestión de Convenios

**Acceso:** `/dashboard/coordinator/agreements`

**Pasos:**
1. Ver lista de convenios
2. Crear nuevo convenio:
   - Seleccionar empresa
   - Tipo (Marco/Específico)
   - Objeto del contrato
   - Fechas de inicio/vencimiento
   - Adjuntar documento
3. Verificar estados: Vigente, Vencido, Renovado

**Checks:**
- [ ] Empresas filtradas correctamente
- [ ] Validación de fechas
- [ ] Documento adjuntado

### 5.3 Aprobación de Prácticas

**Pasos:**
1. Ver lista de prácticas pendientes
2. Revisar solicitud de estudiante
3. Aprobar/Rechazar con comentarios
4. Asignar asesor (si aplica)

---

## 6. Testing con Otros Roles

Después de crear usuarios como administrador, debes probar el sistema con cada rol. Sigue estos pasos para cambiar de usuario:

### 6.1 Logout

**Pasos:**
1. Click en el menú de usuario (esquina superior derecha)
2. Seleccionar "Cerrar Sesión"
3. Verificar redirección a `/auth/login`

### 6.2 Login como Coordinador

**Prerrequisito:** Haber creado un usuario con rol COORDINADOR (sección 5.4 Crear Docente)

**Pasos:**
1. Ingresar credenciales del coordinador
2. Verificar redirección al dashboard de coordinador
3. Probar flujos de la sección 7

### 6.3 Login como Representante de Empresa

**Prerrequisito:** Haber creado empresa (sección 4) y representante (sección 5.5)

**Pasos:**
1. Ingresar credenciales del representante
2. Verificar redirección al panel de empresa
3. Probar flujos de la sección 8

### 6.4 Login como Estudiante

**Prerrequisito:** Haber creado un estudiante (sección 5.3)

**Pasos:**
1. Ingresar credenciales del estudiante
2. Verificar redirección al dashboard de estudiante
3. Probar flujos de la sección 9

### 6.5 Login como Asesor

**Prerrequisito:** Haber creado un docente con rol ASESOR (sección 5.4)

**Pasos:**
1. Ingresar credenciales del asesor
2. Verificar redirección al panel de asesor
3. Probar flujos de la sección 10

### 6.6 Resumen de URLs por Rol

| Rol | URL de Dashboard |
|-----|------------------|
| Admin | `/dashboard` |
| Coordinador | `/dashboard/coordinator` |
| Representante | `/dashboard/company` |
| Estudiante | `/dashboard` o `/student` |
| Asesor | `/dashboard/advisor` |

---

## 7. Panel de Coordinador

### 7.1 Dashboard del Coordinador

**Acceso:** `/dashboard/coordinator`

**Verificar:**
- [ ] Estadísticas de su carrera/escuela
- [ ] Prácticas pendientes de aprobación
- [ ] Convenios próximos a vencer
- [ ] Accesos rápidos a gestión

### 7.2 Gestión de Convenios

**Acceso:** `/dashboard/coordinator/agreements`

**Pasos:**
1. Ver lista de convenios
2. Crear nuevo convenio:
   - Seleccionar empresa
   - Tipo (Marco/Específico)
   - Objeto del contrato
   - Fechas de inicio/vencimiento
   - Adjuntar documento
3. Verificar estados: Vigente, Vencido, Renovado

**Checks:**
- [ ] Empresas filtradas correctamente
- [ ] Validación de fechas
- [ ] Documento adjuntado

### 7.3 Aprobación de Prácticas

**Pasos:**
1. Ver lista de prácticas pendientes
2. Revisar solicitud de estudiante
3. Aprobar/Rechazar con comentarios
4. Asignar asesor (si aplica)

**Checks:**
- [ ] Lista de prácticas pendiente carga
- [ ] Puede aprobar práctica
- [ ] Puede rechazar con motivo
- [ ] Asignación de asesor funciona

### 7.4 Gestión de Tesis

**Acceso:** `/dashboard/coordinator/thesis`

**Pasos:**
1. Ver propuestas de tesis pendientes
2. Revisar documentos de propuesta
3. Aprobar/Rechazar propuesta
4. Asignar/Reasignar asesor

---

## 8. Panel de Representante de Empresa

### 8.1 Perfil de Empresa

**Acceso:** `/dashboard/company/profile`

**Verificar:**
- [ ] Datos de empresa mostrados
- [ ] Puede editar información de contacto
- [ ] No puede modificar RUC/Razón Social

### 8.2 Gestión de Ofertas de Prácticas

**Acceso:** `/dashboard/company/offers` (o similar)

**Pasos:**
1. Crear nueva oferta:
   ```
   Título: Practicante de Desarrollo Web
   Descripción: Desarrollo frontend con React
   Requisitos: Conocimientos en HTML, CSS, JS
   Fecha inicio postulación: [hoy]
   Fecha fin postulación: [+30 días]
   Fecha inicio práctica: [+45 días]
   Fecha fin práctica: [+135 días]
   Cupos: 2
   Convenio: [seleccionar vigente]
   ```
2. Publicar oferta (cambio de estado: borrador → publicada)
3. Ver postulantes
4. Preseleccionar/Rechazar postulantes

**Checks:**
- [ ] Validación de fechas (inicio < fin)
- [ ] Cupos > 0
- [ ] Convenio vigente requerido
- [ ] Cambio de estados funciona

### 8.3 Gestión de Postulaciones

**Verificar:**
- [ ] Lista de postulantes por oferta
- [ ] Ver CV y carta de presentación
- [ ] Cambiar estado: postulado → preseleccionado → aprobado/rechazado
- [ ] Notificaciones automáticas a estudiantes

---

## 9. Panel de Estudiante

### 9.1 Dashboard del Estudiante

**Acceso:** `/dashboard` (como estudiante)

**Verificar:**
- [ ] Prácticas activas
- [ ] Ofertas disponibles
- [ ] Progreso académico

### 9.2 Buscar Ofertas de Prácticas

**Acceso:** `/dashboard/internships/offers` (o similar)

**Pasos:**
1. Ver listado de ofertas publicadas
2. Filtrar por:
   - Carrera/área
   - Ubicación
   - Fecha
3. Ver detalle de oferta
4. Ver información de empresa

### 9.3 Postular a Práctica

**Pasos:**
1. Seleccionar oferta
2. Completar postulación:
   - Subir CV (PDF)
   - Carta de presentación (texto)
3. Confirmar postulación
4. Verificar estado: "postulado"

**Checks:**
- [ ] Solo una postulación activa por vez
- [ ] CV en formato correcto
- [ ] Confirmación de postulación

### 9.4 Ver Estado de Postulaciones

**Verificar:**
- [ ] Lista de postulaciones realizadas
- [ ] Estado actual de cada una
- [ ] Historial de cambios

---

## 10. Panel de Asesor

### 10.1 Dashboard del Asesor

**Acceso:** `/dashboard/advisor`

**Verificar:**
- [ ] Estudiantes asignados
- [ ] Prácticas supervisadas
- [ ] Tesis supervisadas
- [ ] Revisiones pendientes

### 10.2 Supervisión de Prácticas

**Pasos:**
1. Ver lista de estudiantes asignados
2. Acceder a detalle de práctica:
   - Ver avances
   - Descargar documentos
   - Registrar evaluaciones
3. Registrar visita/entrevista
4. Evaluar práctica (formulario)

### 10.3 Supervisión de Tesis

**Pasos:**
1. Ver tesis asignadas
2. Revisar avances de tesis
3. Programar reuniones
4. Registrar evaluaciones

---

## 11. Flujo de Prácticas Preprofesionales

### 11.1 Flujo Completo

```
[Empresa]                    [Coordinador]              [Estudiante]
    |                              |                           |
    | 1. Publicar Oferta           |                           |
    |----------------------------->|                           |
    |                              | 2. Revisar/Validar        |
    |                              |-------------------------->|
    |                              |                           | 3. Postular
    |                              |<--------------------------|
    | 4. Ver postulantes           |                           |
    |<-----------------------------|                           |
    |                              |                           |
    | 5. Preseleccionar            |                           |
    |--------------------------------------------------------->|
    |                              |                           | 6. Aceptar/Rechazar
    |                              |<---------------------------|
    |                              | 7. Aprobar práctica       |
    |                              |-------------------------->|
    |                              | 8. Asignar asesor         |
    |                              |-------------------------->|
    |                              |                           | 9. Iniciar práctica
```

### 11.2 Estados de una Práctica

Verificar transición de estados:
- `postulado` → `preseleccionado` → `aprobado`
- `postulado` → `rechazado`
- `aprobado` → `en_proceso` → `completada`

---

## 12. Flujo de Tesis

### 12.1 Registro de Tesis

**Como Estudiante:**
1. Navegar a `/dashboard/thesis`
2. Crear nueva tesis:
   - Título
   - Línea de investigación
   - Resumen/abstract
   - Seleccionar asesor
3. Subir documento de propuesta

### 12.2 Aprobación de Tesis

**Como Coordinador:**
1. Revisar propuestas pendientes
2. Asignar asesor (si no seleccionó)
3. Aprobar/Rechazar propuesta

### 12.3 Seguimiento de Tesis

**Verificar:**
- [ ] Estudiante puede subir avances
- [ ] Asesor puede revisar y comentar
- [ ] Versiones de documentos
- [ ] Evaluaciones parciales

---

## 13. Sistema de Notificaciones

### 13.1 Notificaciones en Tiempo Real

**Verificar:**
- [ ] Icono de notificaciones en navbar
- [ ] Badge con número de no leídas
- [ ] Dropdown con lista de notificaciones
- [ ] Marcar como leída

### 13.2 Tipos de Notificaciones

Probar que se generan notificaciones para:
- [ ] Nueva postulación recibida (empresa)
- [ ] Cambio de estado en postulación (estudiante)
- [ ] Práctica aprobada (estudiante)
- [ ] Nuevo asesor asignado (estudiante)
- [ ] Convenio próximo a vencer (coordinador)
- [ ] Nuevo usuario creado (admin)

### 13.3 Página de Notificaciones

**Acceso:** `/dashboard/notifications` o `/student/notificaciones`

**Verificar:**
- [ ] Lista completa de notificaciones
- [ ] Filtros por tipo/leídas
- [ ] Paginación
- [ ] Links a recursos relacionados

---

## 14. Perfil y Configuración

### 14.1 Editar Perfil Propio

**Acceso:** `/dashboard/profile`

**Pasos:**
1. Ver datos actuales
2. Modificar datos permitidos
3. Cambiar contraseña
4. Guardar cambios

### 14.2 Configuración del Sistema

**Como Admin:**
- [ ] Configurar parámetros del sistema
- [ ] Gestionar catálogos (carreras, etc.)

---

## Checklist Final de Validación

### Funcionalidad General
- [ ] Todos los roles pueden iniciar sesión
- [ ] Redirección correcta según rol
- [ ] Protección de rutas (404 si no tiene permiso)
- [ ] Responsive design en móvil/tablet
- [ ] Manejo de errores (mensajes claros)

### Gestión de Usuarios
- [ ] Crear todos los tipos de usuario
- [ ] Editar usuario existente
- [ ] Desactivar/Activar usuario
- [ ] Filtros de búsqueda funcionan

### Gestión de Empresas
- [ ] CRUD completo de empresas
- [ ] Validación de RUC
- [ ] Vinculación con representantes

### Prácticas
- [ ] Flujo completo de postulación
- [ ] Cambios de estado funcionan
- [ ] Notificaciones enviadas

### Tesis
- [ ] Registro de tesis
- [ ] Asignación de asesor
- [ ] Seguimiento de avances

### Reportes
- [ ] Generación de reportes
- [ ] Exportación a Excel/PDF

---

## Notas Importantes

### Credenciales de Prueba Sugeridas

Crear estos usuarios para testing:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@unt.edu.pe | Admin123! |
| Coordinador | coord@unt.edu.pe | Coord123! |
| Asesor | asesor@unt.edu.pe | Asesor123! |
| Estudiante | student@unt.edu.pe | Student123! |
| Representante | rep@empresa.com | Rep123! |

### Datos de Prueba para Empresas

```
RUC: 20100012345
Razón Social: TECNOLOGÍAS DEL FUTURO S.A.C.
Nombre Comercial: TechFuture
Dirección: Av. Javier Prado 1234, Lima
Teléfono: 01-234-5678
Email: contacto@techfuture.com.pe
```

### Limpieza de Datos de Prueba

Para reiniciar el sistema:
1. Eliminar usuarios de prueba
2. Eliminar empresas de prueba
3. Limpiar prácticas y tesis de prueba

---

## Reportar Issues

Si encuentras algún problema durante el testing, documentar:
1. Módulo/Flujo afectado
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Screenshots (si aplica)
5. Errores en consola del navegador
6. Logs del backend (si aplica)
