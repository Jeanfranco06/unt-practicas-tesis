import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, BookOpen, FileText, Users } from 'lucide-react';

const icons = {
  briefcase: Briefcase,
  book: BookOpen,
  file: FileText,
  users: Users,
};

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof icons;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  const Icon = icons[icon];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}