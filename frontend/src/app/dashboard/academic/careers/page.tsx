'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, AlertCircle, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      message = errorData.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

interface Career {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  facultadId: number;
  creadoEn: Date;
}

interface Faculty {
  id: number;
  nombre: string;
  codigo: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function CareersPage() {
  const { toast } = useToast();
  const [careers, setCareers] = useState<Career[]>([]);
  const [faculties, setFaculties] = useState<Map<number, Faculty>>(new Map());
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return; // Evitar múltiples ejecuciones
    loadedRef.current = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [careersData, facultiesData] = await Promise.all([
          fetchWithAuth('/api/academic/careers'),
          fetchWithAuth('/api/academic/faculties'),
        ]);
        setCareers(careersData);
        setFilteredCareers(careersData);

        const facultyMap = new Map<number, Faculty>();
        facultiesData.forEach((f: Faculty) => {
          facultyMap.set(f.id, f);
        });
        setFaculties(facultyMap);
      } catch (err) {
        console.error('Error loading data:', err);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredCareers(careers);
    } else {
      setFilteredCareers(
        careers.filter(
          (career) =>
            career.nombre.toLowerCase().includes(value) ||
            career.codigo.toLowerCase().includes(value)
        )
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCareer) return;
    setDeactivating(true);
    try {
      await fetchWithAuth(`/api/academic/careers/${selectedCareer.id}/deactivate`, {
        method: 'PATCH',
      });
      toast({
        title: 'Éxito',
        description: 'Carrera desactivada correctamente',
      });
      setCareers(careers.filter(c => c.id !== selectedCareer.id));
      setFilteredCareers(filteredCareers.filter(c => c.id !== selectedCareer.id));
      setShowDeleteDialog(false);
      setSelectedCareer(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo desactivar la carrera',
        variant: 'destructive',
      });
    } finally {
      setDeactivating(false);
    }
  };

  const getFacultyName = (facultyId: number) => {
    return faculties.get(facultyId)?.nombre || 'Facultad desconocida';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Cargando carreras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Carreras</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra las carreras académicas por facultad
          </p>
        </div>
        <Link href="/dashboard/academic/careers/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Carrera
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      {/* Careers List */}
      <div className="grid gap-4">
        {filteredCareers.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No se encontraron carreras' : 'No hay carreras registradas'}
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid gap-4"
          >
            {filteredCareers.map((career) => (
              <motion.div
                key={career.id}
                variants={itemVariants}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-card-foreground">{career.nombre}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {career.codigo}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Facultad: <span className="font-medium">{getFacultyName(career.facultadId)}</span>
                    </p>
                    {career.descripcion && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {career.descripcion}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Creado: {new Date(career.creadoEn).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/academic/careers/${career.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        setSelectedCareer(career);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Carrera</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas desactivar esta carrera? Esta acción no se puede deshacer.
            </p>
            {selectedCareer && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium">{selectedCareer.nombre}</p>
                <p className="text-muted-foreground">{selectedCareer.codigo}</p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deactivating}
              >
                {deactivating ? 'Desactivando...' : 'Desactivar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
