import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <ResetPasswordForm token={params.token} />
    </div>
  );
}
