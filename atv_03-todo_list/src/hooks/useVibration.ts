export function useVibration() {
  const vibrate = (pattern: number | number[] = 100): boolean => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        return navigator.vibrate(pattern);
      } catch (err) {
        console.warn("Falha ao acionar a Vibration API:", err);
        return false;
      }
    }
    return false;
  };

  return { vibrate };
}
