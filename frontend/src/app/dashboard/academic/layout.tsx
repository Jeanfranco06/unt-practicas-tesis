import { ReactNode } from 'react';

export default function AcademicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      {children}
    </div>
  );
}
