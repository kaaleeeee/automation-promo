// Build script yang aman terhadap database belum dikonfigurasi.
// `prisma db push` gagal total build jika DATABASE_URL belum diset;
// migrasi DB seharusnya langkah deploy terpisah, bukan pemblokir build.
const { execSync } = require("child_process");

function run(cmd) {
  console.log(`> ${cmd}`);
  // shell:true karena Windows: butuh resolve npx via PATHEXT
  execSync(cmd, { stdio: "inherit", shell: process.platform === "win32" });
}

// 1. generate client — tidak butuh koneksi DB
run("npx prisma generate");

// 2. db push hanya jika DATABASE_URL ada; skip dengan pesan jika belum
if (process.env.DATABASE_URL) {
  run("npx prisma db push");
} else {
  console.log(
    "\n⚠️  DATABASE_URL belum diset — skip prisma db push. " +
      "Set DB di Vercel Storage lalu redeploy, atau jalankan migrasi terpisah.\n"
  );
}

// 3. build Next.js (selalu jalan)
run("npx next build");
