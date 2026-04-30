'use client';

import { motion } from 'framer-motion';
import { Building2, Plus, Search, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardSkeleton } from '@/components/student/LoadingState';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// Mock data - replace with actual tRPC query
const mockCompanies = [
  { id: 1, razonSocial: 'Desarrollo Digital Perú S.A.C.', nombreComercial: 'DigeSoft', ruc: '20601234567', sector: 'Tecnología', telefono: '+51 1 612 3456', email: 'contacto@digesoft.pe', activo: true },
  { id: 2, razonSocial: 'Soluciones Informáticas del Norte E.I.R.L.', nombreComercial: 'SI Norte', ruc: '20549876543', sector: 'Consultoría TI', telefono: '+51 44 234 567', email: 'info@sinorte.pe', activo: true },
];

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const isLoading = false;

  const filteredCompanies = mockCompanies.filter(c =>
    c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Empresas</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de empresas y convenios</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nueva Empresa
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Buscar empresas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500"
        />
      </motion.div>

      {/* Companies Grid */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {filteredCompanies.map((company) => (
          <motion.div
            key={company.id}
            whileHover={{ scale: 1.01 }}
            className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{company.nombreComercial}</h3>
                  <p className="text-slate-400 text-sm">{company.razonSocial}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    <span className="px-2 py-1 bg-slate-800 rounded">RUC: {company.ruc}</span>
                    <span className="px-2 py-1 bg-slate-800 rounded">{company.sector}</span>
                    {company.activo && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">Activo</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{company.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{company.email}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No se encontraron empresas</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
