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
      className={`relative py-1 transition-colors hover:text-white after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:bg-white after:transition-transform after:duration-200 after:ease-out motion-reduce:after:transition-none ${
        active ? "font-semibold text-white after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
      }`}
    >
      {children}
    </Link>
  );
}
