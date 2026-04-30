import { AuthLayout } from '@/components/auth/AuthLayout';

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}