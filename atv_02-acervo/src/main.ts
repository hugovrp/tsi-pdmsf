import { Categorias, Livro } from "./livro.js";

// Elementos do DOM
const formLivro = document.getElementById('form-livro') as HTMLFormElement;
const nomeInp = document.getElementById('nome') as HTMLInputElement;
const autorInp = document.getElementById('autor') as HTMLInputElement;
const anoInp = document.getElementById('ano') as HTMLInputElement;
const categoriaSel = document.getElementById('categoria') as HTMLSelectElement;
const editoraInp = document.getElementById('editora') as HTMLInputElement;
const btnSubmit = document.getElementById('btn-submit') as HTMLButtonElement;
const btnLimpar = document.getElementById('btn-limpar') as HTMLButtonElement;
const containerListagem = document.getElementById('list-cont') as HTMLDivElement;
const feedbackToast = document.getElementById('feedback-toast') as HTMLDivElement;

// Elementos de Filtro e Busca
const buscaInp = document.getElementById('busca') as HTMLInputElement;
const filtroCategoriaSel = document.getElementById('filtro-categoria') as HTMLSelectElement;
const ordenacaoSel = document.getElementById('ordenacao') as HTMLSelectElement;

// Estado Global
let livros: Livro[] = [];
let livroEmEdicaoId: number | null = null;

// Funções de Inicialização e Eventos
document.addEventListener('DOMContentLoaded', () => {
  renderizarLista();
});

formLivro.addEventListener('submit', (e) => {
  e.preventDefault();
  salvarLivro();
});

btnLimpar.addEventListener('click', limparCampos);

// Eventos de Filtro e Busca
buscaInp.addEventListener('input', renderizarLista);
filtroCategoriaSel.addEventListener('change', renderizarLista);
ordenacaoSel.addEventListener('change', renderizarLista);

// Delegação de Eventos para os botões Editar/Excluir
containerListagem.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const btnEditar = target.closest('.btn-editar') as HTMLButtonElement;
  const btnExcluir = target.closest('.btn-excluir') as HTMLButtonElement;

  if (btnEditar) {
    const id = Number(btnEditar.dataset.id);
    iniciarEdicao(id);
  }
  
  if (btnExcluir) {
    const id = Number(btnExcluir.dataset.id);
    excluirLivro(id);
  }
});

/**
 * Valida o formulário, exibindo os aros vermelhos se houver erros.
 */
function validarCamposObrigatorios(): boolean {
  let valido = true;
  const campos = [nomeInp, autorInp, anoInp, categoriaSel];

  campos.forEach(campo => {
    if (!campo.value.trim() || (campo === anoInp && isNaN(Number(campo.value)))) {
      campo.setAttribute('aria-invalid', 'true');
      valido = false;
    } else {
      campo.setAttribute('aria-invalid', 'false');
    }
  });

  return valido;
}

/**
 * Cadastra um novo livro ou atualiza um existente.
 */
function salvarLivro() {
  if (!validarCamposObrigatorios()) {
    mostrarFeedback('Preencha os campos obrigatórios corretamente.', 'erro');
    return;
  }

  const nome = nomeInp.value.trim();
  const autor = autorInp.value.trim();
  const ano = Number(anoInp.value.trim());
  const categoria = categoriaSel.value as Categorias;
  const editora = editoraInp.value.trim();

  if (livroEmEdicaoId !== null) {
    // Modo Edição
    const livro = livros.find(l => l.id === livroEmEdicaoId);
    if (livro) {
      livro.titulo = nome;
      livro.autor = autor;
      livro.ano = ano;
      livro.categoria = categoria;
      livro.editora = editora;
      mostrarFeedback('Livro atualizado com sucesso!', 'sucesso');
    }
    livroEmEdicaoId = null;
    btnSubmit.textContent = 'Cadastrar Livro';
    document.getElementById('form-heading')!.textContent = 'Cadastrar Livro';
  } else {
    // Modo Cadastro
    livros.push(new Livro(nome, autor, ano, categoria, editora));
    mostrarFeedback('Livro cadastrado com sucesso!', 'sucesso');
  }

  limparCampos();
  renderizarLista();
}

/**
 * Carrega os dados de um livro para o formulário.
 */
function iniciarEdicao(id: number) {
  const livro = livros.find(l => l.id === id);
  if (!livro) return;

  livroEmEdicaoId = livro.id;
  nomeInp.value = livro.titulo;
  autorInp.value = livro.autor;
  anoInp.value = livro.ano.toString();
  categoriaSel.value = livro.categoria;
  editoraInp.value = livro.editora || '';

  // Resetar validações visuais
  [nomeInp, autorInp, anoInp, categoriaSel].forEach(campo => campo.setAttribute('aria-invalid', 'false'));

  btnSubmit.textContent = 'Salvar Alterações';
  document.getElementById('form-heading')!.textContent = 'Editar Livro';
  nomeInp.focus(); // Move o foco para o primeiro campo para acessibilidade
}

/**
 * Remove um livro da lista.
 */
function excluirLivro(id: number) {
  if (confirm('Tem certeza que deseja excluir este livro?')) {
    livros = livros.filter(l => l.id !== id);
    mostrarFeedback('Livro excluído.', 'sucesso');
    
    // Se o livro sendo editado for excluído, cancela a edição
    if (livroEmEdicaoId === id) {
      limparCampos();
    }
    renderizarLista();
  }
}

/**
 * Limpa os campos do formulário e cancela edição.
 */
function limparCampos() {
  formLivro.reset();
  livroEmEdicaoId = null;
  btnSubmit.textContent = 'Cadastrar Livro';
  document.getElementById('form-heading')!.textContent = 'Cadastrar Livro';
  
  [nomeInp, autorInp, anoInp, categoriaSel].forEach(campo => campo.setAttribute('aria-invalid', 'false'));
}

/**
 * Filtra, ordena e renderiza os livros na tela.
 */
function renderizarLista() {
  const termo = buscaInp.value.toLowerCase().trim();
  const filtro = filtroCategoriaSel.value;
  const ordenacao = ordenacaoSel.value;

  // Filtragem
  let listaFiltrada = livros.filter(l => {
    const matchBusca = l.titulo.toLowerCase().includes(termo) || l.autor.toLowerCase().includes(termo);
    const matchCategoria = filtro === 'Todas' || l.categoria === filtro;
    return matchBusca && matchCategoria;
  });

  // Ordenação
  listaFiltrada.sort((a, b) => {
    if (ordenacao === 'titulo') {
      return a.titulo.localeCompare(b.titulo);
    } else if (ordenacao === 'ano') {
      return a.ano - b.ano;
    }
    // 'id' (ordem de cadastro)
    return a.id - b.id;
  });

  // Renderização
  containerListagem.innerHTML = '';

  if (listaFiltrada.length === 0) {
    containerListagem.innerHTML = `
      <div class="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p class="text-xl font-bold text-gray-700">Nenhum livro encontrado</p>
        <p class="text-base text-gray-500 mt-2">Tente ajustar seus filtros ou cadastre uma nova obra.</p>
      </div>
    `;
    return;
  }

  listaFiltrada.forEach(livro => {
    const div = document.createElement('article');
    div.className = 'bg-white p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all duration-200 hover:shadow-md';
    div.setAttribute('aria-label', `Livro: ${livro.titulo}`);
    
    div.innerHTML = `
      <div class="flex-1">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <h3 class="text-xl font-bold text-gray-900">${livro.titulo}</h3>
          <span class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            ${livro.categoria}
          </span>
        </div>
        <div class="text-gray-600 text-sm space-y-1">
          <p><strong class="font-semibold text-gray-800">Autor:</strong> ${livro.autor}</p>
          <p><strong class="font-semibold text-gray-800">Ano:</strong> ${livro.ano}</p>
          ${livro.editora ? `<p><strong class="font-semibold text-gray-800">Editora:</strong> ${livro.editora}</p>` : ''}
        </div>
      </div>
      
      <div class="flex sm:flex-col gap-2 shrink-0">
        <button type="button" class="btn-editar flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" data-id="${livro.id}" aria-label="Editar livro ${livro.titulo}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Editar
        </button>
        <button type="button" class="btn-excluir flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors" data-id="${livro.id}" aria-label="Excluir livro ${livro.titulo}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Excluir
        </button>
      </div>
    `;

    containerListagem.appendChild(div);
  });
}

/**
 * Exibe um toast de feedback na tela (Acessível)
 */
function mostrarFeedback(mensagem: string, tipo: 'sucesso' | 'erro') {
  feedbackToast.textContent = mensagem;
  
  if (tipo === 'sucesso') {
    feedbackToast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 shadow-lg rounded-full px-6 py-3 font-semibold text-center bg-green-100 text-green-800 border border-green-200';
  } else {
    feedbackToast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 shadow-lg rounded-full px-6 py-3 font-semibold text-center bg-red-100 text-red-800 border border-red-200';
  }

  // Faz o toast aparecer
  requestAnimationFrame(() => {
    feedbackToast.style.opacity = '1';
    feedbackToast.style.transform = 'translate(-50%, 0)';
  });

  // Esconde após 3 segundos
  setTimeout(() => {
    feedbackToast.style.opacity = '0';
    feedbackToast.style.transform = 'translate(-50%, -10px)';
  }, 3000);
}