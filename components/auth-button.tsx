import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { getUserRole } from "@/lib/utils/auth";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  const role = await getUserRole(user.sub);
  const dashboardLink = role === 'super_admin' ? '/super-admin' 
    : role === 'admin' ? '/admin' 
    : role === 'club_owner' ? '/club-owner' 
    : '/dashboard';

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">
        Hey, {user.email}!
        {role && (
          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {role.replace('_', ' ')}
          </span>
        )}
      </span>
      <Button asChild size="sm" variant="outline">
        <Link href={dashboardLink}>Dashboard</Link>
      </Button>
      <LogoutButton />
    </div>
  );
}
