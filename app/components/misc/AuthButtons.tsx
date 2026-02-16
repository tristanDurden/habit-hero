"use client";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session } = useSession();

  if (!session) {
    return <Button onClick={() => signIn("github")}>Login with GitHub</Button>;
  }

  return (
    <div className="flex gap-8 items-center">
      <span>Hi, {session.user?.name}</span>
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  );
}
