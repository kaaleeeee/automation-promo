import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // Jika mencoba mengakses halaman utama (dashboard) tapi belum login
  if (request.nextUrl.pathname === "/" && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verifikasi token jika ada
  if (session && request.nextUrl.pathname === "/") {
    try {
      await decrypt(session);
    } catch (error) {
      // Jika token tidak valid / kedaluwarsa
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Jika sudah login tapi mengakses halaman login, kembalikan ke dashboard
  if (session && request.nextUrl.pathname === "/login") {
    try {
      await decrypt(session);
      return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
      // Biarkan di halaman login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login"],
};
