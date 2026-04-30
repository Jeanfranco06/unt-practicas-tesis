const requiredBackend = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'FRONTEND_URL',
];
const requiredFrontend = ['NEXT_PUBLIC_API_URL'];

const missingBackend = requiredBackend.filter((name) => !process.env[name]);
const missingFrontend = requiredFrontend.filter((name) => !process.env[name]);

if (missingBackend.length || missingFrontend.length) {
  console.error('Missing required environment variables:');
  if (missingBackend.length) {
    console.error('  Backend:', missingBackend.join(', '));
  }
  if (missingFrontend.length) {
    console.error('  Frontend:', missingFrontend.join(', '));
  }
  process.exit(1);
}

console.log('Environment validation succeeded.');
