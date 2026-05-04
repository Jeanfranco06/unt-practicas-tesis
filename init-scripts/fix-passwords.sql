-- Script para corregir las contraseñas de los usuarios de prueba
-- La contraseña para todos es: 123456

UPDATE usuario 
SET contrasena_hash = '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui'
WHERE email IN (
    'admin@unt.edu.pe',
    'coordinador.fi@unt.edu.pe',
    'coordinador.fct@unt.edu.pe',
    'asesor1@unt.edu.pe',
    'asesor2@unt.edu.pe',
    'estudiante1@unt.edu.pe',
    'estudiante2@unt.edu.pe',
    'estudiante3@unt.edu.pe',
    'rep.empresa1@techcorp.pe',
    'rep.empresa2@innovate.pe'
);
