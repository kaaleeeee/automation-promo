"use client";

import { useEffect } from "react";

/**
 * Registrasi service worker + push subscription.
 * Hanya jalan di production (butuh HTTPS / service worker support).
 */
export function PushNotificationManager() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let registration: ServiceWorkerRegistration | null = null;

    async function register() {
      try {
        registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        await subscribePush(registration);
      } catch (err) {
        // gagal register SW, bukan fatal — notifikasi in-app tetap jalan
        console.warn("SW registration failed:", err);
      }
    }

    async function subscribePush(reg: ServiceWorkerRegistration) {
      try {
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidPublicKey) {
            console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY belum diset");
            return;
          }
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });
        }

        // kirim subscription ke server
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: sub.toJSON().keys,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (err) {
        console.warn("Push subscribe failed:", err);
      }
    }

    register();
  }, []);

  return null;
}

// VAPID public key base64url -> Uint8Array untuk applicationServerKey
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
