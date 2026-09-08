import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fungsi bantuan untuk mengirim pesan Telegram
async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("Variabel lingkungan Telegram belum diatur. Pesan dilewati.");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      })
    });
  } catch (error) {
    console.error("Gagal mengirim Telegram:", error);
  }
}

export async function GET(request: Request) {
  // Opsi: Anda bisa menambahkan autentikasi cron di sini agar endpoint ini tidak dipanggil sembarang orang.
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });

  try {
    const now = new Date();
    const results = { started: 0, ended: 0 };

    // 1. Cek Promo yang HARUS MULAI (Status: SCHEDULED, Waktu Mulai <= Sekarang)
    const pendingToStart = await prisma.promoCampaign.findMany({
      where: {
        status: 'SCHEDULED',
        waktuMulai: { lte: now }
      }
    });

    for (const promo of pendingToStart) {
      await prisma.promoCampaign.update({
        where: { id: promo.id },
        data: { status: 'ACTIVE' }
      });
      
      const msg = `🟢 <b>PROMO DIMULAI HARI INI!</b>\n\n` +
                  `<b>Judul:</b> ${promo.judulKampanye}\n` +
                  `<b>Brand:</b> ${promo.brandMekanisme}\n` +
                  `<b>Mulai:</b> ${promo.waktuMulai.toLocaleString('id-ID')}\n` +
                  `<b>Selesai:</b> ${promo.waktuBerakhir.toLocaleString('id-ID')}\n\n` +
                  `👉 <a href="${promo.urlSkuMaterial}">Cek Folder Material & SKU (Klik di sini)</a>\n\n` +
                  `<i>Mohon seluruh Leader Outlet segera mengeksekusi pemasangan materi promosi sesuai panduan!</i>`;
      
      await sendTelegramMessage(msg);
      results.started++;
    }

    // 2. Cek Promo yang HARUS BERAKHIR (Status: ACTIVE, Waktu Berakhir <= Sekarang)
    const pendingToEnd = await prisma.promoCampaign.findMany({
      where: {
        status: 'ACTIVE',
        waktuBerakhir: { lte: now }
      }
    });

    for (const promo of pendingToEnd) {
      await prisma.promoCampaign.update({
        where: { id: promo.id },
        data: { status: 'COMPLETED' }
      });
      
      const msg = `🔴 <b>PERINGATAN CABUT PROMO!</b>\n\n` +
                  `<b>Judul:</b> ${promo.judulKampanye}\n` +
                  `<b>Selesai pada:</b> ${promo.waktuBerakhir.toLocaleString('id-ID')}\n\n` +
                  `⚠️ <i>Periode promo ini telah berakhir! Leader Outlet dimohon <b>SEGERA CABUT LABEL DISKON</b> untuk menghindari kerugian/selisih harga di kasir.</i>`;
      
      await sendTelegramMessage(msg);
      results.ended++;
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengeksekusi cron job" }, { status: 500 });
  }
}
