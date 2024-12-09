async function get() {
  const response = await fetch('https://api-1-gscb.onrender.com/usuarios');
  if (!response.ok) {
    throw new Error('Erro ao obter os dados');
  }
  const dados = await response.json();
  return dados;
}

let index;
let radiovalue;

function radio() {
  const radios = document.querySelectorAll('input[name="option"]');
  radios.forEach((radio) => {
    radio.addEventListener('change', function() {
      radiovalue = this.value;
    })
  });
}

function verificardados() {
  const descriptionvalue = document.getElementById('description').value;
  const valorvalue = parseFloat(document.getElementById('value').value);
  const datavalue = document.getElementById('date').value;

  let dados = {
    description: "",
    valor: 0,
    data: datavalue
  };

  if (typeof descriptionvalue === "string" && 
    descriptionvalue.trim() !== "" && 
    isNaN(descriptionvalue)) {
    dados.description = descriptionvalue;
  } else {
    window.alert("Insira uma descrição válida (não pode ser vazia nem conter números)!");
    return;
  }

  if(valorvalue > 0){
    dados.valor = valorvalue;
  } else{
    window.alert('Insira um valor válido!');
    return;
  }
  return dados;
}

async function adctransaction() {
  const transacoest = [];
  const dados = verificardados();

  let transaction = {
    transacaoId: crypto.randomUUID(),
    tipo: '',
    total: 0,
    receita: 0,
    despesa: 0,
    categoria: "",
    tipo: '',
    descricao: dados.description,
    valor: 0,
    data: dados.data
  };

  let verificador = false

  let total = 0;
  if (radiovalue === 'entrada') {
    total += dados.valor;
    transaction.total = total;
    transaction.receita = dados.valor;
    transaction.tipo = 'Entrada';
    transaction.categoria = 'Receita'
    verificador = true
  } else if (radiovalue === 'saida') {
    total -= dados.valor;
    transaction.total = total;
    transaction.despesa = dados.valor;
    transaction.tipo = 'Saída';
    transaction.categoria = 'Despesa'
    verificador = true
  }
  if(verificador){
    transacoest.push(transaction);
    await chamarfunc(transacoest)
  } else {
    window.alert("Selecione um tipo")
    return;
  }
  

}

async function chamarfunc(transacoest) {
  await edit(transacoest);
  await atualizartabela(); 
  await historico(); 
  await dadosretornados();
  await retornarids(transacoest);
  console.log(transacoest)
  
}


async function retornarids(transacoest) {
  const id = await dadosretornados(); 

  if (typeof transacoest === 'number' && transacoest >= 0 && transacoest < id.lista.length) {
    const transacaoId = id.lista[transacoest].transacaoId;
    console.log(`Excluindo transação com ID: ${transacaoId}`);
    await deleteTransacao(id.ids, transacaoId);
  } else {
    console.warn(`Índice ${transacoest} não encontrado em id.lista.`);
  }
}

let contador = 0;
async function edit(transacoest) {
  const id = await dadosretornados();
  const idf = id.ids;
  contador += 1;

  const response = await fetch(`https://api-1-gscb.onrender.com/usuarios/${idf}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transacoest })
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar as transações no servidor');
  }
  return response.json(); 
}

async function editartransacao(novaTransacao){
  const id = await dadosretornados();
  const transacaoId = id.lista[index].transacaoId;
  const userId = id.ids;

  const response = await fetch(`https://api-1-gscb.onrender.com/usuarios/${userId}/${transacaoId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      novaTransacao: novaTransacao,  
    }),
  });

  if(!response.ok){
    throw new Error('Erro ao editar a transação');
  }
 await historico()
 await atualizartabela()
}

async function adcdiv(i) {
  const tr = document.getElementById('tbody');
  const div1 = document.querySelector('.tr1');
  
  div1.style.display = 'none';

  let divedittransacao = `
                        <td class="tr2" id="tipoh"><input id="tipo" type="text" placeholder="Digite o novo Tipo (Entrada) ou (Saída)"></td>                 
                        <td id="desch"><input id="desc" type="text" placeholder="Digite uma nova descrição"></td>                   
                        <td id="categh"><input id="cate" type="text" placeholder="Digite uma nova categoria"></td>                     
                        <td id="valorh"><input id="valor" type="number" placeholder="Digite um novo valor"></td>               
                        <td id="datah"><input id="data" type="date" value="2013-02-21" required placeholder="Digite uma nova data"></td>
                        <div>
                            <button onclick="concluir()">Concluir</button>
                        </div>
`;

  
  tr.innerHTML = divedittransacao;

  const div2 = document.querySelector('.tr2');
  div2.style.display = 'flex';
  index = i;
  
}

async function concluir() {
  const tipo = document.getElementById('tipo').value.toLowerCase();
  const desc = document.getElementById('desc').value;
  const cate = document.getElementById('cate').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const data = document.getElementById('data').value;

  let novaTransacao = {
    transacaoId: crypto.randomUUID(),
    tipo: tipo,
    total: valor,
    receita: "",
    despesa: "",
    categoria: cate,
    descricao: desc,
    valor: valor,
    data: data
  };

  const verificador = verificar(tipo, desc, cate, valor)

  let total = 0;
  if (tipo === 'entrada') {
    total += valor;
    novaTransacao.total = total;
    novaTransacao.receita = valor;
    novaTransacao.tipo = 'Entrada';
    novaTransacao.categoria= 'Receita'
  } else if (tipo === 'saida') {
    total -= valor;
    novaTransacao.total = total;
    novaTransacao.despesa = valor;
    novaTransacao.tipo = 'Saída';
    novaTransacao.categoria = 'Despesa'
  }

  if(verificador){
    await editartransacao(novaTransacao)
  }

  
}
function verificar(tipo, desc, cate, valor) {

  let verificador = false;

  // Verificar se o comprimento de algum dos parâmetros excede 23
  if (desc.length > 23 || cate.length > 23 || valor.length > 23) {
      window.alert("Número máximo de caracteres excedido!");
  } else {
      verificador = true;
  }
  if(tipo === 'entrada' || tipo === "saida"){
    verificador = true
  } else {
    window.alert("Insira um tipo válido!")
    verificador = false
  }
  console.log(cate, desc, valor)

  return verificador;
}

async function dadosretornados() {
  const dados = await get();
  const ids = localStorage.getItem('id');
  let index;
  for (let i = 0; i < dados.length; i++) {
    if (dados[i].id === ids) {
      index = i;
      break; 
    }
    
  }
  
  const nome = document.getElementById("nome")
  nome.innerHTML = dados[index].conta.nome
  const lista = dados[index].transacoes;
  return { lista: lista, ids: ids };
}

async function deleteTransacao(userId, transacaoId) {
  try {
    const response = await fetch(`https://api-1-gscb.onrender.com/usuarios/${userId}`, {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          transacaoid: transacaoId, 
      }),
    });

    if (response.ok) {
        console.log('Transação excluída com sucesso!');
    } else {
        const errorData = await response.json();
        console.error('Erro ao deletar a transação:', errorData.error);
    }
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
  }
  await atualizartabela();
  await historico();
}

async function atualizartabela() {
  const lista = await dadosretornados();
  const transacoesfinais = lista.lista; 
  const valorreceita = document.getElementById('valorreceita');
  const valordespesa = document.getElementById('valordespesa');
  const valorfinal = document.getElementById('valorfinal');
  let final = 0;
  let receitas = 0;
  let despesas = 0;

  transacoesfinais.map((item) => {
    receitas += parseFloat(item.receita || 0);
    despesas += parseFloat(item.despesa || 0);
    total = parseFloat(item.total);
  });

  final = receitas - despesas;
  valorreceita.innerHTML = receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  valordespesa.innerHTML = despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  valorfinal.innerHTML = final.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  grafics(receitas, despesas); 
}

async function historico() {
  let data = new Date();
  let ano = data.getFullYear();
  let mes = String(data.getMonth() + 1).padStart(2, '0'); 
  let dia = String(data.getDate()).padStart(2, '0'); 

  let dataformatada = `${ano}-${mes}-${dia}`;
  document.getElementById('date').value = dataformatada;

  const lista = await dadosretornados();
  const transacoesfinais = lista.lista; 
  contarTransacoesPorMes();
  const tr = document.getElementById('tbody');
  let div = '';

  for (let i = 0; i < transacoesfinais.length; i++) {
    let valor = parseFloat(transacoesfinais[i].valor);
    if (isNaN(valor)) {
      valor = 0;
    }
    div += ` 
      <tr class="tr1">               
        <td id="tipoh">${transacoesfinais[i].tipo}</td>                 
        <td id="desch">${transacoesfinais[i].descricao}</td>                   
        <td id="categh">${transacoesfinais[i].categoria}</td>                     
        <td id="valorh">${transacoesfinais[i].total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>               
        <td id="data" class="income">${transacoesfinais[i].data} </td>
        <td> <button id="lixeira" onclick="retornarids(${i})" class="fa-solid fa-trash"></button><button id="edit" class="fa-solid fa-pen" onclick="adcdiv(${i})"></button></td>
            
       
      </tr>`;
  }

  tr.innerHTML = div;
}

document.addEventListener('DOMContentLoaded', async () => {
  radio();
  await atualizartabela();
  await historico();
  await dadosretornados();
  await get();
});

async function contarTransacoesPorMes() {
  const lista = await dadosretornados();
  const transacoesfinais = lista.lista;
  const resumoPorMes = new Array(12).fill(0);  

  transacoesfinais.forEach((transacao) => {
    const data = new Date(transacao.data); 
    const mes = data.getMonth(); 
    let valor = 0;

    if (transacao.receita > 0) {
      valor += transacao.receita;
    } else {
      valor -= transacao.despesa;
    }

    resumoPorMes[mes] += parseFloat(valor);  
  });
  return resumoPorMes;
}
// Selecionando os elementos
// Selecionando os elementos
const menuHamburguer = document.querySelector(".menu-hamburguer");
const nav = document.querySelector("nav");
const menuLinks = document.querySelectorAll("nav a"); 
const fechar = document.querySelector('.close-btn');

// Função para abrir/fechar o menu ao clicar no ícone de hambúrguer
menuHamburguer.addEventListener("click", () => {
    nav.classList.toggle("active");  // Adiciona ou remove a classe 'active' para abrir/fechar o menu
});

// Fechar o menu ao clicar no botão "X"
fechar.addEventListener('click', () => {
    nav.classList.remove("active");  // Remove a classe 'active' para fechar o menu
});

// Fechar o menu quando um link for clicado
menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        nav.classList.remove("active");  // Remove a classe 'active' quando qualquer link for clicado
    });
});

document.addEventListener('DOMContentLoaded', async () => {
  radio()
  await atualizartabela();
  await historico();
  await dadosretornados();
  await get()
  

});

const ctx = document.getElementById('myChart')
const evo = document.getElementById('evo')

let pieChart = null;  
let lineChart = null;

async function grafics(receitas, despesas) {

  if (pieChart) {
    pieChart.destroy(); 
  }

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Despesas', 'Receitas'],
      datasets: [{
        label: 'Distribuição',
        data: [despesas, receitas], 
        backgroundColor: [
          'rgb(255, 99, 132)', 
          'rgb(54, 162, 235)' 
        ],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return tooltipItem.label + ': ' + tooltipItem.raw + ' unidades';
            }
          }
        }
      }
    }
  });


  if (lineChart) {
    lineChart.destroy(); 
  }
  let resumomes = await  contarTransacoesPorMes()
  lineChart = new Chart(evo, {
    type: 'line',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'], // Labels para os meses
      datasets: [{
        label: 'Evolução de Receitas e Despesas',
        data: resumomes, 
        fill:false,
        backgroundColor: [
          'rgb(75, 192, 192)'
        ],
        tension: 0.1,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true 
        }
      }
    }
  });
}
