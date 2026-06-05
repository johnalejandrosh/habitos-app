export function hapticLight(): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(12);
  } catch {
    /* ignore */
  }
}

export function hapticSuccess(): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate([10, 40, 15]);
  } catch {
    /* ignore */
  }
}

export function hapticWarning(): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate([20, 30, 20]);
  } catch {
    /* ignore */
  }
}
