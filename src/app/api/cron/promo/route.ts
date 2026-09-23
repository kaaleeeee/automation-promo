import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { broadcastPush } from "@/lib/push";

const prisma = new PrismaClient();

const H24 = 24 * 60 * 60 * 1000;

/**
 * Cron job promo — jalan setiap jam.
 * Cek 4 state:
 *   1. SCHEDULED + mulai dalam 24 jam  -> notif "akan berjalan" (sekali)
 *   2. SCHEDULED + waktuMulai <= now   -> status ACTIVE + notif "sedang berjalan" (sekali)
 *   3. ACTIVE + berakhir dalam 24 jam   -> notif "akan berakhir" (sekali)
 *   4. ACTIVE + waktuBerakhir <= now    -> status COMPLETED + notif "berakhir/cabut label" (sekali)
 *
 * Idempotensi via flag boolean di row promo — aman dijalankan berkali-kali.
 */
export async function GET(request: Request) {
  // Lindungi endpoint cron dari pemanggilan sembarang
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const secretFromQuery = url.searchParams.get("secret");

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    secretFromQuery !== process.env.CRON_SECRET
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const log = (...args: unknown[]) => console.log("[cron/promo]", ...args);

  try {
    const now = new Date();
    const results = { upcoming: 0, started: 0, endingSoon: 0, ended: 0 };

    // --- 1. Notif "akan berjalan" (H-1) ---
    const aboutToStart = await prisma.promoCampaign.findMany({
      where: {
        status: "SCHEDULED",
        notifStartReminderSent: false,
        waktuMulai: { gte: now, lte: new Date(now.getTime() + H24) },
      },
    });
    for (const promo of aboutToStart) {
      await notify("upcoming", promo);
      await prisma.promoCampaign.update({
        where: { id: promo.id },
        data: { notifStartReminderSent: true },
      });
      results.upcoming++;
      log(`reminder mulai: ${promo.judulKampanye}`);
    }

    // --- 2. Promo mulai -> ACTIVE + notif "sedang berjalan" ---
    const pendingToStart = await prisma.promoCampaign.findMany({
      where: { status: "SCHEDULED", waktuMulai: { lte: now } },
    });
    for (const promo of pendingToStart) {
      await prisma.promoCampaign.update({
        where: { id: promo.id },
        data: { status: "ACTIVE" },
      });
      await notify("started", promo);
      await prisma.promoCampaign.update({
        where: { id: promo.id },
        data: { notifStartSent: true },
      });
      results.started++;
      log(`mulai: ${promo.judulKampanye}`);
    }

    // --- 3. Notif "akan berakhir" (H-1) ---
    const aboutToEnd = await prisma.promoCampaign.findMany({
      where: {
        status: "ACTIVE",
        notifEndReminderSent: false,
        waktuBerakhir: { gte: now, lte: new Date(now.getTime() + H24) },
      },
    });
    for (const promo of aboutToEnd) {
      await notify("endingSoon", promo);
      await prisma.promoCampaign.update({
        where: { id: promo.id },
        data: { notifEndReminderSent: true },
      });
      results.endingSoon++;
      log(`reminder berakhir: ${promo.judulKampanye}`);
    }

    // --- 4. Promo berakhir -> COMPLETED + notif cabut label ---
    const pendingToEnd = await prisma.promoCampaign.findMany({
      where: { status: "ACTIVE", waktuBerakhir: { lte: now } },
    });
    for (const cron of pendingToEnd) {
      await prisma.promoCampaign.update({
        where: { id: cron.id },
        data: { status: "COMPLETED", notifEndSent: true },
      });
      await notify("ended", cron);
      results.ended++;
      log(`berakhir: ${cron.judulKampanye}`);
    }

    return NextResponse.json({ success: true, processed: results, at: now.toISOString() });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengeksekusi cron job" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (d: Date) => new Date(d).toLocaleString("id-ID");

type NotifType = "upcoming" | "started" | "endingSoon" | "ended";

async function notify(type: NotifType, promo: PromoRow) {
  const tg = buildTelegram(type, promo);
  const push = buildPush(type, promo);

  await sendTelegramMessage(tg);
  await broadcastPush(push);
}

function buildTelegram(type: NotifType, p: PromoRow): string {
  switch (type) {
    case "upcoming":
      return (
        `🔔 <b>PROMO AKAN BERJALAN BESOK</b>\n\n` +
        `<b>Judul:</b> ${p.judulKampanye}\n` +
        `<b>Brand:</b> ${p.brandMekanisme}\n` +
        `<b>Mulai:</b> ${fmt(p.waktuMulai)}\n\n` +
        `👉 <a href="${p.urlSkuMaterial}">Siapkan material & SKU (klik)</a>\n\n` +
        `<i>Persiapkan pemasangan materi promosi tepat waktu.</i>`
      );
    case "started":
      return (
        `🟢 <b>PROMO DIMULAI HARI INI!</b>\n\n` +
        `<b>Judul:</b> ${p.judulKampanye}\n` +
        `<b>Brand:</b> ${p.brandMekanisme}\n` +
        `<b>Mulai:</b> ${fmt(p.waktuMulai)}\n` +
        `<b>Selesai:</b> ${fmt(p.waktuBerakhir)}\n\n` +
        `👉 <a href="${p.urlSkuMaterial}">Cek Folder Material &amp; SKU (Klik di sini)</a>\n\n` +
        `<i>Mohon seluruh Leader Outlet segera mengeksekusi pemasangan materi promosi sesuai panduan!</i>`
      );
    case "endingSoon":
      return (
        `🟡 <b>PROMO AKAN BERAKHIR BESOK</b>\n\n` +
        `<b>Judul:</b> ${p.judulKampanye}\n` +
        `<b>Berakhir:</b> ${fmt(p.waktuBerakhir)}\n\n` +
        `👉 <a href="${p.urlSkuMaterial}">Cek Folder Material &amp; SKU (klik)</a>\n\n` +
        `<i>Leader Outlet dimohon bersiap <b>CABUT LABEL DISKON</b> besok.</i>`
      );
    case "ended":
      return (
        `🔴 <b>PERINGATAN CABUT PROMO!</b>\n\n` +
        `<b>Judul:</b> ${p.judulKampanye}\n` +
        `<b>Selesai pada:</b> ${fmt(p.waktuBerakhir)}\n\n` +
        `⚠️ <i>Periode promo ini telah berakhir! Leader Outlet dimohon <b>SEGERA CABUT LABEL DISKON</b> untuk menghindari kerugian/selisih harga di kasir.</i>`
      );
  }
}

function buildPush(type: NotifType, p: PromoRow) {
  switch (type) {
    case "upcoming":
      return {
        title: "🔔 Promo akan berjalan besok",
        body: `${p.judulKampanye} — mulai ${fmt(p.waktuMulai)}. Siapkan material.`,
        url: "/notif",
        tag: `promo-upcoming-${p.id}`,
      };
    case "started":
      return {
        title: "🟢 Promo dimulai hari ini!",
        body: `${p.judulKampanye} sedang berjalan. Pasang materi promosi sekarang.`,
        url: p.urlSkuMaterial,
        tag: `promo-started-${p.id}`,
      };
    case "endingSoon":
      return {
        title: "🟡 Promo akan berakhir besok",
        body: `${p.judulKampanye} berakhir ${fmt(p.waktuBerakhir)}. Bersiap cabut label.`,
        url: "/notif",
        tag: `promo-ending-${p.id}`,
      };
    case "ended":
      return {
        title: "🔴 Peringatan cabut promo!",
        body: `${p.judulKampanye} telah berakhir. Segera cabut label diskon.`,
        url: p.urlSkuMaterial,
        tag: `promo-ended-${p.id}`,
      };
  }
}

async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("[cron/promo] Env Telegram belum diatur, pesan Telegram dilewati.");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
  } catch (error) {
    console.error("[cron/promo] Gagal kirim Telegram:", error);
  }
}

type PromoRow = {
  id: string;
  judulKampanye: string;
  brandMekanisme: string;
  waktuMulai: Date;
  waktuBerakhir: Date;
  urlSkuMaterial: string;
};
