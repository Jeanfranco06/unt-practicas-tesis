'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Company, Offer, OfferFormData } from '../_lib/offers';
import { API_URL, fetchWithAuth, normalizeOfferFormData } from '../_lib/offers';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface OfferFormProps {
  initialData?: Offer | null;
  submitLabel: string;
  title: string;
  onCancel: () => void;
  onSubmit: (data: ReturnType<typeof normalizeOfferFormData>) => Promise<void> | void;
}

export function OfferForm({ initialData, submitLabel, title, onCancel, onSubmit }: OfferFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    titulo: '',
    descripcion: '',
    requisitos: '',
    empresaId: 0,
    cupos: 1,
    fechaInicioPostulacion: '',
    fechaFinPostulacion: '',
    fechaInicioPractica: '',
    fechaFinPractica: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await fetchWithAuth(`${API_URL}/api/companies`);
        const activeCompanies = Array.isArray(data) ? data.filter((company: Company) => company.activo !== false) : [];
        setCompanies(activeCompanies);
        setCompaniesError(null);

        if (!initialData && activeCompanies.length > 0) {
          setFormData((current) => ({
            ...current,
            empresaId: current.empresaId || activeCompanies[0].id,
          }));
        }
      } catch (err: any) {
        setCompaniesError(err.message || 'Error al cargar empresas');
      }
    };

    loadCompanies();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        descripcion: initialData.descripcion || '',
        requisitos: initialData.requisitos || '',
        empresaId: initialData.empresaId || 0,
        cupos: initialData.cupos || 1,
        fechaInicioPostulacion: initialData.fechaInicioPostulacion?.slice(0, 10) || '',
        fechaFinPostulacion: initialData.fechaFinPostulacion?.slice(0, 10) || '',
        fechaInicioPractica: initialData.fechaInicioPractica?.slice(0, 10) || '',
        fechaFinPractica: initialData.fechaFinPractica?.slice(0, 10) || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.empresaId) {
      setCompaniesError('Selecciona una empresa');
      return;
    }

    if (formData.cupos === '' || formData.cupos < 1) {
      setFormData({ ...formData, cupos: 1 });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(normalizeOfferFormData(formData));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="titulo">Titulo</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="bg-slate-800 border-slate-700 text-slate-200"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="descripcion">Descripcion</Label>
          <textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="bg-slate-800 border-slate-700 text-slate-200 rounded-md p-2 min-h-[100px]"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="requisitos">Requisitos</Label>
          <textarea
            id="requisitos"
            value={formData.requisitos}
            onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
            className="bg-slate-800 border-slate-700 text-slate-200 rounded-md p-2 min-h-[100px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cupos">Cupos</Label>
            <Input
              id="cupos"
              type="number"
              min={1}
              value={formData.cupos}
              onChange={(e) => {
                setFormData({ ...formData, cupos: e.target.value === '' ? '' : Number(e.target.value) });
              }}
              className="bg-slate-800 border-slate-700 text-slate-200"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="empresaId">Empresa</Label>
            <select
              id="empresaId"
              value={formData.empresaId ? String(formData.empresaId) : ''}
              onChange={(e) => setFormData({ ...formData, empresaId: Number(e.target.value) })}
              className="flex h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={companies.length === 0}
              required
            >
              {companies.length === 0 ? (
                <option value="">No hay empresas disponibles</option>
              ) : (
                companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.razonSocial}
                  </option>
                ))
              )}
            </select>
            {companiesError && <p className="text-sm text-red-400">{companiesError}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fechaInicioPostulacion">Inicio Postulacion</Label>
            <Input
              id="fechaInicioPostulacion"
              type="date"
              value={formData.fechaInicioPostulacion}
              onChange={(e) => setFormData({ ...formData, fechaInicioPostulacion: e.target.value })}
              className="bg-slate-800 border-slate-700 text-slate-200"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fechaFinPostulacion">Fin Postulacion</Label>
            <Input
              id="fechaFinPostulacion"
              type="date"
              value={formData.fechaFinPostulacion}
              onChange={(e) => setFormData({ ...formData, fechaFinPostulacion: e.target.value })}
              className="bg-slate-800 border-slate-700 text-slate-200"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fechaInicioPractica">Inicio Practica</Label>
            <Input
              id="fechaInicioPractica"
              type="date"
              value={formData.fechaInicioPractica}
              onChange={(e) => setFormData({ ...formData, fechaInicioPractica: e.target.value })}
              className="bg-slate-800 border-slate-700 text-slate-200"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fechaFinPractica">Fin Practica</Label>
            <Input
              id="fechaFinPractica"
              type="date"
              value={formData.fechaFinPractica}
              onChange={(e) => setFormData({ ...formData, fechaFinPractica: e.target.value })}
              className="bg-slate-800 border-slate-700 text-slate-200"
              required
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
            {isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </form>
    </motion.section>
  );
}
