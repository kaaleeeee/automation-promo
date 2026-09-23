import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /api/push/subscribe
 * Simpan subscription browser user (endpoint + keys) agar server bisa kirim push.
 * Idempoten: upsert by endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return NextResponse.json(
        { success: false, error: "Payload subscription tidak valid" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      create: {
        endpoint: body.endpoint,
        keys: JSON.stringify(body.keys),
        userAgent: body.userAgent ?? null,
      },
      update: {
        keys: JSON.stringify(body.keys),
        userAgent: body.userAgent ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Hapus subscription (dipanggil saat user uninstall / unsubscribe).
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.endpoint) {
      return NextResponse.json({ success: false, error: "Endpoint wajib diisi" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint: body.endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus subscription" }, { status: 500 });
  }
}
