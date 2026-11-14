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
      className="rounded-full border border-white/30 px-4 py-1.5 text-sm hover:bg-white/10"
    >
      Sair
    </button>
  );
}
