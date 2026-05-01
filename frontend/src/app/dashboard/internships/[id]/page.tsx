"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Edit, Trash2, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { API_URL, estadoColors, fetchWithAuth } from "../_lib/offers";
import type { Offer } from "../_lib/offers";

export default function InternshipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!confirm("¿Estás seguro de eliminar esta oferta?")) return;
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, {
        method: "DELETE",
      });
      toast({ title: "Oferta eliminada", description: "La oferta fue eliminada exitosamente." });
      router.push("/dashboard/internships");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error al eliminar oferta", description: err.message || "No se pudo eliminar la oferta.", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="text-slate-400">Cargando oferta...</div>;

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <p>Error al cargar oferta: {error}</p>
      </div>
    );
  }

  if (!offer) return <div className="text-slate-400">Oferta no encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button asChild variant="ghost" className="mb-3 text-slate-400 hover:text-white">
            <Link href="/dashboard/internships">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a prácticas
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-100">Detalle de Oferta</h1>
          <p className="text-slate-400 text-sm mt-1">Información completa de la práctica preprofesional</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
            <Link href={`/dashboard/internships/${offer.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Link>
          </Button>
          <Button onClick={handleDelete} variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
        </div>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{offer.titulo}</h2>
            <div className="flex items-center gap-2 mt-2 text-slate-400">
              <Building2 className="w-4 h-4" />
              <span>{offer.empresa?.razonSocial || "Empresa no especificada"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs rounded ${estadoColors[offer.estado] || "bg-slate-800 text-slate-400"}`}>{offer.estado}</span>
            <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded flex items-center gap-1">
              <Users className="w-3 h-3" /> {offer.cupos} cupos
            </span>
          </div>

          {offer.descripcion && (
            <div>
              <Label className="text-slate-400 text-sm">Descripcion</Label>
              <p className="text-slate-200 mt-1 whitespace-pre-line">{offer.descripcion}</p>
            </div>
          )}

          {offer.requisitos && (
            <div>
              <Label className="text-slate-400 text-sm">Requisitos</Label>
              <p className="text-slate-200 mt-1 whitespace-pre-line">{offer.requisitos}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-lg bg-slate-800/50">
              <Label className="text-slate-400 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Postulacion
              </Label>
              <p className="text-slate-200 text-sm mt-2">
                {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} - {new Date(offer.fechaFinPostulacion).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50">
              <Label className="text-slate-400 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Practica
              </Label>
              <p className="text-slate-200 text-sm mt-2">
                {new Date(offer.fechaInicioPractica).toLocaleDateString()} - {new Date(offer.fechaFinPractica).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}