import React from 'react';
import Link from 'next/link';
import { CreatePromoDialog } from '@/components/CreatePromoDialog';
import { PrismaClient } from '@prisma/client';
import { logoutAdmin } from '@/app/actions';
import { PromoActions } from '@/components/PromoActions';
import { ThemeToggle } from '@/components/ThemeToggle';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const campaigns = await prisma.promoCampaign.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const scheduledCampaigns = campaigns.filter(c => c.status === 'SCHEDULED').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED').length;

  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground">
      
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <div className="group flex items-center gap-3 select-none cursor-pointer">
            <div className="relative flex size-9 items-center justify-center p-[2px] rounded-[0.625rem] bg-black/5 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
              <div className="flex size-full items-center justify-center rounded-[calc(0.625rem-2px)] bg-card shadow-sm">
                <span className="font-bold text-foreground">ED</span>
              </div>
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground/90">Promo Auto</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
          <div className="px-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-muted px-2.5 py-0.5 text-xs font-mono font-medium text-muted-foreground">
              Tim Marcomm
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <Link href="/" className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 shrink-0"><path d="M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z"></path></svg>
              <span className="flex-1 text-left">Dashboard</span>
            </Link>
            <Link href="#" className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors cursor-not-allowed opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 shrink-0"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"></path></svg>
              <span className="flex-1 text-left">Observasi (Segera)</span>
            </Link>
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground font-bold">A</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">Admin Utama</p>
              <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">MARCOMM DEPT</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <ThemeToggle />
            <form action={logoutAdmin} className="w-full">
              <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted text-red-500 hover:text-red-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4"><path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"></path></svg>
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex min-h-[100dvh] w-full flex-col lg:pl-64">
        
        {/* MOBILE HEADER */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur lg:hidden">
          <div className="font-bold">ED Promo Auto</div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
            
            {/* PAGE TITLE & BUTTON */}
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Ringkasan Jadwal Notifikasi Promo
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CreatePromoDialog />
                </div>
              </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="group rounded-xl border bg-gradient-to-br from-emerald-50 to-emerald-100/40 border-emerald-200 dark:from-emerald-950/40 dark:to-emerald-900/20 dark:border-emerald-900 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Promo Berjalan</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4.5"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">{activeCampaigns}</span>
                </div>
              </div>

              <div className="group rounded-xl border bg-gradient-to-br from-sky-50 to-sky-100/40 border-sky-200 dark:from-sky-950/40 dark:to-sky-900/20 dark:border-sky-900 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Akan Datang (Scheduled)</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4.5"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm56,112H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z"></path></svg>
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-semibold tracking-tight text-sky-700 dark:text-sky-300">{scheduledCampaigns}</span>
                </div>
              </div>

              <div className="group rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100/40 border-slate-200 dark:from-slate-900/40 dark:to-slate-800/20 dark:border-slate-800 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Selesai (Completed)</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4.5"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"></path></svg>
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-semibold tracking-tight text-slate-700 dark:text-slate-300">{completedCampaigns}</span>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Jadwal Promo Terbaru</h2>
              </div>
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="relative w-full overflow-auto scrollbar-thin">
                  <table className="w-full caption-bottom text-sm [&_th]:border-border/60 [&_td]:border-border/40">
                    <thead className="bg-muted/60 [&_tr]:border-b-2 [&_tr]:border-border">
                      <tr className="border-b transition-colors">
                        <th className="h-10 px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground min-w-[200px]">Judul Kampanye & Brand</th>
                        <th className="h-10 px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground">Waktu Mulai</th>
                        <th className="h-10 px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground">Waktu Berakhir</th>
                        <th className="h-10 px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                        <th className="h-10 px-4 text-right align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      
                      {campaigns.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            Belum ada jadwal promo. Silakan buat baru.
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((c) => (
                          <tr key={c.id} className={`border-b transition-colors hover:bg-muted/50 border-l-2 ${c.status === 'ACTIVE' ? 'border-l-emerald-500' : c.status === 'SCHEDULED' ? 'border-l-sky-500' : 'border-l-slate-500'}`}>
                            <td className="p-4 align-middle">
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{c.judulKampanye}</span>
                                <span className="text-[11px] text-muted-foreground max-w-sm truncate">{c.brandMekanisme}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle text-xs tabular-nums text-muted-foreground">
                              {new Date(c.waktuMulai).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="p-4 align-middle text-xs tabular-nums text-muted-foreground">
                              {new Date(c.waktuBerakhir).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="p-4 align-middle">
                              <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold 
                                ${c.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : c.status === 'SCHEDULED' ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-900/30 dark:text-sky-400' 
                                : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400'}`}>
                                <span className={`size-1.5 shrink-0 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-600 dark:bg-emerald-400' : c.status === 'SCHEDULED' ? 'bg-sky-600 dark:bg-sky-400' : 'bg-slate-600 dark:bg-slate-400'}`}></span>
                                {c.status}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              <PromoActions promo={c} />
                            </td>
                          </tr>
                        ))
                      )}

                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
