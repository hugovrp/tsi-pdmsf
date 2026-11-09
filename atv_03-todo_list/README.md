# ✅ To-Do List

Atividade avaliativa individual: web app responsivo mobile first para gerenciamento de tarefas (to-do list), desenvolvido em React e configurado como Progressive Web App (PWA). A aplicação permite cadastrar tarefas, marcar ou desmarcar tarefas como concluídas, filtrar a listagem, persistir os dados localmente no navegador, ser instalada no dispositivo com o auxílio de Service Worker e Web App Manifest, e integra APIs nativas da Web para aprimorar a experiência do usuário.

> 🚀 **Deploy (GitHub Pages):** [https://hugovrp.github.io/tsi-pdmsf/atv_03-todo_list/](https://hugovrp.github.io/tsi-pdmsf/atv_03-todo_list/)

## 📋 Enunciado

Crie um web app (site responsivo mobile first) de gerenciamento de tarefas (to-do list) em React.

A aplicação deve possuir:

* Opção de adicionar uma tarefa
* Listagem de todas as tarefas cadastradas
* Possibilidade de marcar ou desmarcar cada tarefa
* Texto com a quantidade de tarefas concluídas e não concluídas
* Menu flutuante na parte inferior da tela para filtragem das tarefas
* Filtro de **Tarefas**, exibindo todas as tarefas
* Filtro de **Não concluídas**, exibindo apenas as tarefas não marcadas
* Filtro de **Concluídas**, exibindo apenas as tarefas marcadas
* Persistência dos dados utilizando **LocalStorage**
* Interface visual seguindo a linguagem de design neumorphism (Soft UI), desenvolvida com o auxílio de um agente de codificação com IA.
* Configuração como **PWA (Progressive Web App)** com suporte à **instalação** no dispositivo (desktop e mobile)
* Registro e ciclo de vida de **Service Worker**
* Integração da **Vibration API** para acionar uma vibração curta de 300ms no momento em que uma tarefa é alterada para concluída
* Integração da **SpeechRecognition API (Web Speech API)** com botão de microfone ao lado do input para captura e conversão de voz em tempo real (em português - pt-BR), com controle de estado visual e tratamento de erro caso a permissão seja negada
* Integração da **Notifications API** com registro de sincronização periódica diária (**Periodic Background Sync**) via Service Worker e trava de segurança baseada em data (via Cache API) para no máximo uma notificação por dia

## 🛠️ Tecnologias utilizadas

* React
* TypeScript
* Tailwind CSS
* LocalStorage
* PWA (Progressive Web App)
* Service Worker
* Web App Manifest
* Vibration API
* Web Speech API (SpeechRecognition)
* Notifications API
* Periodic Background Sync API

## ▶️ Como executar

Clone o repositório, entre no diretório da atividade e instale as dependências:

```bash
git clone https://github.com/hugovrp/tsi-pdmsf.git
cd tsi-pdmsf/atv_03-todo_list
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Após iniciar o servidor, acesse o endereço exibido no terminal, normalmente:

```text
http://localhost:5173
```

Para testar ou instalar a aplicação como **PWA**, acesse o endereço no [GitHub Pages](https://hugovrp.github.io/tsi-pdmsf/atv_03-todo_list/) ou no ambiente local através de um navegador compatível e clique na opção de **Instalar aplicativo** na barra de endereços ou no menu do navegador (em dispositivos móveis, através da opção "Adicionar à tela de início" / "Instalar").
