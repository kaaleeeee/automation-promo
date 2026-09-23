import { NextResponse } from "next/server";
import { broadcastPush } from "@/lib/push";

/**
 * POST /api/push/test
 * Kirim push notification test ke semua subscriber (untuk verifikasi setup).
 */
export async function POST() {
  try {
    const result = await broadcastPush({
      title: "🔔 Tes Notifikasi Berhasil",
      body: "Push notification PWA sudah aktif. Notifikasi promo otomatis akan masuk ke sini.",
      url: "/notif",
      tag: "promo-test",
    });

    if (result.total === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Belum ada perangkat terdaftar. Buka halaman ini di HP, install app, dan izinkan notifikasi dulu.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Test push error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengirim push notification",
      },
      { status: 500 }
    );
  }
}
