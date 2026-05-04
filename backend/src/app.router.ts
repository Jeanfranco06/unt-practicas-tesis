import { TrpcRouter } from './modules/trpc/trpc.router';

export type AppRouter = ReturnType<TrpcRouter['getRouter']>;
