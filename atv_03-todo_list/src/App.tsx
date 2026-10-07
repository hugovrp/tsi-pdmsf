import React, { useState, useEffect } from "react";
import { Task, TaskProps } from "./components/Task";

type Filter = "all" | "pending" | "completed";

export function App() {
  const [tasks, setTasks] = useState<TaskProps[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const [filter, setFilter] = useState<Filter>("all");

  const checkedTasks = tasks.filter((task) => task.checked).length;
  const uncheckedTasks = tasks.filter((task) => !task.checked).length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.checked;
    if (filter === "completed") return task.checked;
    return true;
  });

  function handleCheck(id: number) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, checked: !task.checked } : task
      )
    );
  }

  function handleClick(event: React.MouseEvent | React.FormEvent) {
    if (event && "preventDefault" in event) {
      event.preventDefault();
    }

    const taskInp = document.querySelector("#task-inp") as HTMLInputElement;

    if (!taskInp || taskInp.value.trim() === "") return;

    const newTask: TaskProps = {
      id: tasks.length + 1,
      description: taskInp.value.trim(),
      checked: false,
    };

    setTasks([...tasks, newTask]);
    taskInp.value = "";
  }

  let taskText = "";

  if (filter === "all")
    taskText = `${checkedTasks} tarefas concluídas e ${uncheckedTasks} tarefas não concluídas`;

  if (filter === "completed")
    taskText = `${checkedTasks} tarefas concluídas`;

  if (filter === "pending")
    taskText = `${uncheckedTasks} tarefas não concluídas`;

  // Humanized formatted date
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
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-indigo-700 bg-indigo-500/10 neu-pill-inset">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Organizador Pessoal
            </span>
            <span className="text-xs font-medium text-slate-500">
              {capitalizedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            To-Do List
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Planeje, acompanhe e realize suas atividades com tranquilidade.
          </p>
        </header>

        {/* Progress Overview Card (When tasks exist) */}
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

            {/* Preserved Status Text Requirement */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3.5 pt-3 border-t border-slate-300/40 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
              {taskText}
            </p>
          </section>
        )}

        {/* Add Task Input Section */}
        <section
          aria-label="Adicionar nova tarefa"
          className="neu-card rounded-3xl p-4 sm:p-5 mb-7"
        >
          <form
            onSubmit={handleClick}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                id="task-inp"
                className="neu-input w-full py-3 px-4.5 rounded-2xl text-[15px] sm:text-base text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="Digite o nome da tarefa..."
                aria-label="Nome da nova tarefa"
              />
            </div>
            <button
              type="submit"
              onClick={handleClick}
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
        </section>

        {/* Tasks List Section */}
        <section aria-label="Lista de tarefas">
          {/* Section Heading & Counter */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span>Tarefas</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full neu-pill-inset text-slate-600">
                {filteredTasks.length}
              </span>
            </h2>

            {/* Filter description badge */}
            <span className="text-xs font-medium text-slate-500 capitalize">
              {filter === "all" && "Todas as tarefas"}
              {filter === "pending" && "Somente pendentes"}
              {filter === "completed" && "Somente concluídas"}
            </span>
          </div>

          {/* Task Items */}
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
            /* Friendly, Humanized Empty States */
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
                    Adicione uma tarefa no campo acima para começar a organizar sua rotina.
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