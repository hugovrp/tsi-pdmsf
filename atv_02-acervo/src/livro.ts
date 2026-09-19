export type Categorias = 'Tecnologia' | 'Finanças' | 'Literatura' | 'Outros';

interface ILivro {
  readonly id: number;
  titulo: string;
  autor: string;
  ano: number;
  categoria: Categorias;
  editora?: string;
}

export class Livro implements ILivro {
  readonly id: number;
  titulo: string;
  autor: string;
  ano: number;
  categoria: Categorias;
  editora?: string;

  static geraID: number = 0;

  constructor(titulo: string, autor: string, ano: number, categoria: Categorias, editora?: string) {
    this.id = Livro.geraID++;
    this.titulo = titulo;
    this.autor = autor;
    this.ano = ano;
    this.categoria = categoria;
    this.editora = editora;
  }
}