// Script para generar hashes bcrypt válidos para los usuarios de prueba
const bcrypt = require('bcrypt');

const password = 'password123';
const saltRounds = 10;

const users = [
  'admin@unt.edu.pe',
  'coordinador.fi@unt.edu.pe',
  'coordinador.fct@unt.edu.pe',
  'asesor1@unt.edu.pe',
  'asesor2@unt.edu.pe',
  'estudiante1@unt.edu.pe',
  'estudiante2@unt.edu.pe',
  'estudiante3@unt.edu.pe',
  'rep.empresa1@techcorp.pe',
  'rep.empresa2@innovate.pe',
];

async function generateHashes() {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`\nHash generado para "${password}":`);
  console.log(`${hash}`);
  console.log(`\n-- SQL para actualizar todos los usuarios:`);
  console.log(`UPDATE usuario SET contrasena_hash = '${hash}' WHERE email IN (`);
  console.log(`  ${users.map(u => `'${u}'`).join(',\n  ')}`);
  console.log(`);`);
}

generateHashes().catch(console.error);
