'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CompanyFormData, Company } from '../_lib/companies';
import { normalizeCompanyFormData } from '../_lib/companies';

interface CompanyFormProps {
  initialData?: Company | null;
  submitLabel: string;
  title: string;
  onCancel: () => void;
  onSubmit: (data: ReturnType<typeof normalizeCompanyFormData>) => Promise<void> | void;
}

export function CompanyForm({ initialData, submitLabel, title, onCancel, onSubmit }: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    direccion: '',
    telefono: '',
    emailContacto: '',
    representanteNombre: '',
    activo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ruc: initialData.ruc || '',
        razonSocial: initialData.razonSocial || '',
        nombreComercial: initialData.nombreComercial || '',
        direccion: initialData.direccion || '',
        telefono: initialData.telefono || '',
        emailContacto: initialData.emailContacto || '',
        representanteNombre: initialData.representanteNombre || '',
        activo: initialData.activo ?? true,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.ruc.length !== 11) {
      alert('El RUC debe tener 11 dígitos');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(normalizeCompanyFormData(formData));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ruc">RUC *</Label>
            <Input
              id="ruc"
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              className="bg-background border-border text-foreground"
              placeholder="20123456789"
              maxLength={11}
              required
            />
            <p className="text-xs text-muted-foreground">11 dígitos numéricos</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="activo">Estado</Label>
            <select
              id="activo"
              value={formData.activo ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
              className="flex h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="razonSocial">Razón Social *</Label>
          <Input
            id="razonSocial"
            value={formData.razonSocial}
            onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
            className="bg-background border-border text-foreground"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="nombreComercial">Nombre Comercial</Label>
          <Input
            id="nombreComercial"
            value={formData.nombreComercial}
            onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="direccion">Dirección</Label>
          <textarea
            id="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="bg-background border border-border text-foreground rounded-md p-2 min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emailContacto">Email de Contacto</Label>
            <Input
              id="emailContacto"
              type="email"
              value={formData.emailContacto}
              onChange={(e) => setFormData({ ...formData, emailContacto: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="representanteNombre">Nombre del Representante Legal</Label>
          <Input
            id="representanteNombre"
            value={formData.representanteNombre}
            onChange={(e) => setFormData({ ...formData, representanteNombre: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-border text-foreground hover:bg-muted">
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
