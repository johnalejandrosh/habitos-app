"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pickDefaultEmoji } from "@/lib/habit-emojis";
import {
  DAILY_TOTAL_GOAL,
  DAILY_VISUAL_GOAL,
  isMilestoneCount,
  pickComboMessage,
  pickDailyTotalMessage,
  pickEncouragement,
} from "@/lib/habit-feedback";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import {
  countEntriesToday,
  createHabitEntry,
  getHabitStreak,
  getTodayEntriesForHabit,
  loadHabitStore,
  saveHabitStore,
  type Habit,
  type HabitStore,
} from "@/lib/habits-storage";
import { loadNotificationPrefs } from "@/lib/notification-prefs";
import { isSoundEnabled, playTick, setSoundEnabled } from "@/lib/sounds";
import { useHabitReminders } from "@/hooks/use-habit-reminders";
import {
  CelebrationOverlay,
  type Celebration,
} from "./CelebrationOverlay";
import { CoachMarks } from "./CoachMarks";
import { ConfettiBurst } from "./ConfettiBurst";
import { DailyProgressHero } from "./DailyProgressHero";
import { AddHabitSheet } from "./AddHabitSheet";
import { HabitCard } from "./HabitCard";
import { HistorySheet } from "./HistorySheet";
import { InsightsSection } from "./InsightsSection";
import { LogEntrySheet } from "./LogEntrySheet";
import { NotificationSettingsSheet } from "./NotificationSettingsSheet";
import { StatsSheet } from "./StatsSheet";
import { ToastStack, type ToastItem } from "./ToastStack";

const COMBO_WINDOW_MS = 2000;

export function HabitTracker() {
  const [store, setStore] = useState<HabitStore | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("✅");
  const [historyHabitId, setHistoryHabitId] = useState<string | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [logSheetHabit, setLogSheetHabit] = useState<Habit | null>(null);
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pulseHabitId, setPulseHabitId] = useState<string | null>(null);
  const [flashHabitId, setFlashHabitId] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [counterBump, setCounterBump] = useState(false);
  const [combos, setCombos] = useState<Record<string, number>>({});
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);

  useHabitReminders(store);

  const comboTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const comboCounts = useRef<Record<string, number>>({});
  const celebrated = useRef({ dailyGoal: false, habits: new Set<string>() });

  useEffect(() => {
    setStore(loadHabitStore());
    setSoundOn(isSoundEnabled());
    setNotificationsOn(loadNotificationPrefs().enabled);
    return () => {
      Object.values(comboTimers.current).forEach(clearTimeout);
    };
  }, []);

  const persist = useCallback((next: HabitStore) => {
    setStore(next);
    saveHabitStore(next);
  }, []);

  const pushToast = useCallback((message: string, variant?: ToastItem["variant"]) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const totalToday = store ? countEntriesToday(store.entries) : 0;
  const goalComplete = totalToday >= DAILY_TOTAL_GOAL;

  const yesterdayTotal = useMemo(() => {
    if (!store) return 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const key = d.toISOString().slice(0, 10);
    return store.entries.filter((e) => e.at.startsWith(key)).length;
  }, [store]);

  const historyHabit = store?.habits.find((h) => h.id === historyHabitId);

  const maybeCelebrate = useCallback(
    (habitId: string, habitName: string, habitEmoji: string, countAfter: number, totalAfter: number) => {
      if (countAfter === DAILY_VISUAL_GOAL && !celebrated.current.habits.has(habitId)) {
        celebrated.current.habits.add(habitId);
        setCelebration({
          emoji: habitEmoji,
          title: "¡Meta del hábito!",
          subtitle: `${habitName} — ${DAILY_VISUAL_GOAL} registros hoy`,
        });
        setConfettiKey((k) => k + 1);
        return;
      }
      if (totalAfter >= DAILY_TOTAL_GOAL && !celebrated.current.dailyGoal) {
        celebrated.current.dailyGoal = true;
        setCelebration({
          emoji: "🏆",
          title: "¡Meta del día!",
          subtitle: `${DAILY_TOTAL_GOAL} registros completados`,
        });
        setConfettiKey((k) => k + 1);
      }
    },
    [],
  );

  const scheduleComboToast = useCallback(
    (habitId: string, habitName: string) => {
      if (comboTimers.current[habitId]) clearTimeout(comboTimers.current[habitId]);

      comboCounts.current[habitId] = (comboCounts.current[habitId] ?? 0) + 1;
      const combo = comboCounts.current[habitId];
      setCombos((c) => ({ ...c, [habitId]: combo }));

      comboTimers.current[habitId] = setTimeout(() => {
        const finalCombo = comboCounts.current[habitId] ?? 0;
        comboCounts.current[habitId] = 0;
        setCombos((c) => {
          const next = { ...c };
          delete next[habitId];
          return next;
        });
        if (finalCombo >= 3) {
          pushToast(`${pickComboMessage(finalCombo)} · ${habitName}`);
          if (finalCombo >= 5) setConfettiKey((k) => k + 1);
        }
      }, COMBO_WINDOW_MS);
    },
    [pushToast],
  );

  const logHabit = useCallback(
    (
      habitId: string,
      habitName: string,
      habitEmoji: string,
      opts?: { silent?: boolean; description?: string },
    ) => {
      if (!store) return;

      const countBefore = countEntriesToday(store.entries, habitId);
      const entry = createHabitEntry(habitId, opts?.description);
      const next = { ...store, entries: [...store.entries, entry] };
      persist(next);

      const countAfter = countBefore + 1;
      const totalAfter = countEntriesToday(next.entries);

      hapticLight();
      if (isMilestoneCount(countAfter)) hapticSuccess();

      setPulseHabitId(habitId);
      setFlashHabitId(habitId);
      setTimeout(() => {
        setPulseHabitId(null);
        setFlashHabitId(null);
      }, 450);

      setCounterBump(true);
      setTimeout(() => setCounterBump(false), 400);

      scheduleComboToast(habitId, habitName);
      maybeCelebrate(habitId, habitName, habitEmoji, countAfter, totalAfter);

      if (!opts?.silent) {
        const comboNow = comboCounts.current[habitId] ?? 1;
        if (comboNow < 3 && (isMilestoneCount(countAfter) || countAfter === 1)) {
          pushToast(`${pickEncouragement(countAfter)} · ${habitName}`);
        }
        const dailyMsg = pickDailyTotalMessage(totalAfter);
        if (dailyMsg) setTimeout(() => pushToast(dailyMsg, "info"), 350);
        if ([5, 10, 15].includes(countAfter)) setConfettiKey((k) => k + 1);
      }
    },
    [store, persist, scheduleComboToast, maybeCelebrate, pushToast],
  );

  function logHabitMany(
    habitId: string,
    habitName: string,
    habitEmoji: string,
    n: number,
  ) {
    if (!store) return;

    const countBefore = countEntriesToday(store.entries, habitId);
    const newEntries = Array.from({ length: n }, () => createHabitEntry(habitId));
    const next = { ...store, entries: [...store.entries, ...newEntries] };
    persist(next);

    const countAfter = countBefore + n;
    const totalAfter = countEntriesToday(next.entries);

    hapticSuccess();
    playTick(720);
    setPulseHabitId(habitId);
    setFlashHabitId(habitId);
    setTimeout(() => {
      setPulseHabitId(null);
      setFlashHabitId(null);
    }, 500);
    setCounterBump(true);
    setTimeout(() => setCounterBump(false), 400);
    setConfettiKey((k) => k + 1);
    pushToast(`+${n} registros · ${habitName}`);
    maybeCelebrate(habitId, habitName, habitEmoji, countAfter, totalAfter);
  }

  function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const name = newHabitName.trim();
    if (!name || !store) return;

    const habit: Habit = {
      id: crypto.randomUUID(),
      name,
      emoji: newHabitEmoji,
    };
    persist({ ...store, habits: [...store.habits, habit] });
    setNewHabitName("");
    setNewHabitEmoji(pickDefaultEmoji(store.habits.length + 1));
    setAddSheetOpen(false);
    hapticSuccess();
    pushToast(`${habit.emoji} "${name}" listo — toca +1`, "info");
  }

  function undoLastEntry(habitId: string) {
    if (!store) return;
    const todayEntries = getTodayEntriesForHabit(store.entries, habitId);
    if (todayEntries.length === 0) return;
    const removeId = todayEntries[0].id;
    persist({
      ...store,
      entries: store.entries.filter((e) => e.id !== removeId),
    });
    comboCounts.current[habitId] = 0;
    setCombos((c) => {
      const next = { ...c };
      delete next[habitId];
      return next;
    });
    pushToast("Registro deshecho", "info");
  }

  function removeHabit(habitId: string) {
    if (!store) return;
    persist({
      habits: store.habits.filter((h) => h.id !== habitId),
      entries: store.entries.filter((e) => e.habitId !== habitId),
    });
    celebrated.current.habits.delete(habitId);
    if (historyHabitId === habitId) setHistoryHabitId(null);
    pushToast("Hábito eliminado", "info");
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playTick();
    pushToast(next ? "Sonido activado" : "Sonido desactivado", "info");
  }

  if (store === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-zinc-500">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm">Cargando tus hábitos…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-zinc-50 dark:bg-black">
      <ConfettiBurst trigger={confettiKey} />
      <CelebrationOverlay
        celebration={celebration}
        onDone={() => setCelebration(null)}
      />
      <CoachMarks hasHabits={store.habits.length > 0} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {historyHabit && (
        <HistorySheet
          habit={historyHabit}
          entries={getTodayEntriesForHabit(store.entries, historyHabit.id)}
          open={!!historyHabitId}
          onClose={() => setHistoryHabitId(null)}
          onUndo={() => {
            const entries = getTodayEntriesForHabit(store.entries, historyHabit.id);
            undoLastEntry(historyHabit.id);
            if (entries.length <= 1) setHistoryHabitId(null);
          }}
        />
      )}

      <StatsSheet
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        totalToday={totalToday}
        habits={store.habits}
        entries={store.entries}
        getCount={(id) => countEntriesToday(store.entries, id)}
      />

      <AddHabitSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        name={newHabitName}
        emoji={newHabitEmoji}
        onNameChange={setNewHabitName}
        onEmojiChange={setNewHabitEmoji}
        onSubmit={addHabit}
      />

      <LogEntrySheet
        habit={logSheetHabit}
        open={!!logSheetHabit}
        onClose={() => setLogSheetHabit(null)}
        onConfirm={(description) => {
          if (!logSheetHabit) return;
          const { id, name, emoji } = logSheetHabit;
          setLogSheetHabit(null);
          logHabit(id, name, emoji ?? "✅", { description });
        }}
      />

      <NotificationSettingsSheet
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onPrefsChange={(prefs) => setNotificationsOn(prefs.enabled)}
      />

      <header className="sticky top-0 z-10 bg-zinc-50/90 px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-md dark:bg-black/90">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Hábitos
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className={`relative flex h-11 w-11 items-center justify-center rounded-2xl text-lg active:scale-95 ${
                notificationsOn
                  ? "bg-emerald-100 dark:bg-emerald-950"
                  : "bg-zinc-200/80 dark:bg-zinc-800"
              }`}
              aria-label="Configurar notificaciones"
            >
              🔔
              {notificationsOn && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg active:scale-95 ${
                soundOn
                  ? "bg-emerald-100 dark:bg-emerald-950"
                  : "bg-zinc-200/80 dark:bg-zinc-800"
              }`}
              aria-label={soundOn ? "Desactivar sonido" : "Activar sonido"}
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-8 px-5 py-6 pb-28">
        <DailyProgressHero
          totalToday={totalToday}
          yesterdayTotal={yesterdayTotal}
          bump={counterBump}
          goalComplete={goalComplete}
          onOpenStats={() => setStatsOpen(true)}
        />

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Tus hábitos
            </h2>
            <span className="text-sm text-zinc-400">
              {store.habits.length}{" "}
              {store.habits.length === 1 ? "activo" : "activos"}
            </span>
          </div>

          <div className="flex flex-col gap-5">
          {store.habits.length === 0 ? (
            <button
              type="button"
              onClick={() => setAddSheetOpen(true)}
              className="rounded-3xl border-2 border-dashed border-emerald-200 bg-white px-6 py-14 text-center active:border-emerald-400 active:bg-emerald-50/50 dark:border-emerald-900 dark:bg-zinc-950"
            >
              <p className="text-5xl habit-float-gentle">🎯</p>
              <p className="mt-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
                Crea tu primer hábito
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Toca aquí para empezar
              </p>
            </button>
          ) : (
            store.habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                count={countEntriesToday(store.entries, habit.id)}
                streak={getHabitStreak(store.entries, habit.id)}
                combo={combos[habit.id] ?? 0}
                ringPulse={pulseHabitId === habit.id}
                flash={flashHabitId === habit.id}
                onOpenHistory={() => setHistoryHabitId(habit.id)}
                onRequestLog={() => setLogSheetHabit(habit)}
                onHoldLog={() =>
                  logHabit(habit.id, habit.name, habit.emoji ?? "✅", {
                    silent: true,
                  })
                }
                onLogMany={(n) =>
                  logHabitMany(habit.id, habit.name, habit.emoji ?? "✅", n)
                }
                onUndo={() => undoLastEntry(habit.id)}
                onRemove={() => removeHabit(habit.id)}
              />
            ))
          )}
          </div>
        </section>

        {store && (
          <InsightsSection
            store={store}
            open={insightsOpen}
            onToggle={() => setInsightsOpen((o) => !o)}
            selectedDate={selectedChartDate}
            onSelectDate={setSelectedChartDate}
          />
        )}
      </main>

      <button
        type="button"
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-3xl font-light text-white shadow-lg shadow-emerald-600/40 active:scale-95 active:bg-emerald-700"
        aria-label="Añadir hábito"
      >
        +
      </button>
    </div>
  );
}
