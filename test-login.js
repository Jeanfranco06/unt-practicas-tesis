const bcrypt = require('bcrypt');

// Hash from database
const hash = '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui';
const password = '123456';

console.log('Testing bcrypt comparison...');
console.log('Hash:', hash);
console.log('Password:', password);

bcrypt.compare(password, hash).then(result => {
  console.log('Password match result:', result);
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
