import CONFIG from "../config.js";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log(
        "Service Worker berhasil didaftarkan dengan scope:",
        registration.scope
      );
      return registration;
    } catch (error) {
      console.error("Pendaftaran Service Worker gagal:", error);
      return null;
    }
  } else {
    console.warn("Service Worker tidak didukung di browser ini");
    return null;
  }
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("Browser ini tidak mendukung notifikasi");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Izin notifikasi ditolak");
    return false;
  }

  console.log("Izin notifikasi diberikan!");
  return true;
}

async function subscribeToPushNotification(registration) {
  try {
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(
        CONFIG.VAPID_PUBLIC_KEY
      );
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log("Berhasil berlangganan push notification");
    } else {
      console.log("Sudah berlangganan push notification");
    }

    await sendSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error("Gagal berlangganan push notification:", error);
    return null;
  }
}

async function sendSubscriptionToServer(subscription) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn(
        "Token tidak ditemukan. Pastikan sudah login untuk menerima notifikasi pribadi."
      );

      return;
    }

    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.getKey("p256dh"))
            )
          ),
          auth: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.getKey("auth"))
            )
          ),
        },
      }),
    });

    const responseData = await response.json();
    if (response.ok) {
      console.log(
        "Informasi langganan berhasil dikirim ke server:",
        responseData
      );
    } else {
      console.error(
        "Gagal mengirim informasi langganan ke server:",
        responseData
      );
    }
  } catch (error) {
    console.error("Error saat mengirim informasi langganan:", error);
  }
}

async function unsubscribeFromPushNotification() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const unsubscribed = await subscription.unsubscribe();

        if (unsubscribed) {
          const token = localStorage.getItem("token");
          if (!token) {
            console.warn(
              "Token tidak ditemukan untuk proses unsubscribe di server"
            );
            return true;
          }

          const response = await fetch(
            `${CONFIG.BASE_URL}/notifications/subscribe`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                endpoint: subscription.endpoint,
              }),
            }
          );

          if (response.ok) {
            console.log("Berhasil berhenti berlangganan push notification");
          } else {
            console.warn(
              "Berhasil berhenti berlangganan di browser, tetapi gagal di server"
            );
          }

          return true;
        }
        return false;
      }

      return false;
    } catch (error) {
      console.error("Gagal berhenti berlangganan push notification:", error);
      return false;
    }
  }

  return false;
}

async function initPushNotification() {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return false;

    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) return false;

    const subscription = await subscribeToPushNotification(registration);
    return !!subscription;
  } catch (error) {
    console.error("Gagal menginisialisasi push notification:", error);
    return false;
  }
}

export {
  initPushNotification,
  unsubscribeFromPushNotification,
  registerServiceWorker,
};
