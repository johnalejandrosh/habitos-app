"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/home",
    label: "Inicio",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
      </svg>
    ),
  },
  {
    href: "/report",
    label: "Reporte",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-6" />
        <path d="M22 20V8" />
      </svg>
    ),
  },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[5.5rem] flex-col items-center gap-1 rounded-2xl px-4 py-2 transition active:scale-95 ${
                active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {item.icon(active)}
              <span className="text-[11px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
