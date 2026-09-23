"use client";

import { useState } from "react";

/**
 * Tombol untuk mengirim push notification test ke perangkat yang sudah subscribe.
 * Berguna untuk verifikasi setup VAPID + service worker sebelum produksi.
 */
export function TestNotifButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleTest = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("ok");
        setMessage(
          `Terkirim ke ${data.sent} perangkat${data.failed ? ` (${data.failed} gagal)` : ""}.`
        );
      } else {
        setStatus("error");
        setMessage(
          data.error || "Gagal. Cek apakah notifikasi sudah diizinkan di HP."
        );
      }
    } catch {
      setStatus("error");
      setMessage("Koneksi error. Coba lagi.");
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleTest}
        disabled={status === "loading"}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-900/90 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/90"
      >
        {status === "loading" ? "Mengirim..." : "🔔 Tes Notifikasi"}
      </button>

      {message && (
        <p
          className={`text-sm font-medium ${
            status === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
