# Setup Deploy — Automation Promo

## 1. Env Variables di Vercel

Set semua ini di Vercel Dashboard → Project → Settings → Environment Variables:

```env
# WAJIB — Web Push (sudah digenerate, ada di .env.local lokal)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG3VvHkx910-7Dby5-gH_4GFRpbtsVY_fDmPnMLs9Xt8gF1g1727bUmjZTttH9bq4vabT67GEGEePOCTJMI_1PA
VAPID_PRIVATE_KEY=HwFd7K_wKgLRMLtyMM4v02Tyw8iNC6BKItvl2qNCEpM

# WAJIB — proteksi endpoint cron (/api/cron/promo butuh header Authorization: Bearer <CRON_SECRET>)
CRON_SECRET=promo-auto-secret-kendari-2026

# WAJIB — login admin (email: admin@beautykendari.id)
ADMIN_PASSWORD=admin123

# WAJIB — session JWT
JWT_SECRET=rahasia-negara-sangat-aman-123

# WAJIB — database (dari Vercel Postgres / Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# OPSIONAL — notifikasi Telegram (kosong = skip Telegram, Web Push tetap jalan)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## 2. Database

Schema Prisma: `prisma/schema.prisma`

Models:
- `PromoCampaign` — data promo + 4 flag idempotensi notifikasi
- `PushSubscription` — endpoint + keys browser user

Vercel build otomatis jalan: `prisma generate && prisma db push && next build` (lihat `package.json`).

Pertama kali deploy, pastikan `DATABASE_URL` + `DIRECT_URL` sudah benar supaya `prisma db push` membuat tabel.

## 3. Cron

`vercel.json` menjadwalkan `/api/cron/promo` **setiap jam** (`0 * * * *`).

Cron mengecek 4 state:

| State | Kondisi | Aksi |
|-------|---------|------|
| Akan berjalan | `SCHEDULED`, mulai dalam 24 jam, `notifStartReminderSent=false` | kirim notif "akan berjalan", set flag |
| Mulai | `SCHEDULED`, `waktuMulai <= now` | status → `ACTIVE`, kirim notif "sedang berjalan" |
| Akan berakhir | `ACTIVE`, berakhir dalam 24 jam, `notifEndReminderSent=false` | kirim notif "akan berakhir", set flag |
| Berakhir | `ACTIVE`, `waktuBerakhir <= now` | status → `COMPLETED`, kirim notif cabut label |

Notifikasi dikirim **dua jalur**: Web Push (ke semua subscriber) + Telegram (jika env ada).

Idempoten — aman dijalankan berkali-kali, notifikasi tidak dobel.

## 4. Testing Cron Manual

```bash
curl -H "Authorization: Bearer promo-auto-secret-kendari-2026" \
  https://DOMAIN-ANDA.vercel.app/api/cron/promo
```

Response: `{ "success": true, "processed": { "upcoming": 0, "started": 0, "endingSoon": 0, "ended": 0 } }`

## 5. Halaman

| Route | Fungsi |
|-------|--------|
| `/login` | Login admin |
| `/` | Dashboard admin: list promo, create/edit/delete |
| `/notif` | Halaman user: status promo (akan berjalan / sedang berjalan / akan berakhir) |
| `/reminder` | Landing page instruksi aktifkan notifikasi HP |
| `/api/cron/promo` | Cron endpoint (protected CRON_SECRET) |
| `/api/push/subscribe` | POST/DELETE subscription browser user |

## 6. Cara User Aktifkan Notifikasi HP

1. Buka `/notif` atau `/reminder` di Chrome/Safari HP
2. Tap **Install App** (add to home screen) — jadi PWA
3. Browser minta permission notifikasi → Allow
4. Service worker register + subscription tersimpan ke `PushSubscription`
5. Notifikasi push masuk otomatis saat cron jalan

Catatan: Web Push butuh **HTTPS** (Vercel sudah HTTPS). iOS butuh iOS 16.4+ + "Add to Home Screen" dulu sebelum izin notifikasi.
