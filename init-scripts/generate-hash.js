const bcrypt = require('bcrypt');

const password = '123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Verificar
  bcrypt.compare(password, hash, (err, result) => {
    console.log('Verification:', result);
  });
});
