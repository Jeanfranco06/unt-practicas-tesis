import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AuthService } from '../auth/auth.service';
import { InternshipsService } from '../internships/internships.service';
import { ThesisService } from '../thesis/thesis.service';
import { CompaniesService } from '../companies/companies.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';
import { ReportsService } from '../reports/reports.service';
import { z } from 'zod';
import { DashboardRouter } from '../dashboard/dashboard.router';


@Injectable()
export class TrpcRouter {
  constructor(
    private trpc: TrpcService,
    private authService: AuthService,
    private internshipsService: InternshipsService,
    private thesisService: ThesisService,
    private companiesService: CompaniesService,
    private studentsService: StudentsService,
    private usersService: UsersService,
    private reportsService: ReportsService,
    private dashboardRouter: DashboardRouter,
  ) {}

  appRouter = this.trpc.router({
    auth: this.trpc.router({
      login: this.trpc.procedure
        .input(z.object({ email: z.string().email(), contrasena: z.string().min(6) }))
        .mutation(async ({ input }) => this.authService.login(input)),
      register: this.trpc.procedure
        .input(z.object({ email: z.string().email(), contrasena: z.string().min(6), nombre: z.string(), apellidoPaterno: z.string(), apellidoMaterno: z.string(), rol: z.enum(['Administrador', 'Coordinador', 'Asesor', 'Estudiante', 'RepresentanteEmpresa']) }))
        .mutation(async ({ input }) => this.authService.register(input as any)),
      refresh: this.trpc.procedure
        .input(z.object({ refreshToken: z.string() }))
        .mutation(async ({ input }) => this.authService.refreshTokens(input)),
      me: this.trpc.protectedProcedure.query(async ({ ctx }) => {
        return this.usersService.findById(ctx.user.sub);
      }),
    }),
    internships: this.trpc.router({
      listOffers: this.trpc.procedure.query(async () => this.internshipsService.findAllOffers()),
      getOffer: this.trpc.procedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => this.internshipsService.findOfferById(input.id)),
      createOffer: this.trpc.protectedProcedure
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
        .mutation(async ({ input }) => this.internshipsService.createOffer(input as any)),
      updateOffer: this.trpc.protectedProcedure
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
        .mutation(async ({ input }) => this.internshipsService.updateOffer(input.id, input.data as any)),
      deleteOffer: this.trpc.protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const offer = await this.internshipsService.findOfferById(input.id);
          // Soft delete by setting estado to CANCELADA
          offer.estado = 'cancelada' as any;
          return offer;
        }),
      publishOffer: this.trpc.protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => this.internshipsService.publishOffer(input.id)),
      apply: this.trpc.protectedProcedure
        .input(z.object({ ofertaId: z.number(), documentoCvUrl: z.string().optional(), cartaPresentacion: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
          return this.internshipsService.apply({ ...input, estudianteId: ctx.user.sub });
        }),
    }),
    thesis: this.trpc.router({
      listProjects: this.trpc.protectedProcedure.query(async () => this.thesisService.findAllProjects()),
      submitDeliverable: this.trpc.protectedProcedure
        .input(z.object({ entregableId: z.number(), tituloEntrega: z.string(), documentoUrl: z.string().url(), comentario: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
          return this.thesisService.submitDeliverable(input, ctx.user.sub);
        }),
    }),
    reports: this.trpc.router({
      getInternshipData: this.trpc.protectedProcedure.query(async () => this.reportsService.collectInternshipData({})),
      getThesisData: this.trpc.protectedProcedure.query(async () => this.reportsService.collectThesisData({})),
    }),
    dashboard: this.dashboardRouter.router,
  });

  getRouter() {
    return this.appRouter;
  }
}