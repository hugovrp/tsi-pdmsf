import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface UseSpeechRecognitionOptions {
  onTranscriptChange?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition({
  onTranscriptChange,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    Boolean((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
            (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionConstructor =
      ((window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
       (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition);

    if (!SpeechRecognitionConstructor) return;

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }

      if (currentTranscript && onTranscriptChange) {
        onTranscriptChange(currentTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      let friendlyMessage = "Ocorreu um erro no reconhecimento de voz.";
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        friendlyMessage = "Permissão do microfone negada. Permita o acesso nas configurações do navegador.";
      } else if (event.error === "no-speech") {
        friendlyMessage = "Nenhuma fala foi detectada. Tente novamente.";
      } else if (event.error === "audio-capture") {
        friendlyMessage = "Microfone não encontrado ou indisponível.";
      }

      setError(friendlyMessage);
      setIsListening(false);
      if (onError) {
        onError(friendlyMessage);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignora erro ao abortar
      }
    };
  }, [isSupported, onTranscriptChange, onError]);

  const startListening = useCallback(() => {
    setError(null);
    if (!isSupported) {
      const msg = "Reconhecimento de voz não é suportado neste navegador.";
      setError(msg);
      onError?.(msg);
      return;
    }

    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.warn("Erro ao iniciar reconhecimento:", err);
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.warn("Erro ao parar reconhecimento:", err);
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setError(null),
  };
}
