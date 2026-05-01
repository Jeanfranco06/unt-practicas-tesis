'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Building2, 
  FileText,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Feature item component
function FeatureItem({ icon: Icon, title, description }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
    >
      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-medium text-slate-200">{title}</h3>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      {/* Lado izquierdo - Solo visible en lg+ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 xl:w-[45%] bg-slate-900 relative overflow-hidden"
      >
        {/* Background pattern - subtle dots */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        
        {/* Emerald accent block */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-tr-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-7 h-7 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-100 font-semibold text-sm tracking-wide">
                Universidad Nacional
              </span>
              <span className="text-slate-400 text-xs">de Trujillo</span>
            </div>
          </motion.div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-md"
            >
              {/* Accent line */}
              <div className="w-12 h-1 bg-emerald-500 rounded-full mb-8" />
              
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
                Sistema de Gestión Académica
              </h1>
              
              <p className="text-base text-slate-400 leading-relaxed mb-8">
                Accede a todos tus recursos académicos, gestiona tu información y mantente conectado con la comunidad universitaria.
              </p>

              {/* Features */}
              <div className="space-y-3">
                <FeatureItem 
                  icon={BookOpen}
                  title="Recursos Académicos"
                  description="Accede a materiales, calificaciones y programas de estudio."
                />
                <FeatureItem 
                  icon={Users}
                  title="Comunidad Conectada"
                  description="Colabora con estudiantes y docentes en tiempo real."
                />
                <FeatureItem 
                  icon={Building2}
                  title="Vinculación Empresarial"
                  description="Conecta con oportunidades laborales y prácticas profesionales."
                />
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 text-sm"
          >
            © 2026 UNT — Sistema de Prácticas y Tesis
          </motion.div>
        </div>
      </motion.div>

      {/* Lado derecho - Formulario */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 flex flex-col bg-slate-950 lg:bg-white"
      >
        {/* Mobile header - solo visible en pantallas pequeñas */}
        <div className="lg:hidden p-6 pb-0">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">Universidad Nacional</span>
              <span className="text-slate-400 text-xs">de Trujillo</span>
            </div>
          </motion.div>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Card - en mobile es transparente, en desktop tiene fondo */}
            <div className="bg-transparent lg:bg-slate-50 lg:border lg:border-slate-200 rounded-2xl lg:p-8 lg:shadow-sm">
              {children}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}