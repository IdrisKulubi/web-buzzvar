import { AuthGuard } from "@/components/auth/auth-guard";

export default function ClubOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="club_owner">
      {children}
    </AuthGuard>
  );
}