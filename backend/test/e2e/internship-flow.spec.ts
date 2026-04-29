import { test, expect } from '@playwright/test';

test('Flujo completo: estudiante postula a una práctica', async ({ page }) => {
  // 1. Login como estudiante
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'estudiante@unt.edu.pe');
  await page.fill('input[name="contrasena"]', '123456');
  await page.click('button[type="submit"]');

  // Esperar redirección al dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);
  
  // 2. Navegar a la página de ofertas de prácticas
  await page.click('text=Prácticas');
  await expect(page).toHaveURL(/.*\/dashboard\/internships/);

  // 3. Verificar que hay al menos una oferta visible
  await page.waitForSelector('table tbody tr');
  const firstOfferTitle = await page.textContent('table tbody tr:first-child td:first-child');
  expect(firstOfferTitle).not.toBeNull();

  // 4. Hacer clic en "Ver detalles" o en el título de la primera oferta
  await page.click('table tbody tr:first-child a:has-text("Ver")'); // asumiendo un enlace
  await expect(page).toHaveURL(/\/dashboard\/internships\/\d+/);

  // 5. Postularse a la oferta
  await page.click('button:has-text("Postularme")');
  
  // Esperar la notificación de éxito o mensaje de confirmación
  await expect(page.locator('text=Postulación exitosa')).toBeVisible({ timeout: 5000 });

  // 6. Navegar a "Mis Postulaciones" (o a la sección de estado)
  await page.click('text=Mis Postulaciones');
  await expect(page).toHaveURL(/.*\/dashboard\/internships\/my-applications/);

  // 7. Verificar que la postulación aparece con estado "postulado"
  const status = await page.textContent('table tbody tr:first-child td:last-child');
  expect(status).toBe('postulado');
});