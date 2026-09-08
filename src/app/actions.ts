"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Initialize Prisma client
const prisma = new PrismaClient();

export async function createPromo(formData: FormData) {
  const judulKampanye = formData.get("judul") as string;
  const brandMekanisme = formData.get("brand") as string;
  
  // Konversi string dari input datetime-local ke Date object
  const waktuMulai = new Date(formData.get("waktuMulai") as string);
  const waktuBerakhir = new Date(formData.get("waktuBerakhir") as string);
  
  const urlSkuMaterial = formData.get("urlDrive") as string;

  try {
    await prisma.promoCampaign.create({
      data: {
        judulKampanye,
        brandMekanisme,
        waktuMulai,
        waktuBerakhir,
        urlSkuMaterial,
      },
    });

    // Refresh halaman utama agar tabel langsung update
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menyimpan promo:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat menyimpan." };
  }
}

export async function deletePromo(id: string) {
  try {
    await prisma.promoCampaign.delete({
      where: { id }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus promo" };
  }
}

export async function updatePromo(id: string, formData: FormData) {
  const judulKampanye = formData.get("judul") as string;
  const brandMekanisme = formData.get("brand") as string;
  const waktuMulai = new Date(formData.get("waktuMulai") as string);
  const waktuBerakhir = new Date(formData.get("waktuBerakhir") as string);
  const urlSkuMaterial = formData.get("urlDrive") as string;

  try {
    await prisma.promoCampaign.update({
      where: { id },
      data: {
        judulKampanye,
        brandMekanisme,
        waktuMulai,
        waktuBerakhir,
        urlSkuMaterial,
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate promo" };
  }
}

import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  // Hardcoded kredensial sesuai permintaan "password biasa"
  const validEmail = "admin@beautykendari.id";
  const validPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email === validEmail && password === validPassword) {
    await setSessionCookie();
    redirect("/"); // Langsung arahkan ke dashboard
  } else {
    return { error: "Email atau password salah!" };
  }
}

export async function logoutAdmin() {
  await clearSessionCookie();
  redirect("/login");
}
