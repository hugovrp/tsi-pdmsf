// --------------------------------------------------------------------------------------------
function flexBoxDesign() {
  const items = document.querySelectorAll('.item');

  items.forEach( (item) => {
    const textContent = item.textContent.trim();
    const bgColor = textContent.startsWith('#') ? `${textContent}` : '#9932cc';

    item.style.backgroundColor = bgColor;
  })
}

// --------------------------------------------------------------------------------------------
function revisaoJS() {
  let alunos = [
    {nome: 'Maria', idade: 25},
    {nome: 'João', idade: 8},
    {nome: 'Paulo', idade: 51},
    {nome: 'Ricardo', idade: 16},
    {nome: 'Margarida', idade: 25},
  ];

  let maisNovo = alunos[0];
  let maisVelho = alunos[0];
  let soma = 0;

  let idades = {};

  console.log('- Alunos maiores de idade:')
  alunos.forEach( (aluno) => {
    if(aluno.idade >= 18) {
      console.log(aluno.nome);
      soma += aluno.idade;
    }

    if(aluno.idade < maisNovo.idade)
      maisNovo = aluno;

    if(aluno.idade > maisVelho.idade)
      maisVelho = aluno;

    if(aluno.idade in idades) 
      idades[aluno.idade] += `, ${aluno.nome}`;
    else {
      idades[aluno.idade] = `${aluno.nome}`;
    }
  })

  console.log(`\n- Aluno mais novo: ${maisNovo.nome} (${maisNovo.idade})`);
  console.log(`- Aluno mais velho: ${maisVelho.nome} (${maisVelho.idade})`);

  console.log(`\n- Soma das idades dos alunos maiores de idade: ${soma} anos`);

  for(const [chave, valor] of Object.entries(idades)) {
    console.log(`Idade (${chave} anos): ${valor}`);
  }
}

// --------------------------------------------------------------------------------------------
function revisaoRequisicao() {
  const btn1 = document.querySelector('#btn1');
  const input_cep = document.querySelector('#input_cep');

  btn1.addEventListener('click', buscarDados);

  async function buscarDados() {
    const cep = input_cep.value;
    const URL = `https://viacep.com.br/ws/${cep}/json/`;
    
    fetch(URL)
      .then(response => {
        if(!response.ok) 
          throw new Error(`Erro: ${response.status}`);
        
        return response.json();
      })
      .then(data => {
        console.log(`Endereço: ${data.logradouro}, Bairro ${data.bairro}, ${data.estado} - ${data.uf}`);
      })
      .catch(error => {
        console.error('Erro: ', error);
      })
  }
}

// --------------------------------------------------------------------------------------------
flexBoxDesign();
revisaoJS();
revisaoRequisicao();