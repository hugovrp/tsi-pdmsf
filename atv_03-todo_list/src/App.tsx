import React, { useState, useEffect, useCallback } from "react";
import { Task, TaskProps } from "./components/Task";
import { useVibration } from "./hooks/useVibration";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { usePeriodicNotifications } from "./hooks/usePeriodicNotifications";

type Filter = "all" | "pending" | "completed";

export function App() {
  const [tasks, setTasks] = useState<TaskProps[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [taskInput, setTaskInput] = useState<string>("");

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true;
  });

  // 1. Hook para Vibration API
  const { vibrate } = useVibration();

  const handleTranscript = useCallback((text: string) => {
    setTaskInput(text);
  }, []);

  // 2. Hook para Web Speech API (Reconhecimento de Voz em pt-BR)
  const {
    isListening,
    error: speechError,
    isSupported: isSpeechSupported,
    toggleListening,
    clearError: clearSpeechError,
  } = useSpeechRecognition({
    onTranscriptChange: handleTranscript,
  });

  // 3. Hook para Notifications API + Periodic Background Sync
  const {
    permission: notificationPermission,
    isSyncRegistered,
    statusMessage: notificationStatus,
    errorMessage: notificationError,
    requestDailyReminder,
    clearStatus: clearNotificationStatus,
  } = usePeriodicNotifications();

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const [filter, setFilter] = useState<Filter>("all");

  const checkedTasks = tasks.filter((task) => task.checked).length;
  const uncheckedTasks = tasks.filter((task) => !task.checked).length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.checked;
    if (filter === "completed") return task.checked;
    return true;
  });

  // 1. Vibration API acionada exatamente ao marcar tarefa como "concluída"
  function handleCheck(id: number) {
    const targetTask = tasks.find((t) => t.id === id);
    if (targetTask && !targetTask.checked) {
      // Dispara vibração curta e sutil de 100ms sincronizada com o clique
      vibrate(100);
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          return { ...task, checked: !task.checked };
        }
        return task;
      })
    );
  }

  function handleAddTask(event?: React.FormEvent) {
    if (event) {
      event.preventDefault();
    }

    const trimmed = taskInput.trim();
    if (!trimmed) return;

    const newTask: TaskProps = {
      id: Date.now(),
      description: trimmed,
      checked: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setTaskInput("");
  }

  let taskText = "";
  if (filter === "all")
    taskText = `${checkedTasks} tarefas concluídas e ${uncheckedTasks} tarefas não concluídas`;
  if (filter === "completed")
    taskText = `${checkedTasks} tarefas concluídas`;
  if (filter === "pending")
    taskText = `${uncheckedTasks} tarefas não concluídas`;

  const todayFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const capitalizedDate =
    todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  const completionPercentage =
    tasks.length > 0 ? Math.round((checkedTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-800 antialiased">
      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-36">
        {/* Header / Brand */}
        <header className="mb-7">
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-indigo-700 bg-indigo-500/10 neu-pill-inset">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Organizador Pessoal
            </span>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Botão de Ativação do Lembrete Diário (Notifications API + Periodic Sync) */}
              <button
                type="button"
                onClick={requestDailyReminder}
                disabled={notificationPermission === "granted" && isSyncRegistered}
                title={
                  notificationPermission === "granted"
                    ? "Lembrete diário já está ativo"
                    : "Ativar Lembrete Diário via Notificações"
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  notificationPermission === "granted"
                    ? "neu-pressed text-emerald-700 bg-emerald-500/10"
                    : "neu-button text-slate-700 hover:text-indigo-600 active:scale-95"
                }`}
                aria-label="Ativar Lembrete Diário"
              >
                <span className="text-sm">
                  {notificationPermission === "granted" ? "🔔" : "🔕"}
                </span>
                <span>
                  {notificationPermission === "granted"
                    ? "Lembrete Ativo"
                    : "Ativar Lembrete Diário"}
                </span>
              </button>

              {/* Indicador de Status Online / Offline */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold neu-pill-inset"
                role="status"
                aria-live="polite"
              >
                <span
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    isOnline ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className={isOnline ? "text-slate-600" : "text-rose-600 font-bold"}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <span className="text-xs font-medium text-slate-500">
                {capitalizedDate}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            To-Do List
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Planeje, acompanhe e realize suas atividades com tranquilidade.
          </p>

          {/* Feedback de Notificações */}
          {notificationStatus && (
            <div className="mt-3 p-3 rounded-2xl neu-pressed text-xs text-emerald-800 flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{notificationStatus}</span>
              </div>
              <button
                type="button"
                onClick={clearNotificationStatus}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
                aria-label="Fechar mensagem"
              >
                ✕
              </button>
            </div>
          )}

          {notificationError && (
            <div className="mt-3 p-3 rounded-2xl neu-pressed text-xs text-rose-800 flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{notificationError}</span>
              </div>
              <button
                type="button"
                onClick={clearNotificationStatus}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
                aria-label="Fechar mensagem de erro"
              >
                ✕
              </button>
            </div>
          )}
        </header>

        {/* Progress Overview Card */}
        {tasks.length > 0 && (
          <section
            aria-label="Resumo do progresso"
            className="neu-card rounded-3xl p-5 mb-7 transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl neu-pressed flex items-center justify-center text-indigo-600 text-sm">
                  📊
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Progresso Geral
                  </h2>
                  <p className="text-sm font-semibold text-slate-700">
                    {completionPercentage}% concluído
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full neu-pill-inset text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {checkedTasks}
                </span>
                <span className="text-slate-400">/</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full neu-pill-inset text-amber-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {uncheckedTasks}
                </span>
              </div>
            </div>

            {/* Tactile Neumorphic Progress Bar */}
            <div
              className="w-full h-3 neu-pressed rounded-full p-0.5 overflow-hidden"
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3.5 pt-3 border-t border-slate-300/40 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
              {taskText}
            </p>
          </section>
        )}

        {/* Add Task Input Section with Web Speech Recognition Button */}
        <section
          aria-label="Adicionar nova tarefa"
          className="neu-card rounded-3xl p-4 sm:p-5 mb-7"
        >
          <form
            onSubmit={handleAddTask}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                id="task-inp"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                className="neu-input w-full py-3 pl-4 pr-12 rounded-2xl text-[15px] sm:text-base text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder={
                  isListening
                    ? "Ouvindo... Fale agora para preencher a tarefa"
                    : "Digite ou fale o nome da tarefa..."
                }
                aria-label="Nome da nova tarefa"
              />

              {/* Botão de Microfone (Web Speech API) */}
              <button
                type="button"
                onClick={toggleListening}
                title={
                  !isSpeechSupported
                    ? "Reconhecimento de voz não suportado neste navegador"
                    : isListening
                    ? "Parar gravação de voz"
                    : "Gravar tarefa por voz (pt-BR)"
                }
                aria-label={
                  isListening
                    ? "Parar reconhecimento de voz"
                    : "Iniciar reconhecimento de voz"
                }
                className={`absolute right-2.5 p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  isListening
                    ? "neu-pressed bg-rose-500/15 text-rose-600 ring-2 ring-rose-500/50 scale-105 animate-pulse"
                    : "text-slate-500 hover:text-indigo-600 active:scale-95 neu-button"
                } ${!isSpeechSupported ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <svg
                  className="w-5 h-5 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isListening ? 2.5 : 2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3v6a3 3 0 003 3z"
                  />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              className="neu-button-primary shrink-0 py-3 px-6 rounded-2xl font-bold text-sm sm:text-base cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e9edf2] outline-none"
            >
              <svg
                className="w-4 h-4 stroke-[2.5]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>Adicionar</span>
            </button>
          </form>

          {/* Feedback de erro no Reconhecimento de Voz */}
          {speechError && (
            <div className="mt-3 p-3 rounded-2xl neu-pressed text-xs text-rose-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>🎙️</span>
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={clearSpeechError}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
                aria-label="Fechar erro de reconhecimento"
              >
                ✕
              </button>
            </div>
          )}

          {isListening && (
            <div className="mt-2.5 px-3 py-1.5 rounded-xl neu-pill-inset flex items-center gap-2 text-xs font-semibold text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>Gravando áudio em português (pt-BR)... Fale o nome da tarefa</span>
            </div>
          )}
        </section>

        {/* Tasks List Section */}
        <section aria-label="Lista de tarefas">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span>Tarefas</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full neu-pill-inset text-slate-600">
                {filteredTasks.length}
              </span>
            </h2>

            <span className="text-xs font-medium text-slate-500 capitalize">
              {filter === "all" && "Todas as tarefas"}
              {filter === "pending" && "Somente pendentes"}
              {filter === "completed" && "Somente concluídas"}
            </span>
          </div>

          {filteredTasks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredTasks.map((task: TaskProps) => (
                <Task
                  key={task.id}
                  id={task.id}
                  description={task.description}
                  checked={task.checked}
                  onCheck={handleCheck}
                />
              ))}
            </div>
          ) : (
            <div className="neu-card rounded-3xl p-8 text-center flex flex-col items-center justify-center my-4 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl neu-pressed flex items-center justify-center text-2xl text-slate-400 mb-3.5">
                {tasks.length === 0 && "📝"}
                {tasks.length > 0 && filter === "completed" && "⏳"}
                {tasks.length > 0 && filter === "pending" && "🎉"}
              </div>

              {tasks.length === 0 ? (
                <>
                  <h3 className="text-base font-bold text-slate-700 mb-1">
                    Nenhuma tarefa cadastrada
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Adicione uma tarefa digitando ou falando no campo acima para começar a sua rotina.
                  </p>
                </>
              ) : filter === "completed" ? (
                <>
                  <h3 className="text-base font-bold text-slate-700 mb-1">
                    Nenhuma tarefa concluída ainda
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Marque suas tarefas concluídas na lista para vê-las reunidas aqui.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-base font-bold text-slate-700 mb-1">
                    Tudo concluído por aqui!
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Parabéns! Todas as tarefas cadastradas foram finalizadas.
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Floating Bottom Navigation Filter Menu */}
      <nav
        aria-label="Filtro de tarefas"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
      >
        <div
          role="tablist"
          className="neu-card rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-2xl backdrop-blur-md bg-[#e9edf2]/95"
        >
          {/* Filter: All */}
          <button
            role="tab"
            aria-selected={filter === "all"}
            aria-label="Exibir todas as tarefas"
            onClick={() => setFilter("all")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${
              filter === "all"
                ? "neu-pressed text-indigo-600 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/20 active:translate-y-0.5"
            }`}
          >
            <span className="text-base leading-none" aria-hidden="true">
              🏠︎
            </span>
            <span>Todas</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-300/60 text-slate-700"
              }`}
            >
              {tasks.length}
            </span>
          </button>

          {/* Filter: Pending */}
          <button
            role="tab"
            aria-selected={filter === "pending"}
            aria-label="Exibir tarefas não concluídas"
            onClick={() => setFilter("pending")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${
              filter === "pending"
                ? "neu-pressed text-amber-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/20 active:translate-y-0.5"
            }`}
          >
            <span className="text-base leading-none" aria-hidden="true">
              ✖
            </span>
            <span>Pendentes</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-300/60 text-slate-700"
              }`}
            >
              {uncheckedTasks}
            </span>
          </button>

          {/* Filter: Completed */}
          <button
            role="tab"
            aria-selected={filter === "completed"}
            aria-label="Exibir tarefas concluídas"
            onClick={() => setFilter("completed")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${
              filter === "completed"
                ? "neu-pressed text-emerald-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/20 active:translate-y-0.5"
            }`}
          >
            <span className="text-base leading-none" aria-hidden="true">
              ✔
            </span>
            <span>Concluídas</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === "completed"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-300/60 text-slate-700"
              }`}
            >
              {checkedTasks}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
