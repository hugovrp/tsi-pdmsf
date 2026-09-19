import { Categorias, Livro } from "./livro.js";

const nomeInp = document.getElementById('nome') as HTMLInputElement;
const autorInp = document.getElementById('autor') as HTMLInputElement;
const anoInp = document.getElementById('ano') as HTMLInputElement;
const editoraInp = document.getElementById('editora') as HTMLInputElement;
const categoriaSel = document.getElementById('categoria') as HTMLSelectElement;
const btnCadastro = document.getElementById('btn-cadastro');

const containerListagem = document.getElementById('list-cont') as HTMLDivElement;

const livros: Livro[] = [];

/**
 * Valida os campos e, se estiverem corretos, cria um novo livro e atualiza a listagem na tela.
 */
btnCadastro?.addEventListener('click', () => {
  let camposPreenchidos = validarCamposObrigatorios();

  if(camposPreenchidos) {
    livros.push(new Livro(nomeInp.value.trim(), autorInp.value.trim(), Number(anoInp.value.trim()), categoriaSel.value as Categorias, editoraInp.value.trim()));

    visualizarLivros(livros);
    limparCampos();
  }
  else {
    console.log('ERRO: Não foi possível cadastrar o livro!');
  }
})

/**
 *  Recria a lista de livros na tela.
 * 
 *  @param livros - Array de livros a serem exibidos
 */
function visualizarLivros(livros: Livro[]): void {
  containerListagem.innerHTML = '';

  livros.forEach( (livro) => {
    const novoLivro = document.createElement('div');

    novoLivro.className = '';
    novoLivro.innerHTML = `
      <p class="inline-flex items-center gap-2 text-[18px]">
        <span class="font-bold">${livro.id}.</span>
        ${livro.titulo}
      </p>
      <p><span class="font-bold">Categoria: </span>${livro.categoria}</p>
      <p><span class="font-bold">Publicado em: </span>${livro.ano}</p>
    `;
    if(livro.editora) {
      novoLivro.innerHTML += `
        <p><span class="font-bold">Editora: </span>${livro.editora}</p>
      `;
    }

    containerListagem.appendChild(novoLivro);
  })
}

/**
 *  Verifica se os campos obrigatórios do cadastro foram preenchidos e se o ano contém apenas números.
 * 
 *  @returns `true` se todos os campos obrigatórios são válidos, `false` caso contrário
 */
function validarCamposObrigatorios(): boolean {
  const camposObrigatorios = [nomeInp, autorInp, anoInp, categoriaSel];
  let todosPreenchidos = true;

  camposObrigatorios.forEach( (campo, i) => {
    if(!campo.value.trim()) {
      todosPreenchidos = false;
      marcarErro(campo, 'Este campo não pode estar vazio.');
    }
    else {
      limparErro(campo);
    }
  });

  if(anoInp.value.trim() && !/^\d+$/.test(anoInp.value.trim())) {
    todosPreenchidos = false;
    marcarErro(anoInp, 'O ano deve conter apenas números.');
  }

  return todosPreenchidos;
}

/**
 *  Aplica a borda vermelha no campos e insere/atualiza uma mensagem de erro logo abaixo dele.
 * 
 *  @param campo - Elemento que está inválido
 *  @param mensagem - Mensagem de erro a ser exibida para o usuário
 */
function marcarErro(campo: HTMLElement, mensagem: string): void {
  campo.classList.add('border-red-500', 'focus:ring-red-500/20');

  let erroEl = campo.nextElementSibling as HTMLElement | null;
  if(!erroEl || !erroEl.classList.contains('erro-msg')) {
    erroEl = document.createElement('p');
    erroEl.className = 'erro-msg text-red-500 text-sm mb-2';
    campo.insertAdjacentElement('afterend', erroEl);
  }
  erroEl.textContent = mensagem;
}

/**
 *  Remove a borda vermelhas e a mensagem de erro associada a um campo.
 */
function limparErro(campo: HTMLElement): void {
  campo.classList.remove('border-red-500', 'focus:ring-red-500/20');

  const erroEl = campo.nextElementSibling as HTMLElement | null;
  if(erroEl && erroEl.classList.contains('erro-msg')) {
    erroEl.remove();
  }
}

/**
 *  Reseta os valores de todos os campos do formulário e limpa eventuais erros.
 */
function limparCampos(): void {
  const campos = [nomeInp, autorInp, anoInp, categoriaSel, editoraInp];
  campos.forEach( (campo) => {
    campo.value = '';
  })
}