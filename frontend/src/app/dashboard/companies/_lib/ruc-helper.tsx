'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateRUC, calcularDigitoVerificadorRUC, generarRUCPrueba } from './companies';

export function RUCHelper() {
  const [mode, setMode] = useState<'validate' | 'calculate' | 'generate'>('validate');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ isValid?: boolean; message?: string; ruc?: string }>({});

  const handleValidate = () => {
    const validation = validateRUC(input);
    setResult(validation);
  };

  const handleCalculate = () => {
    if (input.length !== 10 || !/^\d{10}$/.test(input)) {
      setResult({ isValid: false, message: 'Ingresa 10 dígitos válidos' });
      return;
    }
    const digito = calcularDigitoVerificadorRUC(input);
    setResult({ message: `RUC completo: ${input}${digito}` });
  };

  const handleGenerate = () => {
    const ruc = generarRUCPrueba();
    setResult({ message: `RUC generado: ${ruc}`, ruc });
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={mode === 'validate' ? 'default' : 'outline'}
          onClick={() => setMode('validate')}
        >
          Validar RUC
        </Button>
        <Button
          size="sm"
          variant={mode === 'calculate' ? 'default' : 'outline'}
          onClick={() => setMode('calculate')}
        >
          Calcular Dígito
        </Button>
        <Button
          size="sm"
          variant={mode === 'generate' ? 'default' : 'outline'}
          onClick={() => setMode('generate')}
        >
          Generar RUC
        </Button>
      </div>

      {mode !== 'generate' && (
        <div className="grid gap-2">
          <Label htmlFor="ruc-input">
            {mode === 'validate' ? 'RUC (11 dígitos)' : 'Primeros 10 dígitos'}
          </Label>
          <Input
            id="ruc-input"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))}
            placeholder={mode === 'validate' ? '20100070970' : '2010007097'}
            maxLength={mode === 'validate' ? 11 : 10}
          />
        </div>
      )}

      <Button
        onClick={() => {
          if (mode === 'validate') handleValidate();
          else if (mode === 'calculate') handleCalculate();
          else handleGenerate();
        }}
        className="w-full"
      >
        {mode === 'validate' && 'Validar'}
        {mode === 'calculate' && 'Calcular'}
        {mode === 'generate' && 'Generar'}
      </Button>

      {result.message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            result.isValid === false
              ? 'bg-red-500/10 text-red-600'
              : 'bg-green-500/10 text-green-600'
          }`}
        >
          {result.message}
        </div>
      )}

      {result.ruc && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(result.ruc!);
          }}
          className="w-full"
        >
          Copiar: {result.ruc}
        </Button>
      )}
    </div>
  );
}
