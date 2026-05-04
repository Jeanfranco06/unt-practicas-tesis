'use client';

import { motion } from 'framer-motion';
import { Upload, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SubirTesisPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/student/tesis">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subir Documento</h1>
          <p className="text-muted-foreground text-sm">Gestión de documentos de tesis</p>
        </div>
      </div>

      <div className="p-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-lg font-medium mb-2">Gestión de documentos</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Esta funcionalidad avanzada de carga de documentos estará disponible próximamente. 
          Por ahora, usa la página principal de tesis para gestionar tus entregables.
        </p>
        <Link href="/student/tesis">
          <Button className="mt-6">
            <Upload className="w-4 h-4 mr-2" />
            Ir a Tesis
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
