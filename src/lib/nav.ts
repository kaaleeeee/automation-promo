export type NavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: string;
};

// Semua menu aplikasi. Dipakai SidebarNav (desktop) + BottomNav (mobile/PWA).
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    shortLabel: "Dashboard",
    href: "/",
    icon: "M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z",
  },
  {
    label: "Notifikasi Promo",
    shortLabel: "Notifikasi",
    href: "/notif",
    icon: "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm56,112H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z",
  },
  {
    label: "Panduan Notifikasi",
    shortLabel: "Panduan",
    href: "/reminder",
    icon: "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z",
  },
];
