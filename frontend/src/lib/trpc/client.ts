import { createTRPCReact } from '@trpc/react-query';

export const trpc: any = createTRPCReact<any>(); // TODO: replace any with AppRouter once backend type exports are available