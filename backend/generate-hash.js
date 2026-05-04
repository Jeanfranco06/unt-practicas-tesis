const bcrypt = require('bcrypt');

const password = '123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log('HASH:' + hash);
}).catch(err => {
  console.error('Error:', err);
});
