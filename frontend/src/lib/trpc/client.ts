import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/app.router';

export const trpc = createTRPCReact<AppRouter>();

// Configuración del cliente (esto va en el provider)
export const getTRPCClientConfig = () => ({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_API_URL}/api/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        }).catch(err => {
          console.error('tRPC fetch error:', err);
          throw new Error(`No se pudo conectar con el servidor: ${err.message}`);
        });
      },
    }),
  ],
});