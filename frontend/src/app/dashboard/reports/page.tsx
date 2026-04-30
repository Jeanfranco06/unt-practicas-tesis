'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FileText, Download, Briefcase, BookOpen, Calendar, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const reportTypes = [
  {
    id: 'internships',
    title: 'Reporte de Prácticas',
    description: 'Estadísticas de prácticas preprofesionales',
    icon: Briefcase,
    color: 'bg-blue-500',
    stats: [
      { label: 'Prácticas Activas', value: '12', icon: Briefcase },
      { label: 'Estudiantes', value: '45', icon: Users },
      { label: 'Empresas', value: '8', icon: TrendingUp },
    ],
  },
  {
    id: 'thesis',
    title: 'Reporte de Tesis',
    description: 'Estadísticas de proyectos de tesis',
    icon: BookOpen,
    color: 'bg-purple-500',
    stats: [
      { label: 'Tesis en Curso', value: '8', icon: BookOpen },
      { label: 'Aprobadas', value: '15', icon: TrendingUp },
      { label: 'Culminadas', value: '6', icon: FileText },
    ],
  },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<string>('internships');
  const selectedReport = reportTypes.find(r => r.id === selectedType);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-100">Reportes</h1>
        <p className="text-slate-400 text-sm mt-1">Genera reportes del sistema</p>
      </motion.div>

      {/* Report Type Selector */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`p-6 rounded-xl border text-left transition-all ${
              selectedType === type.id
                ? 'bg-slate-800 border-blue-500/50 ring-1 ring-blue-500/30'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 ${type.color} rounded-lg`}>
                <type.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{type.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Selected Report Stats */}
      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-900 rounded-xl border border-slate-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 ${selectedReport.color}/20 rounded-lg`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Resumen del Reporte</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {selectedReport.stats.map((stat) => (
              <div key={stat.label} className="p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <stat.icon className="w-4 h-4" />
                  <span>{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button className={`${selectedReport.color} hover:opacity-90 text-white`}>
              <Download className="w-4 h-4 mr-2" /> Descargar PDF
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <FileText className="w-4 h-4 mr-2" /> Vista Previa
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}