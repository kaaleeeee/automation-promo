"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * Tab bar bawah (mobile / PWA). Tampil di semua halaman kecuali /login.
 * ponytail: 3 menu statis — tambah item di src/lib/nav.ts jika perlu.
 */
export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <>
      {/* spacer agar konten tidak tertutup tab bar */}
      <div className="h-16 shrink-0 lg:hidden" aria-hidden />

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t bg-card/95 backdrop-blur lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 pb-1 pt-1.5 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 256 256"
                className={
                  active
                    ? "text-foreground"
                    : "text-muted-foreground/70 group-hover:text-foreground"
                }
              >
                <path d={item.icon}></path>
              </svg>
              <span
                className={
                  active
                    ? "text-[10.5px] font-semibold text-foreground"
                    : "text-[10.5px] font-medium text-muted-foreground/70"
                }
              >
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
