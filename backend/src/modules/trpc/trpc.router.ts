import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AuthService } from '../auth/auth.service';
import { InternshipsService } from '../internships/internships.service';
import { ThesisService } from '../thesis/thesis.service';
import { CompaniesService } from '../companies/companies.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';
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
    dashboard: this.dashboardRouter.router,
  });

  getRouter() {
    return this.appRouter;
  }
}