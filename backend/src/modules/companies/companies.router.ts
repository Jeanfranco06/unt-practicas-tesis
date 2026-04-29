@Injectable()
export class CompaniesRouter {
  router = this.trpc.router({
    list: this.trpc.protectedProcedure.query(() => this.companiesService.findAll()),
    byId: this.trpc.protectedProcedure.input(z.number()).query(({ input }) => this.companiesService.findById(input)),
  });
}