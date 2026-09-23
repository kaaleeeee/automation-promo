import React from "react";
import Link from "next/link";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { TestNotifButton } from "@/components/TestNotifButton";

export default function ReminderPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <PushNotificationManager />

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur">
        <Link href="/" className="font-bold">
          ED Promo Auto
        </Link>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifikasi Promo</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Daftar status promo terkini. Aktifkan notifikasi HP agar tidak terlewat.
            </p>
          </div>

          <div className="rounded-xl border border-dashed p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="size-12 rounded-full bg-sky-500/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 text-sky-600 dark:text-sky-400">
                  <path d="M144,208a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8V192H64a8,8,0,0,1-6.75-12L108,140H48a24,24,0,0,1,0-48h60.38l21.76-32.64A8,8,0,0,1,148,64H168a8,8,0,0,1,0,16h-6.75L128,124.48l-20.11-30.16A8,8,0,1,0,92.11,99.55l24,36A8,8,0,0,1,120,144h8a8,8,0,0,1,8,8Z"></path>
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Aktifkan Notifikasi HP</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Buka halaman ini di Chrome/Safari, tap <b>Install App</b> &gt; Aktifkan Notifikasi — dan terima pemberitahuan real-time untuk mulai/akan berakhirnya promo.
                </p>
              </div>
              <div className="mt-4">
                <TestNotifButton />
                <div className="text-xs text-muted-foreground mt-2">Status: menunggu install</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
