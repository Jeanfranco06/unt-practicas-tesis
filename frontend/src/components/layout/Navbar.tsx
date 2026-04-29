'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/react';

export function Navbar() {
  const { data: user } = trpc.auth.me.useQuery();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      setUserName(`${user.nombre} ${user.apellidoPaterno}`);
    }
  }, [user]);

  return (
    <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Bienvenido, {userName}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.rol}</span>
      </div>
    </header>
  );
}