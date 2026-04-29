'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/common/Loader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) return <Loader />;
  return <>{children}</>;
}