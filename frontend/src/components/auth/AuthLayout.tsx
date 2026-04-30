'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Animated gradient orbs
function GradientOrbs() {
  return (
    <>
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

// Animated grid background
function GridBackground() {
  return (
    <div className="absolute inset-0 opacity-[0.03]">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// Glass card component for stats
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-glow"
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/70">{label}</div>
    </motion.div>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-950">
      {/* Lado izquierdo - Branding Premium */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative lg:w-[55%] overflow-hidden"
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950" />
        
        {/* Animated elements */}
        <GradientOrbs />
        <GridBackground />
        <FloatingParticles />
        
        {/* Glass overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12 xl:p-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-white to-indigo-200 rounded-xl shadow-glow flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-slate-900 font-bold text-xl">U</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-white font-semibold tracking-wide text-sm">
                Universidad Nacional
              </span>
              <span className="text-white/60 text-xs">de Trujillo</span>
            </div>
          </motion.div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="max-w-lg"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "60px" }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="h-1 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full mb-8"
              />
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                Sistema de{' '}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 animate-gradient bg-[length:200%_auto]">
                    Gestión
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 w-full h-3 bg-primary-500/20 -skew-x-6 rounded"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  />
                </span>
                <br />
                Integral
              </h1>
              
              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-md">
                Plataforma especializada para la administración de prácticas preprofesionales, 
                tesis y convenios empresariales.
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-3">
                {['Prácticas', 'Tesis', 'Convenios', 'Reportes'].map((feature, i) => (
                  <motion.span
                    key={feature}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 border border-white/10 cursor-default"
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <StatCard value="500+" label="Estudiantes" delay={0.7} />
            <StatCard value="100+" label="Empresas" delay={0.8} />
            <StatCard value="50+" label="Convenios" delay={0.9} />
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-slate-500 text-sm mt-8"
          >
            © 2026 UNT — Sistema de Prácticas y Tesis
          </motion.div>
        </div>
      </motion.div>

      {/* Lado derecho - Formularios Premium */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white relative overflow-hidden"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/20 via-transparent to-transparent" />
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-elevated border border-slate-100"
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}