'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Link2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface User {
  id: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol?: string;
}

interface UserProfileSelectorProps {
  profileType: 'student' | 'teacher' | 'representative';
  onUserSelected: (user: User | null) => void;
  onCreateNew: () => void;
  onLinkExisting: (userId: number) => void;
  disabled?: boolean;
}

export function UserProfileSelector({ 
  profileType, 
  onUserSelected, 
  onCreateNew, 
  onLinkExisting,
  disabled = false 
}: UserProfileSelectorProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const profileTypeLabels = {
    student: 'Estudiante',
    teacher: 'Docente',
    representative: 'Representante'
  };

  const searchUsersWithoutProfile = async (term: string) => {
    setIsLoading(true);
    try {
      // Llamar al backend real
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/available/${profileType}?search=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al buscar usuarios');
      }

      const users = await response.json();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error searching users:', error);
      // Fallback a mock data si hay error
      const mockUsers: User[] = [
        { id: 1, email: 'juan.perez@email.com', nombre: 'Juan', apellidoPaterno: 'Pérez', apellidoMaterno: 'García' },
        { id: 2, email: 'maria.lopez@email.com', nombre: 'María', apellidoPaterno: 'López', apellidoMaterno: 'Martínez' },
        { id: 3, email: 'carlos.rodriguez@email.com', nombre: 'Carlos', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Sánchez' },
      ].filter(user => 
        user.nombre.toLowerCase().includes(term.toLowerCase()) ||
        user.apellidoPaterno.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
      );
      
      setAvailableUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'existing' && searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchUsersWithoutProfile(searchTerm);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, mode]);

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    const user = availableUsers.find(u => u.id === userId);
    onUserSelected(user || null);
  };

  const handleContinue = () => {
    if (mode === 'new') {
      onCreateNew();
    } else if (selectedUserId) {
      onLinkExisting(selectedUserId);
    }
  };

  const selectedUser = availableUsers.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Selector de modo */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <Label className="text-foreground font-medium mb-3 block">
          ¿Cómo quieres crear el {profileTypeLabels[profileType]}?
        </Label>
        
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('existing')}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 transition-all ${
              mode === 'existing' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                : 'border-border bg-background hover:border-border/60'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-foreground">Vincular Usuario Existente</p>
                <p className="text-xs text-muted-foreground">Selecciona un usuario sin {profileTypeLabels[profileType].toLowerCase()}</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('new')}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 transition-all ${
              mode === 'new' 
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                : 'border-border bg-background hover:border-border/60'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-foreground">Crear Nuevo Usuario</p>
                <p className="text-xs text-muted-foreground">Crea usuario y {profileTypeLabels[profileType].toLowerCase()} juntos</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Contenido según modo */}
      {mode === 'existing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="user-search" className="text-foreground">
              Buscar usuario existente
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="user-search"
                type="search"
                placeholder="Buscar por nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-input"
                disabled={disabled}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Se mostrarán usuarios que no tienen un perfil de {profileTypeLabels[profileType].toLowerCase()} asignado
            </p>
          </div>

          {/* Lista de usuarios */}
          {searchTerm.length >= 2 && (
            <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-lg p-2">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Buscando usuarios...</p>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No se encontraron usuarios disponibles
                </div>
              ) : (
                availableUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedUserId === user.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-border bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {user.nombre.charAt(0)}{user.apellidoPaterno.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      {selectedUserId === user.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Preview del usuario seleccionado */}
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Usuario seleccionado:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedUser.nombre} {selectedUser.apellidoPaterno} ({selectedUser.email})
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Se le asignará un nuevo perfil de {profileTypeLabels[profileType].toLowerCase()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {mode === 'new' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Creación de Nuevo Usuario</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Se crearán tanto el usuario como el perfil de {profileTypeLabels[profileType].toLowerCase()} en un solo paso.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                El usuario podrá iniciar sesión inmediatamente después de la creación.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Botón de continuar */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={handleContinue}
          disabled={
            disabled || 
            (mode === 'existing' && !selectedUserId)
          }
          className={mode === 'new' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
        >
          {mode === 'new' ? (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Nuevo Usuario
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Vincular Usuario Seleccionado
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
