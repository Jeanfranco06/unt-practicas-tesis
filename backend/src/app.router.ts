import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Create a dummy tRPC instance just for type inference
const t = initTRPC.create();

// Recreate the router structure for type inference without NestJS dependencies
// This ensures the frontend gets the correct types without needing to resolve all services
const appRouterType = t.router({
  auth: t.router({
    login: t.procedure
      .input(z.object({ email: z.string().email(), contrasena: z.string().min(6) }))
      .mutation(async () => ({} as any)),
    register: t.procedure
      .input(z.object({ email: z.string().email(), contrasena: z.string().min(6), nombre: z.string(), apellidoPaterno: z.string(), apellidoMaterno: z.string(), rol: z.enum(['Administrador', 'Coordinador', 'Asesor', 'Estudiante', 'RepresentanteEmpresa']) }))
      .mutation(async () => ({} as any)),
    refresh: t.procedure
      .input(z.object({ refreshToken: z.string() }))
      .mutation(async () => ({} as any)),
    me: t.procedure.query(async () => ({} as any)),
  }),
  internships: t.router({
    listOffers: t.procedure.query(async () => [] as any[]),
    getOffer: t.procedure
      .input(z.object({ id: z.number() }))
      .query(async () => ({} as any)),
    createOffer: t.procedure
      .input(z.object({
        empresaId: z.number(),
        convenioId: z.number().optional(),
        titulo: z.string().min(3).max(200),
        descripcion: z.string().optional(),
        requisitos: z.string(),
        fechaInicioPostulacion: z.string().datetime(),
        fechaFinPostulacion: z.string().datetime(),
        fechaInicioPractica: z.string().datetime(),
        fechaFinPractica: z.string().datetime(),
        cupos: z.number().min(1),
      }))
      .mutation(async () => ({} as any)),
    updateOffer: t.procedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          empresaId: z.number().optional(),
          convenioId: z.number().optional(),
          titulo: z.string().min(3).max(200).optional(),
          descripcion: z.string().optional(),
          requisitos: z.string().optional(),
          fechaInicioPostulacion: z.string().datetime().optional(),
          fechaFinPostulacion: z.string().datetime().optional(),
          fechaInicioPractica: z.string().datetime().optional(),
          fechaFinPractica: z.string().datetime().optional(),
          cupos: z.number().min(1).optional(),
        }),
      }))
      .mutation(async () => ({} as any)),
    deleteOffer: t.procedure
      .input(z.object({ id: z.number() }))
      .mutation(async () => ({} as any)),
    publishOffer: t.procedure
      .input(z.object({ id: z.number() }))
      .mutation(async () => ({} as any)),
    apply: t.procedure
      .input(z.object({ ofertaId: z.number(), documentoCvUrl: z.string().optional(), cartaPresentacion: z.string().optional() }))
      .mutation(async () => ({} as any)),
    getMyInternship: t.procedure.query(async () => ({} as any)),
    addHoursTracking: t.procedure
      .input(z.object({
        practicaId: z.number(),
        fechaTrabajada: z.string().min(1),
        horas: z.number().min(1),
        descripcionActividad: z.string().min(5),
        evidenciaUrl: z.string().url().optional(),
      }))
      .mutation(async () => ({} as any)),
    getMyAdvisedInternships: t.procedure.query(async () => [] as any[]),
  }),
  thesis: t.router({
    listProjects: t.procedure.query(async () => [] as any[]),
    submitDeliverable: t.procedure
      .input(z.object({ entregableId: z.number(), tituloEntrega: z.string(), documentoUrl: z.string().url(), comentario: z.string().optional() }))
      .mutation(async () => ({} as any)),
    getMyAdvisedThesis: t.procedure.query(async () => [] as any[]),
    getMyAdvisorProjects: t.procedure.query(async () => [] as any[]),
  }),
  reports: t.router({
    getInternshipData: t.procedure.query(async () => ({} as any)),
    getThesisData: t.procedure.query(async () => ({} as any)),
  }),
  academic: t.router({
    faculties: t.router({
      list: t.procedure.query(async () => [] as any[]),
      getById: t.procedure.input(z.object({ id: z.number() })).query(async () => ({} as any)),
      getByCode: t.procedure.input(z.object({ codigo: z.string() })).query(async () => ({} as any)),
      create: t.procedure.input(z.object({
        nombre: z.string().max(200),
        codigo: z.string().max(10),
        descripcion: z.string().max(1000).optional(),
        activo: z.boolean().optional(),
      })).mutation(async () => ({} as any)),
      update: t.procedure.input(z.object({
        id: z.number(),
        data: z.object({
          nombre: z.string().max(200).optional(),
          codigo: z.string().max(10).optional(),
          descripcion: z.string().max(1000).optional(),
          activo: z.boolean().optional(),
        }),
      })).mutation(async () => ({} as any)),
      deactivate: t.procedure.input(z.object({ id: z.number() })).mutation(async () => ({ success: true })),
    }),
    careers: t.router({
      list: t.procedure.query(async () => [] as any[]),
      getById: t.procedure.input(z.object({ id: z.number() })).query(async () => ({} as any)),
      getByCode: t.procedure.input(z.object({ codigo: z.string() })).query(async () => ({} as any)),
      getByFaculty: t.procedure.input(z.object({ facultyId: z.number() })).query(async () => [] as any[]),
      getFirst: t.procedure.query(async () => ({} as any)),
      create: t.procedure.input(z.object({
        facultadId: z.number(),
        nombre: z.string().max(200),
        codigo: z.string().max(10),
        descripcion: z.string().max(1000).optional(),
        activo: z.boolean().optional(),
      })).mutation(async () => ({} as any)),
      update: t.procedure.input(z.object({
        id: z.number(),
        data: z.object({
          facultadId: z.number().optional(),
          nombre: z.string().max(200).optional(),
          codigo: z.string().max(10).optional(),
          descripcion: z.string().max(1000).optional(),
          activo: z.boolean().optional(),
        }),
      })).mutation(async () => ({} as any)),
      deactivate: t.procedure.input(z.object({ id: z.number() })).mutation(async () => ({ success: true })),
    }),
  }),
  notifications: t.router({
    getMyNotifications: t.procedure.input(z.object({ limit: z.number().optional() }).optional()).query(async () => [] as any[]),
    getUnreadCount: t.procedure.query(async () => 0),
    markAsRead: t.procedure.input(z.object({ id: z.number() })).mutation(async () => ({ success: true })),
    archive: t.procedure.input(z.object({ id: z.number() })).mutation(async () => ({ success: true })),
  }),
  dashboard: t.router({
    getStats: t.procedure.query(async () => ({} as any)),
  }),
});

export type AppRouter = typeof appRouterType;
