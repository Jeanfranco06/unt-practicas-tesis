'use client';

import { DataTable } from '@/components/common/DataTable';
import { trpc } from '@/lib/trpc/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'titulo', header: 'Título' },
  { key: 'empresa.razonSocial', header: 'Empresa' },
  { key: 'fechaInicioPostulacion', header: 'Inicio Postulación' },
  { key: 'fechaFinPostulacion', header: 'Fin Postulación' },
  { key: 'estado', header: 'Estado' },
];

export default function InternshipsPage() {
  const { data: offers, isLoading } = trpc.internships.listOffers.useQuery();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ofertas de Práctica</h1>
        <Link href="/dashboard/internships/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Nueva Oferta
          </Button>
        </Link>
      </div>
      <DataTable data={offers || []} columns={columns} />
    </div>
  );
}