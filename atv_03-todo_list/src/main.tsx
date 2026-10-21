import './index.css'
import { App } from "./App";
import { StrictMode } from 'react';
import { createRoot } from "react-dom/client"

// Registra o Service Worker
if("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`)
      .then( (registration) => {
        console.log("Service Worker registrado: ", registration.scope);
      })
      .catch( (error) => {
        console.log("Erro ao registrar o Service Worker: ", error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/>
  </StrictMode>
);