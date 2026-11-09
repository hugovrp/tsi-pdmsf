import { useState, useEffect, useCallback } from "react";

export type NotificationPermissionState = NotificationPermission | "unsupported";

interface PeriodicSyncManagerLike {
  register: (tag: string, options?: { minInterval: number }) => Promise<void>;
  getTags: () => Promise<string[]>;
  unregister: (tag: string) => Promise<void>;
}

export function usePeriodicNotifications() {
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const [isSyncRegistered, setIsSyncRegistered] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator;

  // Verifica se o lembrete diário já está registrado no Service Worker
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker.ready
      .then(async (registration) => {
        const periodicSync = (registration as unknown as { periodicSync?: PeriodicSyncManagerLike }).periodicSync;
        if (periodicSync) {
          const tags = await periodicSync.getTags();
          if (tags.includes("daily-reminder")) {
            setIsSyncRegistered(true);
          }
        }
      })
      .catch((err) => {
        console.warn("Falha ao verificar registros de periodicSync:", err);
      });
  }, [isSupported]);

  const requestDailyReminder = useCallback(async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!isSupported) {
      const msg = "Notificações ou Service Worker não são suportados neste navegador.";
      setErrorMessage(msg);
      return;
    }

    try {
      // Solicita a permissão nativa de notificações
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        setErrorMessage("Permissão para envio de notificações foi negada.");
        return;
      }

      // Aguarda o Service Worker estar pronto
      const registration = await navigator.serviceWorker.ready;
      const periodicSync = (registration as unknown as { periodicSync?: PeriodicSyncManagerLike }).periodicSync;

      // Tenta registrar o Periodic Background Sync se suportado
      if (periodicSync) {
        try {
          // Intervalo de 24 horas (em ms)
          const ONE_DAY_MS = 24 * 60 * 60 * 1000;
          await periodicSync.register("daily-reminder", {
            minInterval: ONE_DAY_MS,
          });
          setIsSyncRegistered(true);
          setStatusMessage("Lembrete diário ativado com sucesso!");
        } catch (syncError) {
          console.warn("PeriodicSync falhou (comum caso o PWA não esteja instalado):", syncError);
          setIsSyncRegistered(true);
          setStatusMessage("Notificações permitidas! (Dica: instale o PWA no celular/desktop para lembretes automáticos em segundo plano)");
        }
      } else {
        setIsSyncRegistered(true);
        setStatusMessage("Notificações permitidas! (Seu navegador não oferece suporte a PeriodicSync em segundo plano)");
      }
    } catch (err) {
      console.error("Erro ao ativar lembrete diário:", err);
      setErrorMessage("Não foi possível ativar o lembrete diário.");
    }
  }, [isSupported]);

  return {
    permission,
    isSupported,
    isSyncRegistered,
    statusMessage,
    errorMessage,
    requestDailyReminder,
    clearStatus: () => {
      setStatusMessage(null);
      setErrorMessage(null);
    },
  };
}
