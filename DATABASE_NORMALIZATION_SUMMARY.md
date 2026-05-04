# Database Normalization Summary

## Overview
This document summarizes the comprehensive database normalization and restructuring performed on the UNT Internship and Thesis Management System.

## Key Changes Made

### 1. Multi-Role User Management
**Before**: Single role per user stored in `usuario.rol` column
**After**: Many-to-many relationship between users and roles
- New tables: `rol`, `usuario_rol`
- Users can now have multiple roles simultaneously
- Example: A user can be both "Asesor" and "Coordinador"

### 2. Academic Data Normalization
**Before**: Text-based `escuela_profesional` in student table
**After**: Structured academic hierarchy
- New tables: `facultad`, `carrera`
- Foreign key relationships replace text fields
- Improved data integrity and reporting capabilities

### 3. Company-User Relationships
**Before**: Text-based `representante_nombre` in company table
**After**: Proper user-company relationships
- New table: `representante_empresa`
- Company representatives are now system users
- Multiple representatives per company supported

### 4. Teacher Profiles
**Before**: No dedicated teacher entity
**After**: Structured teacher profiles
- New table: `docente`
- Links users to academic departments
- Stores teacher-specific information (specialty, category, etc.)

### 5. Thesis Module Restructuring
**Before**: Fragmented thesis-related tables
**After**: Centralized thesis management
- New main table: `tesis`
- Improved relationships: `asesor_tesis`, `entregable_tesis_mejorado`, `entrega_tesis_mejorada`
- Better data organization and query performance

## Database Schema Changes

### New Tables Created
1. `rol` - User roles definition
2. `usuario_rol` - User-role assignments
3. `facultad` - Academic faculties
4. `carrera` - Academic careers/professional schools
5. `docente` - Teacher profiles
6. `representante_empresa` - Company representatives
7. `tesis` - Main thesis entity
8. `asesor_tesis` - Thesis advisors and jury members
9. `entregable_tesis_mejorado` - Thesis deliverables
10. `entrega_tesis_mejorada` - Thesis submissions

### Modified Tables
1. `usuario` - Removed `rol` column, added role relationships
2. `estudiante` - Replaced `escuela_profesional` with `carrera_id`
3. `empresa` - Removed `representante_nombre`, added representative relationships

### Views for Backward Compatibility
1. `usuario_con_rol` - Simulates old user table structure
2. `estudiante_con_carrera` - Student with career information
3. `empresa_con_representantes` - Company with representative information

## Backend Changes

### Entity Updates
- Updated all TypeORM entities to reflect new relationships
- Added proper foreign key constraints and relationships
- Implemented eager loading where appropriate

### Authentication & Authorization
- Modified JWT tokens to include role arrays instead of single role
- Updated role guards to handle multiple roles
- Added helper functions for role checking
- Maintained backward compatibility where possible

### Service Layer
- Created `RolesService` for role management
- Updated `UsersService` with multi-role support
- Added profile creation methods for different user types
- Implemented role assignment/removal functionality

## Frontend Changes

### Authentication
- Updated JWT parsing to handle role arrays
- Modified `useAuth` hook for multi-role support
- Added role checking utilities (`hasRole`, `hasAnyRole`, `hasAllRoles`)
- Implemented primary role selection for UI display

### Routing
- Updated middleware to handle multi-role routing
- Implemented role-based route protection
- Added support for users with mixed roles

### UI Components
- Updated components to display multiple roles
- Modified forms to handle role selection
- Added career/faculty selection where needed

## Migration Process

### Data Migration
The migration script (`02-migration-normalized.sql`) handles:
1. Creation of new tables and relationships
2. Data migration from old structure to new structure
3. Constraint updates and index creation
4. View creation for backward compatibility

### Rollback Strategy
- Views provide backward compatibility during transition
- Original tables are modified rather than replaced where possible
- Migration can be reversed if needed

## Benefits Achieved

### Data Integrity
- Eliminated data duplication
- Proper foreign key relationships
- Consistent data structure

### Scalability
- Multi-role user support
- Flexible academic structure
- Extensible company relationships

### Performance
- Optimized queries through proper indexing
- Reduced data redundancy
- Improved join operations

### Maintainability
- Clear separation of concerns
- Normalized data structure
- Better code organization

## Next Steps

### Testing
1. Run the migration script on test database
2. Verify data integrity after migration
3. Test all API endpoints with new structure
4. Validate frontend functionality

### Deployment
1. Backup production database
2. Run migration during maintenance window
3. Monitor system performance
4. Update documentation

### Future Enhancements
1. Add role-based permissions granularity
2. Implement audit logging for role changes
3. Add user role history tracking
4. Create administrative interfaces for role management

## Notes for Developers

### Breaking Changes
- JWT token structure changed (role → roles)
- Some API responses now include additional relationship data
- Role checking functions updated

### Compatibility
- Backward compatibility maintained through views
- Legacy API endpoints still functional
- Gradual migration path available

### Best Practices
- Use new role checking functions (`hasRole`, `hasAnyRole`)
- Leverage relationship loading for better performance
- Follow the new entity relationship patterns
