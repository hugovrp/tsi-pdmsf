import './index.css'
import { App } from "./App";
import { StrictMode } from 'react';
import { createRoot } from "react-dom/client"

// Registra o Service Worker
if ("serviceWorker" in navigator) {
  const registerServiceWorker = () => {
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .then((registration) => {
        console.log("Service Worker registrado: ", registration.scope);
      })
      .catch((error) => {
        console.error("Erro ao registrar o Service Worker: ", error);
      });
  };

  if (document.readyState === "complete") {
    registerServiceWorker();
  } else {
    window.addEventListener("load", registerServiceWorker);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/>
  </StrictMode>
);
