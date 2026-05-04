import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

export default function AcademicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      {children}
    </div>
  );
}
