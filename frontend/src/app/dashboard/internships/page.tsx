'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Search, Building2, Calendar, Edit, Trash2, Eye, Check, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardSkeleton } from '@/components/student/LoadingState';
import { useState, useEffect } from 'react';
import { parseJWT } from '@/lib/jwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const estadoColors: Record<string, string> = {
  'BORRADOR': 'bg-slate-500/20 text-slate-400',
  'PUBLICADA': 'bg-blue-500/20 text-blue-400',
  'CERRADA': 'bg-amber-500/20 text-amber-400',
  'CANCELADA': 'bg-red-500/20 text-red-400',
};

interface Offer {
  id: number;
  titulo: string;
  descripcion?: string;
  requisitos?: string;
  empresa?: { razonSocial: string; id: number };
  empresaId: number;
  cupos: number;
  estado: string;
  fechaInicioPostulacion: string;
  fechaFinPostulacion: string;
  fechaInicioPractica: string;
  fechaFinPractica: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function InternshipsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [viewingOffer, setViewingOffer] = useState<Offer | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(`${API_URL}/api/internships/offers`);
      setOffers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      alert('Oferta creada exitosamente');
      setIsModalOpen(false);
      loadOffers();
    } catch (err: any) {
      alert(err.message || 'Error al crear oferta');
    }
  };

  const handleUpdate = async (id: number, data: any) => {
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      alert('Oferta actualizada exitosamente');
      setIsModalOpen(false);
      setEditingOffer(null);
      loadOffers();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar oferta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return;
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, {
        method: 'DELETE',
      });
      alert('Oferta eliminada exitosamente');
      loadOffers();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar oferta');
    }
  };

  const handlePublish = async (id: number) => {
    if (!confirm('¿Publicar esta oferta?')) return;
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}/publish`, {
        method: 'PATCH',
      });
      alert('Oferta publicada exitosamente');
      loadOffers();
    } catch (err: any) {
      alert(err.message || 'Error al publicar oferta');
    }
  };

  const filteredOffers = offers.filter((o) =>
    o.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.empresa?.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const openViewModal = (offer: Offer) => {
    setViewingOffer(offer);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <p>Error al cargar ofertas: {error}</p>
        <Button onClick={loadOffers} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
          Reintentar
        </Button>
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Prácticas</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de ofertas de prácticas preprofesionales</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nueva Oferta
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Buscar ofertas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredOffers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100">{offer.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                      <Building2 className="w-4 h-4" />
                      <span>{offer.empresa?.razonSocial || 'Empresa no especificada'}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className={`px-2 py-1 text-xs rounded ${estadoColors[offer.estado] || 'bg-slate-800 text-slate-400'}`}>
                        {offer.estado}
                      </span>
                      <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded">
                        {offer.cupos} cupos
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-500 mr-4">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} - {new Date(offer.fechaFinPostulacion).toLocaleDateString()}
                  </div>
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <button onClick={() => openViewModal(offer)} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Ver detalle
                      </button>
                      <button onClick={() => openEditModal(offer)} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Editar
                      </button>
                      {offer.estado === 'BORRADOR' && (
                        <button onClick={() => handlePublish(offer.id)} className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-slate-700 flex items-center gap-2">
                          <Check className="w-4 h-4" /> Publicar
                        </button>
                      )}
                      <button onClick={() => handleDelete(offer.id)} className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredOffers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No se encontraron ofertas</p>
          </div>
        )}
      </motion.div>

      {isModalOpen && (
        <OfferModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOffer(null);
          }}
          onSubmit={editingOffer ? (data) => handleUpdate(editingOffer.id, data) : handleCreate}
          initialData={editingOffer}
        />
      )}

      {viewingOffer && (
        <ViewOfferModal
          offer={viewingOffer}
          onClose={() => setViewingOffer(null)}
        />
      )}
    </motion.div>
  );
}

function OfferModal({ isOpen, onClose, onSubmit, initialData }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: Offer | null;
}) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    empresaId: 1,
    cupos: 1,
    fechaInicioPostulacion: '',
    fechaFinPostulacion: '',
    fechaInicioPractica: '',
    fechaFinPractica: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        descripcion: initialData.descripcion || '',
        requisitos: initialData.requisitos || '',
        empresaId: initialData.empresaId || 1,
        cupos: initialData.cupos || 1,
        fechaInicioPostulacion: initialData.fechaInicioPostulacion?.slice(0, 10) || '',
        fechaFinPostulacion: initialData.fechaFinPostulacion?.slice(0, 10) || '',
        fechaInicioPractica: initialData.fechaInicioPractica?.slice(0, 10) || '',
        fechaFinPractica: initialData.fechaFinPractica?.slice(0, 10) || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      fechaInicioPostulacion: new Date(formData.fechaInicioPostulacion).toISOString(),
      fechaFinPostulacion: new Date(formData.fechaFinPostulacion).toISOString(),
      fechaInicioPractica: new Date(formData.fechaInicioPractica).toISOString(),
      fechaFinPractica: new Date(formData.fechaFinPractica).toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">
            {initialData ? 'Editar Oferta' : 'Nueva Oferta'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
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
                onChange={(e) => setFormData({ ...formData, cupos: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-slate-200"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="empresaId">Empresa ID</Label>
              <Input
                id="empresaId"
                type="number"
                value={formData.empresaId}
                onChange={(e) => setFormData({ ...formData, empresaId: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-slate-200"
                required
              />
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
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              {initialData ? 'Guardar cambios' : 'Crear oferta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewOfferModal({ offer, onClose }: {
  offer: Offer;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Detalle de Oferta</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{offer.titulo}</h3>
            <p className="text-slate-400">{offer.empresa?.razonSocial}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs rounded ${estadoColors[offer.estado] || 'bg-slate-800 text-slate-400'}`}>
              {offer.estado}
            </span>
            <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded">
              {offer.cupos} cupos
            </span>
          </div>
          {offer.descripcion && (
            <div>
              <Label className="text-slate-400 text-sm">Descripcion</Label>
              <p className="text-slate-200 mt-1">{offer.descripcion}</p>
            </div>
          )}
          {offer.requisitos && (
            <div>
              <Label className="text-slate-400 text-sm">Requisitos</Label>
              <p className="text-slate-200 mt-1">{offer.requisitos}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <Label className="text-slate-400 text-sm">Postulacion</Label>
              <p className="text-slate-200 text-sm">
                {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} - {new Date(offer.fechaFinPostulacion).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-slate-400 text-sm">Practica</Label>
              <p className="text-slate-200 text-sm">
                {new Date(offer.fechaInicioPractica).toLocaleDateString()} - {new Date(offer.fechaFinPractica).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-200">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
