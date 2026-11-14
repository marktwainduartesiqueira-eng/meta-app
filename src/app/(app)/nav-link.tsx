"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Link do menu com a página atual destacada (só visual: sublinhado e aria-current). */
export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border-b-2 py-1 transition-colors hover:text-white ${
        active ? "border-white font-semibold text-white" : "border-transparent"
      }`}
    >
      {children}
    </Link>
  );
}
