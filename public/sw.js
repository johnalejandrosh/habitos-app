const CHECK_INTERVAL_MS = 60 * 1000;
const PREFS_CACHE = "habitos-prefs-v1";
const INTERVAL_HOUR_OPTIONS = [1, 2, 3, 4, 6, 8, 12];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function currentSlot() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function normalizeTime(value) {
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(total) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateIntervalTimes(from, until, everyHours) {
  const start = parseMinutes(from);
  const end = parseMinutes(until);
  if (end < start || everyHours <= 0) return [];

  const step = everyHours * 60;
  const times = [];
  for (let t = start; t <= end; t += step) {
    times.push(formatMinutes(t));
  }
  return times;
}

function normalizeFrequency(raw, legacyTimes) {
  if (raw?.type === "daily" && normalizeTime(raw.time)) {
    return { type: "daily", time: normalizeTime(raw.time) };
  }

  if (raw?.type === "times" && Array.isArray(raw.times) && raw.times.length > 0) {
    const times = raw.times.map(normalizeTime).filter(Boolean).sort();
    if (times.length === 1) return { type: "daily", time: times[0] };
    if (times.length > 0) return { type: "times", times };
  }

  if (
    raw?.type === "interval" &&
    INTERVAL_HOUR_OPTIONS.includes(raw.everyHours) &&
    normalizeTime(raw.from) &&
    normalizeTime(raw.until)
  ) {
    return {
      type: "interval",
      everyHours: raw.everyHours,
      from: normalizeTime(raw.from),
      until: normalizeTime(raw.until),
    };
  }

  if (legacyTimes?.length) {
    const times = legacyTimes.map(normalizeTime).filter(Boolean).sort();
    if (times.length === 1) return { type: "daily", time: times[0] };
    if (times.length > 0) return { type: "times", times };
  }

  return { type: "daily", time: "09:00" };
}

function getNotificationScheduleTimes(frequency) {
  switch (frequency.type) {
    case "daily":
      return [frequency.time];
    case "times":
      return [...frequency.times].sort();
    case "interval":
      return generateIntervalTimes(
        frequency.from,
        frequency.until,
        frequency.everyHours,
      );
    default:
      return [];
  }
}

async function getStore() {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match("/store-snapshot.json");
    if (!res) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function wasSlotSent(key) {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match("/sent.json");
    if (!res) return false;
    const data = await res.json();
    if (data.date !== todayKey()) return false;
    return !!data.slots[key];
  } catch {
    return false;
  }
}

async function markSlotSent(key) {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match("/sent.json");
    let data = { date: todayKey(), slots: {} };
    if (res) {
      const parsed = await res.json();
      if (parsed.date === todayKey()) data = parsed;
    }
    data.slots[key] = true;
    await cache.put("/sent.json", new Response(JSON.stringify(data)));
  } catch {
    /* ignore */
  }
}

function getHabitPrefs(habit) {
  const raw = habit.notifications || {};
  const frequency = normalizeFrequency(raw.frequency, raw.times);
  return {
    enabled: !!raw.enabled,
    onlyIfNoLogsToday: raw.onlyIfNoLogsToday !== false,
    frequency,
    schedule: getNotificationScheduleTimes(frequency),
  };
}

function countHabitLogsToday(entries, habitId) {
  const today = todayKey();
  return (entries || []).filter(
    (e) => e.habitId === habitId && e.at && e.at.startsWith(today),
  ).length;
}

async function maybeNotify() {
  const store = await getStore();
  if (!store?.habits?.length) return;

  const slot = currentSlot();
  const entries = store.entries || [];

  for (const habit of store.habits) {
    const prefs = getHabitPrefs(habit);
    if (!prefs.enabled) continue;
    if (!prefs.schedule.includes(slot)) continue;

    const sentKey = `${habit.id}:${slot}`;
    if (await wasSlotSent(sentKey)) continue;

    const logsToday = countHabitLogsToday(entries, habit.id);
    if (prefs.onlyIfNoLogsToday && logsToday > 0) continue;

    const emoji = habit.emoji || "✅";
    const title =
      logsToday === 0
        ? `${emoji} ${habit.name}`
        : `${emoji} ${habit.name} · Sigue así`;
    const body =
      logsToday === 0
        ? `Aún no registraste «${habit.name}» hoy.`
        : `Llevas ${logsToday} registro${logsToday === 1 ? "" : "s"} hoy. ¿Sumas otro?`;

    await self.registration.showNotification(title, {
      body,
      icon: "/icon-192.svg",
      badge: "/icon-192.svg",
      tag: `habitos-${habit.id}-${slot}`,
      renotify: true,
      data: { url: "/home" },
    });

    await markSlotSent(sentKey);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      setInterval(maybeNotify, CHECK_INTERVAL_MS);
      await maybeNotify();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const { type } = event.data || {};
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
