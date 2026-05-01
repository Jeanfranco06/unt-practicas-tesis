"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Edit, Trash2, Building2, Users, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { API_URL, estadoColors, fetchWithAuth } from "../_lib/offers";
import type { Offer } from "../_lib/offers";

interface ConfirmAction {
  show: boolean;
  action: 'delete' | null;
}

export default function InternshipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({ show: false, action: null });

  useEffect(() => {
    const loadOffer = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`);
        setOffer(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al cargar oferta");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadOffer();
  }, [id]);

  const handleDelete = async () => {
    setConfirmAction({ show: false, action: null });
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, {
        method: "DELETE",
      });
      toast({ 
        title: "Éxito", 
        description: "La oferta fue cancelada exitosamente.",
        variant: "default"
      });
      router.push("/dashboard/internships");
      router.refresh();
    } catch (err: any) {
      toast({ 
        title: "No se pudo cancelar la oferta", 
        description: err.message,
        variant: "destructive" 
      });
    }
  };

  const showDeleteConfirm = () => {
    setConfirmAction({ show: true, action: 'delete' });
  };

  if (isLoading) return <div className="text-muted-foreground">Cargando oferta...</div>;

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
        <p>Error al cargar oferta: {error}</p>
      </div>
    );
  }

  if (!offer) return <div className="text-muted-foreground">Oferta no encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button asChild variant="ghost" className="mb-3 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/internships">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a prácticas
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Detalle de Oferta</h1>
          <p className="text-muted-foreground text-sm mt-1">Información completa de la práctica preprofesional</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
            <Link href={`/dashboard/internships/${offer.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Link>
          </Button>
          {offer.estado !== "cancelada" && (
            <Button onClick={showDeleteConfirm} variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
              <Trash2 className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          )}
        </div>
      </div>

      <section className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{offer.titulo}</h2>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{offer.empresa?.razonSocial || "Empresa no especificada"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs rounded ${estadoColors[offer.estado] || "bg-muted text-muted-foreground"}`}>
              {offer.estado}
            </span>
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded flex items-center gap-1">
              <Users className="w-3 h-3" /> {offer.cupos} cupos
            </span>
          </div>

          {offer.descripcion && (
            <div>
              <Label className="text-muted-foreground text-sm">Descripcion</Label>
              <p className="text-foreground mt-1 whitespace-pre-line">{offer.descripcion}</p>
            </div>
          )}

          {offer.requisitos && (
            <div>
              <Label className="text-muted-foreground text-sm">Requisitos</Label>
              <p className="text-foreground mt-1 whitespace-pre-line">{offer.requisitos}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Postulacion
              </Label>
              <p className="text-foreground text-sm mt-2">
                {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} - {new Date(offer.fechaFinPostulacion).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Practica
              </Label>
              <p className="text-foreground text-sm mt-2">
                {new Date(offer.fechaInicioPractica).toLocaleDateString()} - {new Date(offer.fechaFinPractica).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ show: false, action: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">Cancelar oferta</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    ¿Estás seguro de que deseas cancelar la oferta "{offer?.titulo}"? La oferta no será visible pero los datos se conservarán.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, action: null })}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Cancelar oferta
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
