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
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const onErrorRef = useRef(onError);

  // Mantém referências atualizadas sem disparar re-render ou re-instanciação
  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const isSupported =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );

  // Limpa o reconhecimento ao desmontar o componente
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignora erro ao abortar
        }
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Erro ao parar reconhecimento:", err);
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    setError(null);

    if (!isSupported) {
      const msg = "Reconhecimento de voz não é suportado neste navegador.";
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    const SpeechRecognitionConstructor =
      ((window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
       (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition);

    if (!SpeechRecognitionConstructor) return;

    // Se já houver uma instância ativa, encerra antes de iniciar nova sessão
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignora
      }
    }

    try {
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

        if (currentTranscript && onTranscriptChangeRef.current) {
          onTranscriptChangeRef.current(currentTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.warn("Web Speech API erro:", event.error);

        // 'aborted' ocorre normalmente quando o usuário encerra ou interrompe a fala; não deve ser tratado como erro
        if (event.error === "aborted") {
          setIsListening(false);
          return;
        }

        let friendlyMessage = `Ocorreu um erro no reconhecimento (${event.error}).`;

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          friendlyMessage = "Permissão do microfone negada. Permita o acesso ao microfone nas configurações do navegador.";
        } else if (event.error === "no-speech") {
          friendlyMessage = "Nenhuma fala foi detectada. Tente falar novamente mais próximo ao microfone.";
        } else if (event.error === "audio-capture") {
          friendlyMessage = "Microfone não encontrado ou em uso por outro aplicativo.";
        } else if (event.error === "network") {
          friendlyMessage = "Falha de conexão com o serviço de reconhecimento de voz. Verifique sua conexão com a internet.";
        }

        setError(friendlyMessage);
        setIsListening(false);
        onErrorRef.current?.(friendlyMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Erro ao instanciar ou iniciar reconhecimento:", err);
      const msg = "Não foi possível iniciar o microfone.";
      setError(msg);
      onErrorRef.current?.(msg);
      setIsListening(false);
    }
  }, [isSupported]);

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
