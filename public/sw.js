const CHECK_INTERVAL_MS = 60 * 1000;
const PREFS_CACHE = "habitos-prefs-v1";

let prefs = {
  enabled: false,
  times: ["09:00", "20:00"],
  onlyIfNoLogsToday: true,
};

async function loadPrefsFromCache() {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match("/prefs.json");
    if (res) prefs = await res.json();
  } catch {
    /* ignore */
  }
}

async function savePrefsToCache(next) {
  prefs = next;
  try {
    const cache = await caches.open(PREFS_CACHE);
    await cache.put("/prefs.json", new Response(JSON.stringify(next)));
  } catch {
    /* ignore */
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function currentSlot() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

async function getLogsToday() {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match("/store-snapshot.json");
    if (!res) return 0;
    const store = await res.json();
    const today = todayKey();
    return (store.entries || []).filter((e) => e.at && e.at.startsWith(today)).length;
  } catch {
    return 0;
  }
}

async function wasSlotSent(slot) {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match("/sent.json");
    if (!res) return false;
    const data = await res.json();
    if (data.date !== todayKey()) return false;
    return !!data.slots[slot];
  } catch {
    return false;
  }
}

async function markSlotSent(slot) {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match("/sent.json");
    let data = { date: todayKey(), slots: {} };
    if (res) {
      const parsed = await res.json();
      if (parsed.date === todayKey()) data = parsed;
    }
    data.slots[slot] = true;
    await cache.put("/sent.json", new Response(JSON.stringify(data)));
  } catch {
    /* ignore */
  }
}

async function maybeNotify() {
  if (!prefs.enabled) return;
  const slot = currentSlot();
  if (!prefs.times.includes(slot)) return;
  if (await wasSlotSent(slot)) return;

  const logsToday = await getLogsToday();
  if (prefs.onlyIfNoLogsToday && logsToday > 0) return;

  const title = logsToday === 0 ? "Hábitos · Recordatorio" : "Hábitos · Sigue así";
  const body =
    logsToday === 0
      ? "Aún no registraste nada hoy. ¿Qué hábito vas a marcar?"
      : `Llevas ${logsToday} registros hoy. ¿Sumas otro?`;

  await self.registration.showNotification(title, {
    body,
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: `habitos-${slot}`,
    renotify: true,
    data: { url: "/home" },
  });

  await markSlotSent(slot);
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await loadPrefsFromCache();
      await self.clients.claim();
      setInterval(maybeNotify, CHECK_INTERVAL_MS);
      await maybeNotify();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const { type } = event.data || {};
  if (type === "UPDATE_PREFS") {
    event.waitUntil(savePrefsToCache(event.data.prefs));
  }
  if (type === "UPDATE_STORE") {
    event.waitUntil(
      caches.open(PREFS_CACHE).then((cache) =>
        cache.put(
          "/store-snapshot.json",
          new Response(JSON.stringify(event.data.store)),
        ),
      ),
    );
  }
  if (type === "CHECK_NOW") {
    event.waitUntil(maybeNotify());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
