# 📚 Acervo

Atividade avaliativa individual: página HTML para cadastrar livros, onde cada livro é representado por um objeto da classe `Livro` e armazenado em um array.

## 📋 Enunciado

Crie uma página HTML para cadastrar livros. Cada livro cadastrado deve ser representado por um objeto da classe `Livro` e armazenado em um array. A aplicação deve permitir cadastrar e visualizar os livros cadastrados, com:

- Formulário com título, autor, ano de publicação, categoria (obrigatórios) e editora (opcional)
- Interface `ILivro` e type literal `Categoria`
- Classe `Livro` implementando `ILivro`, com `id` gerado automaticamente
- Array `livros: Livro[]` para armazenamento
- Função `visualizarLivros(livros: Livro[]): void` para exibir a listagem, atualizada a cada novo cadastro

## 🛠️ Tecnologias utilizadas

- HTML5
- TypeScript
- Tailwind CSS
- Concurrently

## ▶️ Como executar

Clone o repositório, entre no diretório da atividade e instale as dependências:

```bash
git clone https://github.com/hugovrp/tsi-pdmsf.git
cd tsi-pdmsf/atv_02-acervo
npm install
```

Inicie o ambiente de desenvolvimento, isso criará o diretório `dist/`, onde ficam os arquivos JavaScript transpilados.

```bash
npm run dev
```

Depois, abra o `index.html` no navegador (recomenda-se usar a extensão **Live Server** do VS Code).