import React from "react";
import { useState, useEffect } from "react";
import { Task, TaskProps } from "./components/Task";

type Filter = "all" | "pending" | "completed";

export function App() {
  const [tasks, setTasks] = useState<TaskProps[]>( () => {
    const savedTasks = localStorage.getItem("tasks");

    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks])

  const [filter, setFilter] = useState<Filter>("all");

  const checkedTasks = tasks.filter(task => task.checked).length;
  const uncheckedTasks = tasks.filter(task => !task.checked).length;

  const filteredTasks = tasks.filter(task => {
    if(filter === "pending")
      return !task.checked;

    if(filter === "completed")
      return task.checked;

    return true;
  });

  function handleCheck(id: number) {
    setTasks(
      tasks.map(task =>
        task.id === id 
        ? { ...task, checked: !task.checked }
        : task
      )
    );
  }

  function handleClick(event: React.MouseEvent) {
    const taskInp = document.querySelector('#task-inp') as HTMLInputElement;

    if(taskInp.value.trim() === "")
      return;

    const newTask: TaskProps = {
      id: tasks.length + 1,
      description: taskInp.value.trim(),
      checked: false,
    };

    setTasks([...tasks, newTask]);
    taskInp.value = "";
  }

  let taskText = "";

  if(filter === "all")
    taskText = `${checkedTasks} tarefas concluídas e ${uncheckedTasks} tarefas não concluídas`;

  if(filter === "completed")
    taskText = `${checkedTasks} tarefas concluídas`;

  if(filter === "pending")
    taskText = `${uncheckedTasks} tarefas não concluídas`;

  return (
    <>
      <h1 className="text-[24px] text-center font-bold p-4">
        To-Do List
      </h1>

      <section className="flex justify-center items-center">
        <input 
          type="text" 
          id="task-inp" 
          className="py-1 px-4 border border-blue-600 rounded-l-lg outline-none"
          placeholder="Digite o nome da tarefa..."
        />
        <button
          className="
            py-1 px-3 border border-blue-600 rounded-r-lg text-white bg-blue-600 font-bold
            cursor-pointer hover:text-blue-600 hover:bg-white"
          onClick={handleClick}
        >
          Adicionar
        </button>
      </section>

      <section className="flex flex-col gap-2 pl-6 pt-6">
        {tasks.length > 0 && (
          <p className="text-[16px] pb-2 tracking-wide">
            {taskText}
          </p> 
        )}
        
        {filteredTasks.map( (task: TaskProps) => (
          <Task 
            key={task.id} 
            id={task.id} 
            description={task.description} 
            checked={task.checked} 
            onCheck={handleCheck}
          />
        ))}
      </section>

      <div 
        className="fixed bottom-0 left-0 z-50 w-full flex justify-evenly py-4 border-t border-gray-400 text-2xl"
      >
        <button
          className="cursor-pointer"
          onClick={() => setFilter("all")}
        >
          🏠︎
        </button>
        
        <button
          className="cursor-pointer"
          onClick={() => setFilter("completed")}
        >
          ✔
        </button>

        <button
          className="cursor-pointer"
          onClick={() => setFilter("pending")}
        >
          ✖
        </button>
      </div>
    </>
  );
}