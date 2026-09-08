"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { loginAdmin } from '@/app/actions';

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-zinc-900 p-10 text-white lg:flex">
        <div className="relative z-10 flex flex-col gap-12">
          <div className="group flex items-center gap-3 select-none">
            <div className="relative flex size-9 items-center justify-center p-[2px] rounded-[0.625rem] bg-white/10 ring-1 ring-white/20">
              <div className="flex size-full items-center justify-center rounded-[calc(0.625rem-2px)] bg-zinc-800 shadow-sm">
                <span className="font-bold text-white">ED</span>
              </div>
            </div>
            <span className="text-base font-semibold tracking-tight text-white/90">
              Promo Automation
            </span>
          </div>
          <div className="max-w-md">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Sistem Notifikasi Promo Otomatis
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Sistem pelaporan dan automasi pengingat materi promo (Email & Push Notification) ke seluruh Leader Outlet agar eksekusi tepat waktu dan menekan risiko kerugian.
            </p>
          </div>
        </div>
        <div className="relative z-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/60">
            Fungsi Utama
          </p>
          <ul className="grid grid-cols-1 gap-2.5 max-w-md">
            <li className="flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5">
              <span className="size-2.5 rounded-full bg-blue-500"></span>
              <span className="text-sm font-medium text-white">Trigger Mulai Promo</span>
            </li>
            <li className="flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5">
              <span className="size-2.5 rounded-full bg-red-500"></span>
              <span className="text-sm font-medium text-white">Peringatan Berakhir (Cabut Label)</span>
            </li>
          </ul>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/4 size-96 rounded-full bg-white/5 blur-3xl"></div>
      </aside>

      <main className="flex flex-col">
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Masuk
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
                Selamat datang kembali
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Silakan masuk untuk mengakses Dashboard Promo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Alamat Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue="admin@beautykendari.id"
                    placeholder="admin@beautykendari.id"
                    className="mt-2 flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    defaultValue="admin123"
                    placeholder="••••••••"
                    className="mt-2 flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <button disabled={isLoading} type="submit" className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-4 disabled:opacity-50">
                {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
