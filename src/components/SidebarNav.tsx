"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * Navigasi sidebar (desktop). Highlight menu aktif berdasarkan pathname.
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex items-center gap-3 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors"
                : "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="size-4 shrink-0"
            >
              <path d={item.icon}></path>
            </svg>
            <span className="flex-1 text-left">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
