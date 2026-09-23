import React from "react";
import { PrismaClient } from "@prisma/client";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import Link from "next/link";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

const H24 = 24 * 60 * 60 * 1000;

type PromoItem = {
  id: string;
  title: string;
  sub: string;
  meta: string;
  url: string;
  highlight?: boolean;
};

function Section({
  title,
  description,
  color,
  items,
}: {
  title: string;
  description: string;
  color: "sky" | "emerald" | "red" | "slate";
  items: PromoItem[];
}) {
  const colorMap = {
    sky: "border-sky-500 bg-sky-50 dark:bg-sky-950/30",
    emerald: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    red: "border-red-500 bg-red-50 dark:bg-red-950/30",
    slate: "border-slate-500 bg-slate-50 dark:bg-slate-900/30",
  } as const;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Tidak ada promo di kategori ini.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border-l-4 ${colorMap[color]} p-4 shadow-sm`}
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-foreground">{item.title}</span>
                <span className="text-[11px] text-muted-foreground line-clamp-2">{item.sub}</span>
                <span className="mt-1 text-xs font-medium text-foreground/80">{item.meta}</span>
                {item.highlight && (
                  <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                    ⚠️ Berakhir dalam 24 jam
                  </span>
                )}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex w-fit text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Cek Folder Material & SKU →
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function NotifPage() {
  const now = new Date();

  const [upcoming, active] = await Promise.all([
    // Akan berjalan: SCHEDULED, mulai dalam 24 jam ke depan
    prisma.promoCampaign.findMany({
      where: {
        status: "SCHEDULED",
        waktuMulai: { gte: now, lte: new Date(now.getTime() + H24) },
      },
      orderBy: { waktuMulai: "asc" },
    }),
    // Sedang berjalan
    prisma.promoCampaign.findMany({
      where: { status: "ACTIVE" },
      orderBy: { waktuBerakhir: "asc" },
    }),
  ]);

  const fmt = (d: Date) =>
    new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

  const activeItems: PromoItem[] = active.map((p) => {
    const endsWithin24 = new Date(p.waktuBerakhir).getTime() - now.getTime() <= H24;
    return {
      id: p.id,
      title: p.judulKampanye,
      sub: p.brandMekanisme,
      meta: `Berakhir ${fmt(p.waktuBerakhir)}`,
      url: p.urlSkuMaterial,
      highlight: endsWithin24,
    };
  });

  const endingSoonItems: PromoItem[] = activeItems.filter((i) => i.highlight);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <PushNotificationManager />

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur">
        <Link href="/" className="font-bold">
          ED Promo Auto
        </Link>
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Kembali
        </Link>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifikasi Promo</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Status promo terkini. Notifikasi HP aktif otomatis saat halaman ini dibuka di browser
              HP (PWA).
            </p>
          </div>

          <Section
            title="Akan Berjalan"
            description="Promo mulai dalam 24 jam"
            color="sky"
            items={upcoming.map((p) => ({
              id: p.id,
              title: p.judulKampanye,
              sub: p.brandMekanisme,
              meta: `Mulai ${fmt(p.waktuMulai)}`,
              url: p.urlSkuMaterial,
            }))}
          />

          <Section
            title="Sedang Berjalan"
            description="Promo aktif sekarang"
            color="emerald"
            items={activeItems}
          />

          <Section
            title="Akan Berakhir"
            description="Berakhir dalam 24 jam — siapkan cabut label"
            color="red"
            items={endingSoonItems}
          />
        </div>
      </main>
    </div>
  );
}
