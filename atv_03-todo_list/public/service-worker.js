// Nome do cache utilizado para a trava de envio diário de notificações
const LATCH_CACHE_NAME = 'todo-daily-reminder-latch-v1';
const LATCH_KEY = 'https://todo-app.local/daily-reminder-last-date';

// Instalação do Service Worker: força ativação imediata
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Ativação do Service Worker: assume o controle dos clientes imediatamente
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Trava de segurança para garantir no máximo 1 notificação por dia utilizando a Cache API.
 * Retorna true se a notificação puder ser enviada hoje, ou false se já foi disparada.
 */
async function shouldSendDailyNotification() {
  try {
    const today = new Date().toISOString().slice(0, 10); // Formato "AAAA-MM-DD"
    const cache = await caches.open(LATCH_CACHE_NAME);
    const cachedResponse = await cache.match(LATCH_KEY);

    if (cachedResponse) {
      const lastDate = await cachedResponse.text();
      if (lastDate === today) {
        console.log(`[Service Worker] Notificação diária bloqueada: já enviada hoje (${today}).`);
        return false;
      }
    }

    // Registra a data de hoje no Cache API como a última execução
    await cache.put(
      LATCH_KEY,
      new Response(today, {
        headers: { 'Content-Type': 'text/plain' },
      })
    );
    return true;
  } catch (error) {
    console.error('[Service Worker] Erro ao validar trava diária:', error);
    // Em caso de inconsistência de cache, permite o envio
    return true;
  }
}

// Listener para sincronização periódica em segundo plano (Periodic Background Sync)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(
      (async () => {
        const canSend = await shouldSendDailyNotification();
        if (!canSend) return;

        const options = {
          body: 'Você possui atividades pendentes! Que tal dar uma olhada e organizar seu dia?',
          icon: '/images/icon-128.png',
          badge: '/images/icon-128.png',
          tag: 'daily-reminder-notification',
          renotify: false,
          data: {
            url: '/',
          },
        };

        await self.registration.showNotification('Lembrete Diário de Tarefas', options);
      })()
    );
  }
});

// Listener para clique na notificação nativa
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se houver uma aba aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Caso contrário, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || '/');
      }
    })
  );
});

// Listener de requisições de rede existente do PWA
self.addEventListener('fetch', (event) => {
  // Mantido para funcionamento padrão do PWA
});
