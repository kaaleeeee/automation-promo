"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createPromo } from "@/app/actions";

export function CreatePromoDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createPromo(formData);
    
    setIsLoading(false);
    if (result.success) {
      setOpen(false); // Tutup modal jika sukses
    } else {
      alert("Gagal menyimpan jadwal promo!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-zinc-900/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/90">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
        Buat Jadwal Baru
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-background">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Buat Jadwal Promo Baru</DialogTitle>
            <DialogDescription>
              Isi detail kampanye promo di bawah ini. Notifikasi akan dijadwalkan secara otomatis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="judul">Judul Kampanye</Label>
              <Input id="judul" name="judul" placeholder="Contoh: GARUDA FOOD - MATERIAL PROMO" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="brand">Brand & Mekanisme</Label>
              <Textarea 
                id="brand" 
                name="brand"
                placeholder="Detail informasi brand, mekanisme diskon, dan produk yang berpartisipasi..." 
                className="resize-none h-24"
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="waktuMulai">Waktu Mulai</Label>
                <Input id="waktuMulai" name="waktuMulai" type="datetime-local" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="waktuBerakhir">Waktu Berakhir</Label>
                <Input id="waktuBerakhir" name="waktuBerakhir" type="datetime-local" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="urlDrive">Tautan Folder (Google Drive)</Label>
              <Input id="urlDrive" name="urlDrive" type="url" placeholder="https://drive.google.com/drive/folders/..." required />
              <p className="text-[11px] text-muted-foreground">URL dokumen SKU dan panduan material promo.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-zinc-900 text-white hover:bg-zinc-900/90 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/90">
              {isLoading ? "Menyimpan..." : "Simpan Jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
