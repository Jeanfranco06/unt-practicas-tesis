'use client';

import { motion } from 'framer-motion';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CalendarioPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/student/dashboard">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground text-sm">Vista de fechas importantes</p>
        </div>
      </div>

      <div className="p-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-lg font-medium mb-2">Calendario en desarrollo</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Esta funcionalidad estará disponible próximamente. 
          Por ahora, consulta tus fechas importantes en el dashboard.
        </p>
        <Link href="/student/dashboard">
          <Button className="mt-6">
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
