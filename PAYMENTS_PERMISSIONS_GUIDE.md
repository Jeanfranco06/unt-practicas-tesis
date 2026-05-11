# Guía de Permisos y Flujo de Trabajo - Módulo de Pagos

## Resumen de Roles y Permisos

### 1. SECRETARÍA (Rol Principal)
**Email de prueba:** `secretaria@unt.edu.pe`

#### Permisos:
- ✅ **Ver lista de pagos** - Todos los pagos del sistema
- ✅ **Ver detalle de pago** - Información completa con auditoría
- ✅ **Crear pagos** - Registrar pagos en nombre de estudiantes
- ✅ **Aprobar pagos** - Cambiar estado de "pendiente" a "completado"
- ✅ **Rechazar pagos** - Cambiar estado a "rechazado" con motivo obligatorio
- ✅ **Filtrar pagos** - Por estado, concepto, búsqueda
- ❌ **Eliminar pagos** - No tiene permiso (solo Admin)
- ❌ **Gestionar conceptos** - No tiene permiso (solo Admin/Coord)

#### Flujo de Trabajo de Secretaría:

```
1. REVISIÓN DIARIA
   └── Acceder a "Gestión de Pagos"
   └── Revisar pagos con estado "Pendiente"
   └── Verificar datos del estudiante y comprobante

2. PROCESAMIENTO DE PAGO
   ├── SI comprobante válido:
   │   └── Click "Aprobar"
   │   └── Pago pasa a estado "Completado"
   │   └── Estudiante recibe notificación
   │
   └── SI comprobante inválido:
       └── Click "Rechazar"
       └── Indicar motivo de rechazo (obligatorio)
       └── Estudiante recibe notificación con motivo

3. REGISTRO MANUAL
   └── Click "Nuevo Pago"
   └── Seleccionar estudiante
   └── Seleccionar concepto (se autocompleta monto)
   └── Indicar método de pago
   └── Guardar referencia/observaciones
   └── Registrar → Estado inicial: "Pendiente"
```

#### Restricciones para Secretaría:
- Solo puede aprobar/rechazar pagos en estado **"Pendiente"**
- No puede modificar pagos ya aprobados/rechazados
- Debe dejar motivo obligatorio al rechazar
- Solo ve pagos de estudiantes activos

---

### 2. ADMINISTRADOR
**Email de prueba:** `admin@unt.edu.pe`

#### Permisos:
- ✅ **Todo lo de Secretaría**
- ✅ **Eliminar pagos** - Eliminar registros de pagos
- ✅ **Gestionar conceptos de pago**
  - Crear nuevos conceptos
  - Editar conceptos existentes
  - Activar/Desactivar conceptos
- ✅ **Ver estadísticas** - Reportes y métricas
- ✅ **Acceso total** - A todas las funcionalidades

#### Flujo de Gestión de Conceptos:
```
1. Crear concepto (ej: "Matrícula 2024-I", "Certificado")
2. Definir monto predeterminado
3. Activar para que aparezca en el sistema
4. Asociar a tipo de pago
```

---

### 3. COORDINADOR
**Emails de prueba:** `coordinador.fi@unt.edu.pe`, `coordinador.fct@unt.edu.pe`

#### Permisos:
- ✅ **Ver lista de pagos** - Solo de su facultad/escuela
- ✅ **Ver detalle de pago**
- ✅ **Aprobar pagos** - De su facultad
- ✅ **Rechazar pagos** - De su facultad
- ❌ **Crear pagos** - No tiene permiso
- ❌ **Gestionar conceptos** - No tiene permiso

#### Restricciones:
- Solo ve pagos de estudiantes de su facultad/escuela asignada
- No puede crear nuevos pagos
- No puede editar conceptos

---

### 4. ESTUDIANTE
**Email de prueba:** `202310001@estudiante.unt.edu.pe`

#### Permisos:
- ✅ **Ver MIS pagos** - Solo sus propios pagos
- ✅ **Ver detalle de MIS pagos**
- ✅ **Subir comprobante** - Adjuntar voucher
- ❌ **Ver otros pagos** - No puede ver pagos de otros
- ❌ **Crear pagos** - El pago debe ser registrado por secretaría
- ❌ **Aprobar/Rechazar** - No tiene permiso

#### Flujo del Estudiante:
```
1. Realiza pago en banco/agente (Yape, Plin, Transferencia, etc.)
2. Accede a "Mis Pagos"
3. Ve pago registrado por secretaría con estado "Pendiente"
4. Puede subir comprobante si no está adjunto
5. Espera aprobación de secretaría
6. Recibe notificación cuando es aprobado/rechazado
```

---

## Matriz de Permisos Detallada

| Funcionalidad | Admin | Secretaría | Coordinador | Estudiante |
|--------------|-------|-----------|-------------|------------|
| Ver lista pagos | ✅ Todos | ✅ Todos | ✅ Solo su facultad | ✅ Solo propios |
| Ver detalle pago | ✅ | ✅ | ✅ | ✅ Solo propios |
| Crear pago | ✅ | ✅ | ❌ | ❌ |
| Aprobar pago | ✅ | ✅ | ✅ Solo su facultad | ❌ |
| Rechazar pago | ✅ | ✅ | ✅ Solo su facultad | ❌ |
| Eliminar pago | ✅ | ❌ | ❌ | ❌ |
| Gestionar conceptos | ✅ | ❌ | ❌ | ❌ |
| Ver estadísticas | ✅ | ✅ | ✅ | ❌ |
| Subir comprobante | ✅ | ✅ | ❌ | ✅ Solo propio |

---

## Estados de Pago y Transiciones

```
                    ┌─────────────────┐
                    │    REGISTRO    │
                    │   (Secretaría)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
         ┌─────────│    PENDIENTE    │─────────┐
         │         │  (Revisión pend.) │         │
         │         └────────┬────────┘         │
         │                  │                   │
    RECHAZAR           APROBAR             CANCELAR
         │                  │                   │
         ▼                  ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    RECHAZADO    │ │   COMPLETADO    │ │    CANCELADO    │
│ (Con motivo)    │ │  (Pago válido)  │ │  (Anulado)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Descripción de Estados:

| Estado | Descripción | Próximo Estado |
|--------|-------------|----------------|
| **Pendiente** | Pago registrado, espera revisión de secretaría | Completado, Rechazado, Cancelado |
| **Procesando** | En proceso de verificación bancaria | Completado, Rechazado |
| **Completado** | Pago verificado y aprobado | Reembolsado (si aplica) |
| **Rechazado** | Pago no válido, con motivo especificado | - |
| **Reembolsado** | Pago devuelto al estudiante | - |
| **Cancelado** | Pago anulado antes de procesar | - |

---

## Validaciones y Restricciones del Sistema

### Al Crear Pago:
- ✅ Estudiante debe existir y estar activo
- ✅ Concepto debe existir y estar activo
- ✅ Monto debe ser > 0
- ✅ Estudiante no debe tener deuda pendiente del mismo concepto (opcional)

### Al Aprobar:
- ✅ Solo pagos en estado "Pendiente" o "Procesando"
- ✅ Usuario debe tener rol Secretaría/Admin/Coord
- ✅ Se registra usuario que aprueba y fecha
- ✅ Se envía notificación al estudiante

### Al Rechazar:
- ✅ Solo pagos en estado "Pendiente"
- ✅ **Motivo de rechazo es OBLIGATORIO**
- ✅ Mínimo 10 caracteres en motivo
- ✅ Se registra fecha de rechazo
- ✅ Se envía notificación al estudiante con motivo

---

## Notificaciones

| Evento | Destinatario | Contenido |
|--------|--------------|-----------|
| Pago registrado | Estudiante | Tu pago fue registrado, está pendiente de revisión |
| Pago aprobado | Estudiante | Tu pago fue aprobado. Código: XXX |
| Pago rechazado | Estudiante | Tu pago fue rechazado. Motivo: [motivo] |
| Pago vencido | Estudiante + Secretaría | Recordatorio de pago próximo a vencer |

---

## URLs del Módulo

| Vista | URL | Roles |
|-------|-----|-------|
| Lista de pagos | `/dashboard/payments` | Admin, Secretaría, Coordinador |
| Detalle de pago | `/dashboard/payments/[id]` | Admin, Secretaría, Coordinador, Estudiante (solo propio) |
| Dashboard Secretaría | `/dashboard/secretary` | Admin, Secretaría, Coordinador |
| Mis pagos (Estudiante) | `/student/payments` | Estudiante |

---

## Consideraciones de Seguridad

1. **Auditoría**: Todo cambio de estado registra:
   - Usuario que realizó la acción
   - Fecha y hora exacta
   - Estado anterior y nuevo

2. **Validación de Permisos**: Backend verifica permisos en cada endpoint

3. **Aislamiento de Datos**:
   - Estudiante solo ve sus propios pagos (validación por studentId)
   - Coordinador solo ve pagos de su facultad

4. **Integridad**:
   - Pagos aprobados no pueden editarse
   - Solo Admin puede eliminar pagos (soft delete recomendado)
