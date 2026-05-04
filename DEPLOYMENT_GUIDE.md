# Database Normalization Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the normalized database schema and updated application code.

## Prerequisites
- Access to the database (PostgreSQL)
- Backend application deployed
- Frontend application deployed
- Database backup tools available

## Deployment Steps

### 1. Pre-Deployment Preparation

#### 1.1 Database Backup
```bash
# Create a full backup of the current database
pg_dump -h localhost -U username -d database_name > backup_before_migration.sql

# Verify backup integrity
pg_restore --list backup_before_migration.sql
```

#### 1.2 Application Backup
```bash
# Backend backup
cp -r backend/ backend_backup/

# Frontend backup
cp -r frontend/ frontend_backup/
```

#### 1.3 Environment Variables Check
Ensure all required environment variables are set:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=username
DB_PASSWORD=password
DB_NAME=database_name

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### 2. Database Migration

#### 2.1 Run Migration Script
Execute the migration script in the database:
```bash
psql -h localhost -U username -d database_name -f init-scripts/02-migration-normalized.sql
```

#### 2.2 Verify Migration
Check that all new tables were created:
```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rol', 'usuario_rol', 'facultad', 'carrera', 'docente', 'representante_empresa', 'tesis', 'asesor_tesis', 'entregable_tesis_mejorado', 'entrega_tesis_mejorada');

-- Check data migration
SELECT COUNT(*) as total_users FROM usuario;
SELECT COUNT(*) as total_roles FROM rol;
SELECT COUNT(*) as total_user_roles FROM usuario_rol;
SELECT COUNT(*) as total_students FROM estudiante;
SELECT COUNT(*) as total_careers FROM carrera;
```

#### 2.3 Validate Data Integrity
```sql
-- Check if all students have careers assigned
SELECT COUNT(*) as students_without_career 
FROM estudiante 
WHERE carrera_id IS NULL;

-- Check if all users have roles assigned
SELECT u.id, u.email 
FROM usuario u 
LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id 
WHERE ur.usuario_id IS NULL;

-- Verify faculty-career relationships
SELECT f.nombre as faculty, c.nombre as career 
FROM facultad f 
JOIN carrera c ON f.id = c.facultad_id 
ORDER BY f.nombre, c.nombre;
```

### 3. Backend Deployment

#### 3.1 Update Dependencies
```bash
cd backend
npm install
```

#### 3.2 Build Application
```bash
npm run build
```

#### 3.3 Start Backend Service
```bash
npm run start:prod
```

#### 3.4 Verify Backend Health
```bash
curl http://localhost:3000/health
```

### 4. Frontend Deployment

#### 4.1 Update Dependencies
```bash
cd frontend
npm install
```

#### 4.2 Build Application
```bash
npm run build
```

#### 4.3 Deploy Frontend
```bash
# If using Next.js with standalone output
npm start

# Or deploy to your hosting service
```

### 5. Post-Deployment Verification

#### 5.1 Test Authentication
```bash
# Test login with existing users
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "contrasena": "password"}'
```

#### 5.2 Test Role Management
```bash
# Get user roles
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/users/1/roles

# Test role assignment
curl -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/users/1/roles/2
```

#### 5.3 Test Academic Module
```bash
# Get faculties
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/faculties

# Get careers
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/careers
```

## Testing Checklist

### Authentication Tests
- [ ] Users can log in with existing credentials
- [ ] JWT tokens contain roles array instead of single role
- [ ] Role-based authorization works correctly
- [ ] Multi-role users can access all permitted resources
- [ ] Token refresh works with new role structure

### User Management Tests
- [ ] User creation works with role assignment
- [ ] Role assignment/removal works correctly
- [ ] User profile creation (student/teacher/representative) works
- [ ] User listing shows roles correctly

### Academic Module Tests
- [ ] Faculties can be created and listed
- [ ] Careers can be created and linked to faculties
- [ ] Student profiles show career information
- [ ] Teacher profiles work correctly

### Frontend Tests
- [ ] Login works with new authentication system
- [ ] Dashboard routing works for multi-role users
- [ ] Role-based UI elements display correctly
- [ ] Navigation works based on user roles
- [ ] Forms work with new data structures

### Data Integrity Tests
- [ ] All existing data migrated correctly
- [ ] Foreign key constraints work
- [ ] No orphaned records exist
- [ ] Performance is acceptable

## Rollback Plan

If issues arise during deployment:

### Database Rollback
```bash
# Restore from backup
psql -h localhost -U username -d database_name < backup_before_migration.sql
```

### Application Rollback
```bash
# Restore backend
rm -rf backend/
mv backend_backup/ backend/

# Restore frontend
rm -rf frontend/
mv frontend_backup/ frontend/

# Restart services
```

## Monitoring

### Database Performance
```sql
-- Monitor query performance
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Application Logs
Monitor application logs for:
- Authentication errors
- Database connection issues
- Role-based access denials
- Performance bottlenecks

## Troubleshooting

### Common Issues

#### 1. JWT Token Issues
**Problem**: Users cannot log in after migration
**Solution**: Check that the JWT secret is consistent and tokens are properly formatted with roles array

#### 2. Role Assignment Failures
**Problem**: Role assignment returns errors
**Solution**: Verify that roles exist in the database and user IDs are valid

#### 3. Missing Career Information
**Problem**: Student profiles show no career information
**Solution**: Run the data migration script again or manually assign careers to students

#### 4. Performance Issues
**Problem**: Application is slow after migration
**Solution**: Check database indexes and query optimization

### Support Contacts
- Database Administrator: [Contact Info]
- Backend Developer: [Contact Info]
- Frontend Developer: [Contact Info]

## Post-Deployment Tasks

### 1. Update Documentation
- Update API documentation
- Update user manuals
- Update database schema documentation

### 2. Training
- Train administrators on new role management
- Train users on new interface features
- Provide documentation for new features

### 3. Cleanup
- Remove backup files after successful deployment
- Clean up temporary migration scripts
- Update monitoring dashboards

## Security Considerations

### 1. Role-Based Access
- Verify that role assignments are properly restricted
- Ensure no unauthorized role escalation is possible
- Audit role changes regularly

### 2. Data Privacy
- Ensure sensitive data is properly protected
- Verify that user data migration maintained privacy
- Check access logs for unauthorized access

### 3. Backup Security
- Store backups securely
- Encrypt sensitive backup data
- Limit access to backup files

## Performance Optimization

### 1. Database Indexing
The migration script includes necessary indexes, but monitor performance and add more if needed:
```sql
-- Example: Add index for frequently queried columns
CREATE INDEX CONCURRENTLY idx_usuario_email_activo 
ON usuario(email) WHERE activo = true;
```

### 2. Caching
- Implement caching for frequently accessed data
- Cache user roles and permissions
- Cache academic structure data

### 3. Query Optimization
- Monitor slow queries
- Optimize complex joins
- Consider materialized views for complex reports

## Success Criteria

The deployment is considered successful when:

1. ✅ All existing functionality works without regression
2. ✅ New multi-role system functions correctly
3. ✅ Academic module operates properly
4. ✅ Performance meets or exceeds previous benchmarks
5. ✅ No data loss or corruption occurred
6. ✅ Security measures are intact
7. ✅ User acceptance testing passes
8. ✅ Monitoring shows stable operation

## Next Steps

After successful deployment:

1. Monitor system performance for 48 hours
2. Collect user feedback
3. Plan additional features based on new capabilities
4. Schedule regular maintenance windows
5. Update disaster recovery procedures
