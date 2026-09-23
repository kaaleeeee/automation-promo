import webpush from "web-push";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let configured = false;

function ensureVapid() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys belum diset di environment variables");
  }

  webpush.setVapidDetails(
    "mailto:admin@beautykendari.id",
    publicKey,
    privateKey
  );
  configured = true;
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/**
 * Kirim push notification ke SEMUA subscriber.
 * Return summary: berapa sukses / gagal.
 */
export async function broadcastPush(payload: PushPayload) {
  ensureVapid();

  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) {
    return { total: 0, sent: 0, failed: 0 };
  }

  const message = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  // Hapus subscription yang sudah invalid (410 Gone / 404)
  const deadEndpoints: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: JSON.parse(sub.keys as string) as { p256dh: string; auth: string },
            expirationTime: null,
          },
          message
        );
        sent++;
      } catch (err: any) {
        failed++;
        const statusCode = err?.statusCode ?? 0;
        // 404/410 = subscription expired/invalid, hapus permanen
        if (statusCode === 404 || statusCode === 410) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  if (deadEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: deadEndpoints } },
    });
  }

  return { total: subs.length, sent, failed };
}
