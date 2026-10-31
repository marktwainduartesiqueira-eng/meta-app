"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
      className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
    >
      Sair
    </button>
  );
}
