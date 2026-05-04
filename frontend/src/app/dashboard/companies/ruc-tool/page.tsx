'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RUCHelper } from '../_lib/ruc-helper';

export default function RUCToolPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Herramienta de RUC</h1>
        </div>

        <div className="grid gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Validador y Generador de RUC</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Utiliza esta herramienta para validar RUCs peruanos según el algoritmo SUNAT,
              calcular el dígito verificador o generar RUCs de prueba válidos.
            </p>
            <RUCHelper />
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Información sobre RUC</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <strong>Formato:</strong> 11 dígitos numéricos
              </li>
              <li>
                <strong>Primeros 2 dígitos (Tipo):</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>10 - Persona Natural con Negocio</li>
                  <li>15 - Organismos Públicos</li>
                  <li>16 - Organismos Públicos</li>
                  <li>17 - Organismos Públicos</li>
                  <li>20 - Persona Jurídica</li>
                </ul>
              </li>
              <li>
                <strong>Dígito Verificador:</strong> Último dígito calculado según algoritmo SUNAT
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">RUCs de Prueba Válidos</h3>
            <div className="space-y-2 text-sm font-mono text-muted-foreground">
              <p>20100070970</p>
              <p>20512345671</p>
              <p>15012345671</p>
              <p>16012345678</p>
              <p>17012345674</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
