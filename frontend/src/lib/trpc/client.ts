import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/trpc/router'; // tipado desde backend

export const trpc = createTRPCReact<AppRouter>();