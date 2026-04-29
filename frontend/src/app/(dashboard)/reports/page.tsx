'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InternshipReportPDF } from '@/components/pdf/InternshipReportPDF';
import { ThesisReportPDF } from '@/components/pdf/ThesisReportPDF';
import { trpc } from '@/lib/trpc/react';

export default function ReportsPage() {
  const [type, setType] = useState<'internships' | 'thesis'>('internships');
  const { data: internshipData } = trpc.reports.getInternshipData.useQuery();
  const { data: thesisData } = trpc.reports.getThesisData.useQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Generar Reportes</h1>
      <div className="flex gap-4">
        <Button variant={type === 'internships' ? 'default' : 'outline'} onClick={() => setType('internships')}>
          Prácticas
        </Button>
        <Button variant={type === 'thesis' ? 'default' : 'outline'} onClick={() => setType('thesis')}>
          Tesis
        </Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        {type === 'internships' && internshipData && (
          <PDFDownloadLink document={<InternshipReportPDF data={internshipData} />} fileName="reporte_practicas.pdf">
            {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar Reporte de Prácticas')}
          </PDFDownloadLink>
        )}
        {type === 'thesis' && thesisData && (
          <PDFDownloadLink document={<ThesisReportPDF data={thesisData} />} fileName="reporte_tesis.pdf">
            {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar Reporte de Tesis')}
          </PDFDownloadLink>
        )}
      </div>
    </div>
  );
}