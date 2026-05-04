'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, AlertCircle, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

interface Faculty {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  creadoEn: Date;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function FacultiesPage() {
  const { toast } = useToast();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [filteredFaculties, setFilteredFaculties] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const facultiesQuery = trpc.academic.faculties.list.useQuery();
  const deactivateMutation = trpc.academic.faculties.deactivate.useMutation();

  useEffect(() => {
    if (facultiesQuery.data) {
      setFaculties(facultiesQuery.data as Faculty[]);
      setFilteredFaculties(facultiesQuery.data as Faculty[]);
      setLoading(false);
    }
  }, [facultiesQuery.data]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredFaculties(faculties);
    } else {
      setFilteredFaculties(
        faculties.filter(
          (faculty) =>
            faculty.nombre.toLowerCase().includes(value) ||
            faculty.codigo.toLowerCase().includes(value)
        )
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFaculty) return;
    try {
      await deactivateMutation.mutateAsync({ id: selectedFaculty.id });
      toast({
        title: 'Éxito',
        description: 'Facultad desactivada correctamente',
        duration: 3000,
      });
      setFaculties(faculties.filter(f => f.id !== selectedFaculty.id));
      setFilteredFaculties(filteredFaculties.filter(f => f.id !== selectedFaculty.id));
      setShowDeleteDialog(false);
      setSelectedFaculty(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo desactivar la facultad',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Cargando facultades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Facultades</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra las facultades y sus estructuras académicas
          </p>
        </div>
        <Link href="/dashboard/academic/faculties/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Facultad
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

      {/* Faculties List */}
      <div className="grid gap-4">
        {filteredFaculties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No se encontraron facultades' : 'No hay facultades registradas'}
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid gap-4"
          >
            {filteredFaculties.map((faculty) => (
              <motion.div
                key={faculty.id}
                variants={itemVariants}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-card-foreground">{faculty.nombre}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {faculty.codigo}
                      </span>
                    </div>
                    {faculty.descripcion && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {faculty.descripcion}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Creado: {new Date(faculty.creadoEn).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/academic/faculties/${faculty.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        setSelectedFaculty(faculty);
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
            <DialogTitle>Desactivar Facultad</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas desactivar esta facultad? Esta acción no se puede deshacer.
            </p>
            {selectedFaculty && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium">{selectedFaculty.nombre}</p>
                <p className="text-muted-foreground">{selectedFaculty.codigo}</p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deactivateMutation.isPending}
              >
                {deactivateMutation.isPending ? 'Desactivando...' : 'Desactivar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
