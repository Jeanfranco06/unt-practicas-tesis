"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Briefcase, Plus, Search, Building2, Calendar, Edit, Trash2, Eye, Check, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CardSkeleton } from "@/components/student/LoadingState";
import { API_URL, estadoColors, fetchWithAuth } from "./_lib/offers";
import type { Offer } from "./_lib/offers";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function InternshipsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta oferta?")) return;
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, {
        method: "DELETE",
      });
      toast({ title: "Oferta eliminada", description: "La oferta fue eliminada exitosamente." });
      loadOffers();
    } catch (err: any) {
      toast({ title: "Error al eliminar oferta", description: err.message || "No se pudo eliminar la oferta.", variant: "destructive" });
    }
  };

  const handlePublish = async (id: number) => {
    if (!confirm("¿Publicar esta oferta?")) return;
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}/publish`, {
        method: "PATCH",
      });
      toast({ title: "Oferta publicada", description: "La oferta fue publicada exitosamente." });
      loadOffers();
    } catch (err: any) {
      toast({ title: "Error al publicar oferta", description: err.message || "No se pudo publicar la oferta.", variant: "destructive" });
    }
  };

  const filteredOffers = offers.filter((offer) =>
    offer.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.empresa?.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Prácticas</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de ofertas de prácticas preprofesionales</p>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link href="/dashboard/internships/new">
            <Plus className="h-4 w-4 mr-2" /> Nueva Oferta
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input type="search" placeholder="Buscar ofertas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredOffers.map((offer) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} whileHover={{ scale: 1.01 }} className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100">{offer.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                      <Building2 className="w-4 h-4" />
                      <span>{offer.empresa?.razonSocial || "Empresa no especificada"}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className={`px-2 py-1 text-xs rounded ${estadoColors[offer.estado] || "bg-slate-800 text-slate-400"}`}>{offer.estado}</span>
                      <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded">{offer.cupos} cupos</span>
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
                      <Link href={`/dashboard/internships/${offer.id}`} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"><Eye className="w-4 h-4" /> Ver detalle</Link>
                      <Link href={`/dashboard/internships/${offer.id}/edit`} className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"><Edit className="w-4 h-4" /> Editar</Link>
                      {offer.estado === "BORRADOR" && (
                        <button onClick={() => handlePublish(offer.id)} className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-slate-700 flex items-center gap-2"><Check className="w-4 h-4" /> Publicar</button>
                      )}
                      <button onClick={() => handleDelete(offer.id)} className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Eliminar</button>
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
    </motion.div>
  );
}
