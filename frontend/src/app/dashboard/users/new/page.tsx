'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página de selección de tipo
    router.replace('/dashboard/users/new/select-type');
  }, [router]);

  // Mostrar una página de carga mientras redirige
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
