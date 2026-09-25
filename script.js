// ============================================================
// DADOS FICTÍCIOS PADRONIZADOS — 8º ANO
// Este é um array (lista) de objetos. Cada objeto é uma disciplina.
// ============================================================
const disciplinas = [
  { disciplina: "Língua Portuguesa",          tri1: 82,   tri2: "7,8", tri3: 85,   faltas: [2, 1, 1] },
  { disciplina: "Matemática",                 tri1: 52,   tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências",                   tri1: "8,1", tri2: 76,   tri3: 8.0,  faltas: [1, 2, 0] },
  { disciplina: "História",                   tri1: 7.0,  tri2: 84,   tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia",                  tri1: 68,   tri2: 7.3,  tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa",             tri1: 86,   tri2: "8,1", tri3: 8.7,  faltas: [1, 0, 0] },
  { disciplina: "Arte",                       tri1: 9.0,  tri2: 92,   tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física",            tri1: 95,   tri2: 9.0,  tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital",           tri1: 88,   tri2: 9.1,  tri3: 93,   faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira",        tri1: 74,   tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado",           tri1: 8.0,  tri2: 83,   tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura",          tri1: 62,   tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico",          tri1: 48,   tri2: 5.6,  tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento",tri1: "7,7", tri2: 80,   tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais",     tri1: 58,   tri2: "6,2", tri3: 6.4,  faltas: [1, 1, 1] }
];

// Média mínima de referência
const MEDIA_MINIMA = 6.0;

// ============================================================
// FREQUÊNCIA FICTÍCIA (APENAS DEMONSTRATIVA)
// Este valor NÃO é calculado a partir das faltas.
// Serve só para mostrar o card. No futuro será tratado de outra forma.
// ============================================================
const FREQUENCIA_DEMONSTRATIVA = 92;

// ============================================================
// FUNÇÃO: normalizarNota(valor)
// Converte qualquer formato de nota para a escala 0–10.
// Retorna null quando a nota ainda não foi lançada ou é inválida.
// ============================================================
function normalizarNota(valor) {
  // Vazio, null ou undefined = nota ainda não lançada
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for string, troca a vírgula por ponto para poder converter
  let numero = valor;
  if (typeof valor === "string") {
    numero = valor.replace(",", "."); // "8,5" vira "8.5"
  }

  numero = Number(numero); // Converte para número

  // Se não for um número válido, tratamos como inválido (null)
  if (isNaN(numero)) {
    return null;
  }

  // Regras de conversão
  if (numero >= 0 && numero <= 10) {
    return numero;                 // já está na escala
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;            // 82 vira 8.2, 100 vira 10
  }

  // Fora das regras = inválido
  return null;
}

// ============================================================
// FUNÇÃO: calcularMedia(notas)
// Calcula a média usando SOMENTE as notas disponíveis (válidas).
// Nota ausente NUNCA vira zero.
// ============================================================
function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) {
    return null; // nenhuma nota disponível
  }

  const soma = validas.reduce(function (acc, n) {
    return acc + n;
  }, 0);

  return soma / validas.length;
}

// ============================================================
// FUNÇÃO: definirSituacao(media)
// Define o texto da situação com base na média.
// ============================================================
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

// ============================================================
// FUNÇÃO: formatarNota(valor)
// Mostra a nota com uma casa decimal ou "Ainda não lançada".
// ============================================================
function formatarNota(valor) {
  if (valor === null) {
    return "Ainda não lançada";
  }
  return valor.toFixed(1).replace(".", ","); // 8.2 vira "8,2"
}

// ============================================================
// FUNÇÃO: criarCard(titulo, valor)
// Cria um card de resumo no DOM e devolve o elemento pronto.
// ============================================================
function criarCard(titulo, valor) {
  const card = document.createElement("div");
  card.className = "card";

  const h = document.createElement("div");
  h.className = "titulo";
  h.textContent = titulo;

  const v = document.createElement("div");
  v.className = "valor";
  v.textContent = valor;

  card.appendChild(h);
  card.appendChild(v);
  return card;
}

// ============================================================
// FUNÇÃO: preencherTabela()
// Percorre as disciplinas (forEach), calcula tudo e cria as
// linhas da tabela no DOM.
// ============================================================
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");

  // Guardamos alguns totais para os cards de resumo
  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  disciplinas.forEach(function (d) {
    // 1) Normaliza as três notas
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    // 2) Calcula a média com as notas disponíveis
    const media = calcularMedia([n1, n2, n3]);

    // 3) Soma as faltas dos trimestres (array -> soma)
    const faltasDisciplina = d.faltas.reduce(function (acc, f) {
      return acc + f;
    }, 0);
    totalFaltas += faltasDisciplina;

    // 4) Define a situação
    const situacao = definirSituacao(media);

    // 5) Acumula dados para os cards
    if (media !== null) {
      somaMedias += media;
      qtdMedias++;
      if (media >= MEDIA_MINIMA) {
        bomDesempenho++;
      } else {
        atencao++;
      }
    }

    // 6) Cria a linha <tr> e as células <td>
    const linha = document.createElement("tr");
    linha.innerHTML =
      "<td>" + d.disciplina + "</td>" +
      "<td>" + formatarNota(n1) + "</td>" +
      "<td>" + formatarNota(n2) + "</td>" +
      "<td>" + formatarNota(n3) + "</td>" +
      "<td>" + formatarNota(media) + "</td>" +
      "<td>" + faltasDisciplina + "</td>" +
      "<td class='" + classeSituacao(situacao) + "'>" + situacao + "</td>";

    corpo.appendChild(linha);
  });

  // Média geral (só das disciplinas com média válida)
  const mediaGeral = qtdMedias > 0 ? somaMedias / qtdMedias : null;

  return {
    mediaGeral: mediaGeral,
    totalFaltas: totalFaltas,
    bomDesempenho: bomDesempenho,
    atencao: atencao
  };
}

// ============================================================
// FUNÇÃO: classeSituacao(texto)
// Devolve a classe CSS de acordo com a situação.
// ============================================================
function classeSituacao(texto) {
  if (texto === "Bom desempenho") return "situacao-bom";
  if (texto === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

// ============================================================
// FUNÇÃO: preencherCards(resumo)
// Cria os cards de resumo no topo da página.
// ============================================================
function preencherCards(resumo) {
  const container = document.getElementById("cards");

  const mediaGeralTexto = resumo.mediaGeral !== null
    ? resumo.mediaGeral.toFixed(1).replace(".", ",")
    : "—";

  container.appendChild(criarCard("Média geral", mediaGeralTexto));
  container.appendChild(criarCard("Total de faltas", resumo.totalFaltas));
  container.appendChild(criarCard("Bom desempenho", resumo.bomDesempenho + " disciplinas"));
  container.appendChild(criarCard("Precisam de atenção", resumo.atencao + " disciplinas"));
  // Frequência APENAS DEMONSTRATIVA (não é calculada pelas faltas)
  container.appendChild(criarCard("Frequência (demo)", FREQUENCIA_DEMONSTRATIVA + "%"));
}

// ============================================================
// INICIALIZAÇÃO — quando a página carrega, montamos tudo
// ============================================================
function iniciar() {
  const resumo = preencherTabela();   // preenche tabela e calcula totais
  preencherCards(resumo);             // usa os totais para os cards
}

iniciar();