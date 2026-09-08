"use client";
import React, { useState } from 'react';
import { deletePromo, updatePromo } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PromoActions({ promo }: { promo: any }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Format date for datetime-local input (YYYY-MM-DDThh:mm)
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus promo ini?")) {
      setIsDeleting(true);
      await deletePromo(promo.id);
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const res = await updatePromo(promo.id, formData);
    setIsUpdating(false);
    if (res.success) {
      setOpen(false);
    } else {
      alert("Gagal mengupdate!");
    }
  };

  return (
    <div className="flex items-center gap-3 justify-end">
      <a href={promo.urlSkuMaterial} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
        Lihat Drive
      </a>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
          Edit
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] bg-background">
          <DialogHeader>
            <DialogTitle>Edit Jadwal Promo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-5 py-6">
              <div className="grid gap-2">
                <Label htmlFor={`judul-${promo.id}`}>Judul Kampanye</Label>
                <Input id={`judul-${promo.id}`} name="judul" defaultValue={promo.judulKampanye} required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor={`brand-${promo.id}`}>Brand & Mekanisme</Label>
                <Textarea 
                  id={`brand-${promo.id}`} 
                  name="brand"
                  defaultValue={promo.brandMekanisme}
                  className="resize-none h-24"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`waktuMulai-${promo.id}`}>Waktu Mulai</Label>
                  <Input id={`waktuMulai-${promo.id}`} name="waktuMulai" type="datetime-local" defaultValue={formatDateForInput(promo.waktuMulai)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`waktuBerakhir-${promo.id}`}>Waktu Berakhir</Label>
                  <Input id={`waktuBerakhir-${promo.id}`} name="waktuBerakhir" type="datetime-local" defaultValue={formatDateForInput(promo.waktuBerakhir)} required />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`urlDrive-${promo.id}`}>Tautan Folder (Google Drive)</Label>
                <Input id={`urlDrive-${promo.id}`} name="urlDrive" type="url" defaultValue={promo.urlSkuMaterial} required />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-2 border-t pt-4">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">
                Batal
              </button>
              <button disabled={isUpdating} type="submit" className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md shadow-sm transition-colors hover:bg-zinc-900/90 disabled:opacity-50">
                {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <button disabled={isDeleting} onClick={handleDelete} className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline disabled:opacity-50">
        Hapus
      </button>
    </div>
  );
}
