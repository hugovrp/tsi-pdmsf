export function useVibration() {
  const vibrate = (pattern: number | number[] = 100): boolean => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        const result = navigator.vibrate(pattern);
        if (result) {
          console.log(`📳 [Vibration API] Vibração de ${pattern}ms acionada com sucesso.`);
        } else {
          console.info(
            `📳 [Vibration API] Chamada executada (navigator.vibrate), mas este dispositivo não possui motor de vibração (comum em desktops e notebooks). Teste em um celular Android.`
          );
        }
        return result;
      } catch (err) {
        console.warn("Falha ao acionar a Vibration API:", err);
        return false;
      }
    }
    console.info("📳 [Vibration API] navigator.vibrate não é suportado neste navegador.");
    return false;
  };

  return { vibrate };
}
