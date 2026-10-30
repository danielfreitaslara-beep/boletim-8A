// ============================================================
// CONFIGURAÇÃO FIXA DO ALUNO — 8º ANO / TURMA 8A / Nº 35
// ============================================================
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 35,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// ============================================================
// DADOS FICTÍCIOS PADRONIZADOS — 8º ANO
// ============================================================
const disciplinasLocais = [
  { disciplina: "Língua Portuguesa",           tri1: 82,    tri2: "7,8", tri3: 85,   faltas: [2, 1, 1] },
  { disciplina: "Matemática",                  tri1: 52,    tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências",                    tri1: "8,1", tri2: 76,    tri3: 8.0,  faltas: [1, 2, 0] },
  { disciplina: "História",                    tri1: 7.0,   tri2: 84,    tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia",                   tri1: 68,    tri2: 7.3,   tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa",              tri1: 86,    tri2: "8,1", tri3: 8.7,  faltas: [1, 0, 0] },
  { disciplina: "Arte",                        tri1: 9.0,   tri2: 92,    tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física",             tri1: 95,    tri2: 9.0,   tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital",            tri1: 88,    tri2: 9.1,   tri3: 93,   faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira",         tri1: 74,    tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado",            tri1: 8.0,   tri2: 83,    tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura",           tri1: 62,    tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico",           tri1: 48,    tri2: 5.6,   tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80,    tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais",      tri1: 58,    tri2: "6,2", tri3: 6.4,  faltas: [1, 1, 1] }
];

// Média mínima de referência
const MEDIA_MINIMA = 6.0;

// ============================================================
// FREQUÊNCIA FICTÍCIA (APENAS DEMONSTRATIVA)
// ============================================================
const FREQUENCIA_DEMONSTRATIVA = 92;

// ============================================================
// ESTADO EM MEMÓRIA
// ============================================================
let pinDaSessao = null;
let dadosAtuais = null;
let modoEdicao = false;

// ============================================================
// ESTADO DOS GRÁFICOS (somente leitura sobre dadosAtuais)
// ============================================================
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// Referência interna de risco (NÃO exibir na interface)
const REFERENCIA_INTERNA_FALTAS = 350;
const LIMITE_CRITICO_FALTAS = REFERENCIA_INTERNA_FALTAS * 0.9;

// Paleta dos gráficos (mesma identidade visual do projeto)
const CORES_GRAFICOS = {
  ciano: "#00d4ff",
  cianoSuave: "rgba(0, 212, 255, 0.35)",
  verde: "#22c55e",
  laranja: "#f59e0b",
  vermelho: "#f87171",
  cinza: "#94a3b8",
  grade: "rgba(148, 163, 184, 0.15)",
  texto: "#e2e8f0",
  fundo: "#0f172a"
};

// ============================================================
// FUNÇÃO: normalizarNota(valor)
// ============================================================
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numero = valor;
  if (typeof valor === "string") {
    numero = valor.replace(",", ".");
  }

  numero = Number(numero);

  if (isNaN(numero)) {
    return null;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

// ============================================================
// FUNÇÃO: calcularMedia(notas)
// ============================================================
function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) {
    return null;
  }

  const soma = validas.reduce(function (acc, n) {
    return acc + n;
  }, 0);

  return soma / validas.length;
}

// ============================================================
// FUNÇÃO: definirSituacao(media)
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
// ============================================================
function formatarNota(valor) {
  if (valor === null) {
    return "Ainda não lançada";
  }
  return valor.toFixed(1).replace(".", ",");
}

// ============================================================
// FUNÇÃO: criarCard(titulo, valor)
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
// FUNÇÃO: classeSituacao(texto)
// ============================================================
function classeSituacao(texto) {
  if (texto === "Bom desempenho") return "situacao-bom";
  if (texto === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

// ============================================================
// FUNÇÃO: somarFaltas(faltas)
// ============================================================
function somarFaltas(faltas) {
  if (!Array.isArray(faltas)) return 0;
  return faltas.reduce(function (acc, f) {
    const n = Number(f);
    return acc + (isNaN(n) ? 0 : n);
  }, 0);
}

// ============================================================
// FUNÇÃO: preencherTabela()
// ============================================================
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");
  corpo.innerHTML = "";

  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  dadosAtuais.forEach(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    const media = calcularMedia([n1, n2, n3]);

    const faltasDisciplina = somarFaltas(d.faltas);
    totalFaltas += faltasDisciplina;

    const situacao = definirSituacao(media);

    if (media !== null) {
      somaMedias += media;
      qtdMedias++;
      if (media >= MEDIA_MINIMA) {
        bomDesempenho++;
      } else {
        atencao++;
      }
    }

    const linha = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = d.disciplina;
    linha.appendChild(tdNome);

    const colunas = [
      { campo: "tri1", trimestreFalta: 0 },
      { campo: "tri2", trimestreFalta: 1 },
      { campo: "tri3", trimestreFalta: 2 }
    ];

    colunas.forEach(function (col) {
      const tdNota = document.createElement("td");
      if (modoEdicao) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "campo-edicao";
        input.dataset.campo = col.campo;
        input.dataset.trimestre = String(col.trimestreFalta);
        const valorOriginal = d[col.campo];
        input.value = valorOriginal === null || valorOriginal === undefined ? "" : formatarNotaNormalizado(valorOriginal);
        input.setAttribute("aria-label", "Nota " + col.campo + " de " + d.disciplina);
        tdNota.appendChild(input);
      } else {
        tdNota.textContent = formatarNota(n1 && col.campo === "tri1" ? n1 : (col.campo === "tri2" ? n2 : n3));
      }
      linha.appendChild(tdNota);
    });

    const tdMedia = document.createElement("td");
    tdMedia.textContent = formatarNota(media);
    linha.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    if (modoEdicao) {
      const faltasArray = Array.isArray(d.faltas) ? d.faltas : [0, 0, 0];
      const wrapper = document.createElement("div");
      wrapper.className = "faltas-edicao";
      wrapper.style.display = "flex";
      wrapper.style.gap = "4px";
      for (let i = 0; i < 3; i++) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "campo-edicao";
        inp.dataset.campo = "falta";
        inp.dataset.trimestre = String(i);
        inp.value = faltasArray[i] === null || faltasArray[i] === undefined ? "" : String(faltasArray[i]);
        inp.style.width = "42px";
        inp.setAttribute("aria-label", "Faltas " + (i + 1) + "º tri de " + d.disciplina);
        wrapper.appendChild(inp);
      }
      tdFaltas.appendChild(wrapper);
    } else {
      tdFaltas.textContent = String(faltasDisciplina);
    }
    linha.appendChild(tdFaltas);

    const tdSituacao = document.createElement("td");
    tdSituacao.className = classeSituacao(situacao);
    tdSituacao.textContent = situacao;
    linha.appendChild(tdSituacao);

    corpo.appendChild(linha);
  });

  const mediaGeral = qtdMedias > 0 ? somaMedias / qtdMedias : null;

  return {
    mediaGeral: mediaGeral,
    totalFaltas: totalFaltas,
    bomDesempenho: bomDesempenho,
    atencao: atencao
  };
}

// ============================================================
// FUNÇÃO: formatarNotaNormalizado(valor)
// ============================================================
function formatarNotaNormalizado(valor) {
  const n = normalizarNota(valor);
  if (n === null) return "";
  return String(n).replace(".", ",");
}

// ============================================================
// FUNÇÃO: preencherCards(resumo)
// ============================================================
function preencherCards(resumo) {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  const mediaGeralTexto = resumo.mediaGeral !== null
    ? resumo.mediaGeral.toFixed(1).replace(".", ",")
    : "—";

  container.appendChild(criarCard("Média geral", mediaGeralTexto));
  container.appendChild(criarCard("Total de faltas", String(resumo.totalFaltas)));
  container.appendChild(criarCard("Bom desempenho", resumo.bomDesempenho + " disciplinas"));
  container.appendChild(criarCard("Precisam de atenção", resumo.atencao + " disciplinas"));
  container.appendChild(criarCard("Frequência (demo)", FREQUENCIA_DEMONSTRATIVA + "%"));
}

// ============================================================
// FUNÇÃO: renderizar()
// Atualiza tabela e cards. Em seguida, atualiza os gráficos.
// (Única adição: chamada de atualizarGraficos ao final)
// ============================================================
function renderizar() {
  const resumo = preencherTabela();
  preencherCards(resumo);
  atualizarGraficos();
}

// ============================================================
// FUNÇÃO: clonarDados(dados)
// ============================================================
function clonarDados(dados) {
  return dados.map(function (d) {
    return {
      disciplina: d.disciplina,
      tri1: d.tri1,
      tri2: d.tri2,
      tri3: d.tri3,
      faltas: Array.isArray(d.faltas) ? d.faltas.slice() : [0, 0, 0]
    };
  });
}

// ============================================================
// FUNÇÃO: definirStatusAcesso(texto, tipo)
// ============================================================
function definirStatusAcesso(texto, tipo) {
  const el = document.getElementById("acesso-status");
  el.textContent = texto || "";
  el.className = "acesso-status" + (tipo ? " " + tipo : "");
}

// ============================================================
// FUNÇÃO: definirStatusEdicao(texto, tipo)
// ============================================================
function definirStatusEdicao(texto, tipo) {
  const el = document.getElementById("edicao-status");
  el.textContent = texto || "";
  el.className = "edicao-status" + (tipo ? " " + tipo : "");
}

// ============================================================
// FUNÇÃO: mostrarBoletim()
// ============================================================
function mostrarBoletim() {
  document.getElementById("acesso").classList.add("oculto");
  document.getElementById("area-boletim").classList.remove("oculto");
}

// ============================================================
// FUNÇÃO: entrar()
// ============================================================
async function entrar() {
  const campoPin = document.getElementById("campo-pin");
  const botao = document.getElementById("botao-entrar");
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    definirStatusAcesso("Digite o PIN para entrar.", "erro");
    return;
  }

  botao.disabled = true;
  definirStatusAcesso("Conectando...", "");

  try {
    const resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    campoPin.value = "";

    if (resposta.status === 401) {
      definirStatusAcesso("Turma, chamada ou PIN inválidos.", "erro");
      botao.disabled = false;
      return;
    }
    if (resposta.status === 429) {
      definirStatusAcesso("Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
      botao.disabled = false;
      return;
    }
    if (!resposta.ok) {
      definirStatusAcesso("Não foi possível conectar ao servidor. Tente novamente.", "erro");
      botao.disabled = false;
      return;
    }

    const json = await resposta.json();

    pinDaSessao = pinDigitado;

    if (json && json.dados && Array.isArray(json.dados.disciplinas)) {
      dadosAtuais = clonarDados(json.dados.disciplinas);
    } else {
      dadosAtuais = clonarDados(disciplinasLocais);
    }

    modoEdicao = false;
    definirStatusEdicao("", "");
    document.getElementById("botao-alterar").classList.remove("oculto");
    document.getElementById("botao-salvar").classList.add("oculto");

    renderizar();
    mostrarBoletim();
    definirStatusAcesso("", "");
    botao.disabled = false;
  } catch (erro) {
    campoPin.value = "";
    definirStatusAcesso("Não foi possível conectar ao servidor. Tente novamente.", "erro");
    botao.disabled = false;
  }
}

// ============================================================
// FUNÇÃO: alternarEdicao()
// ============================================================
function alternarEdicao() {
  if (!modoEdicao) {
    modoEdicao = true;
    definirStatusEdicao("Edite as notas e as faltas e clique em Salvar alterações.", "");
    document.getElementById("botao-alterar").classList.add("oculto");
    document.getElementById("botao-salvar").classList.remove("oculto");
  } else {
    modoEdicao = false;
    document.getElementById("botao-salvar").classList.add("oculto");
    document.getElementById("botao-alterar").classList.remove("oculto");
  }
  renderizar();
}

// ============================================================
// FUNÇÃO: validarNotaEdicao(texto)
// ============================================================
function validarNotaEdicao(texto) {
  const t = (texto === null || texto === undefined) ? "" : String(texto).trim();
  if (t === "") {
    return { ok: true, valor: null };
  }
  if (!/^\d+([.,]\d+)?$/.test(t)) {
    return { ok: false };
  }
  const numero = Number(t.replace(",", "."));
  if (isNaN(numero) || numero < 0 || numero > 10) {
    return { ok: false };
  }
  return { ok: true, valor: numero };
}

// ============================================================
// FUNÇÃO: validarFaltaEdicao(texto)
// ============================================================
function validarFaltaEdicao(texto) {
  const t = (texto === null || texto === undefined) ? "" : String(texto).trim();
  if (t === "") {
    return { ok: false };
  }
  if (!/^\d+$/.test(t)) {
    return { ok: false };
  }
  const numero = Number(t);
  if (isNaN(numero) || numero < 0 || !Number.isInteger(numero)) {
    return { ok: false };
  }
  return { ok: true, valor: numero };
}

// ============================================================
// FUNÇÃO: coletarEdicao()
// ============================================================
function coletarEdicao() {
  const corpo = document.getElementById("corpo-tabela");
  const linhas = corpo.querySelectorAll("tr");
  const resultado = [];
  let tudoValido = true;

  corpo.querySelectorAll(".campo-edicao").forEach(function (el) {
    el.classList.remove("invalido");
  });

  linhas.forEach(function (linha, indice) {
    const original = dadosAtuais[indice];
    const novo = {
      disciplina: original.disciplina,
      tri1: null,
      tri2: null,
      tri3: null,
      faltas: [0, 0, 0]
    };

    linha.querySelectorAll('input[data-campo="tri1"], input[data-campo="tri2"], input[data-campo="tri3"]').forEach(function (input) {
      const campo = input.dataset.campo;
      const v = validarNotaEdicao(input.value);
      if (!v.ok) {
        input.classList.add("invalido");
        tudoValido = false;
        return;
      }
      novo[campo] = v.valor;
    });

    linha.querySelectorAll('input[data-campo="falta"]').forEach(function (input) {
      const idx = Number(input.dataset.trimestre);
      const v = validarFaltaEdicao(input.value);
      if (!v.ok) {
        input.classList.add("invalido");
        tudoValido = false;
        return;
      }
      if (idx >= 0 && idx <= 2) {
        novo.faltas[idx] = v.valor;
      }
    });

    resultado.push(novo);
  });

  if (!tudoValido) {
    return null;
  }
  return resultado;
}

// ============================================================
// FUNÇÃO: salvar()
// ============================================================
async function salvar() {
  if (!pinDaSessao) {
    definirStatusEdicao("Sessão expirada. Entre novamente com o PIN.", "erro");
    return;
  }

  const novosDados = coletarEdicao();
  if (novosDados === null) {
    definirStatusEdicao("Há campos inválidos. Corrija os destaques em vermelho.", "erro");
    return;
  }

  const botao = document.getElementById("botao-salvar");
  botao.disabled = true;
  definirStatusEdicao("Salvando...", "");

  try {
    const resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDaSessao,
        dados: { disciplinas: novosDados }
      })
    });

    if (resposta.status === 401) {
      definirStatusEdicao("Sessão inválida. Entre novamente com o PIN.", "erro");
      botao.disabled = false;
      return;
    }
    if (resposta.status === 429) {
      definirStatusEdicao("Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
      botao.disabled = false;
      return;
    }
    if (!resposta.ok) {
      definirStatusEdicao("Não foi possível salvar. Tente novamente.", "erro");
      botao.disabled = false;
      return;
    }

    dadosAtuais = novosDados;
    modoEdicao = false;
    document.getElementById("botao-salvar").classList.add("oculto");
    document.getElementById("botao-alterar").classList.remove("oculto");
    definirStatusEdicao("Dados salvos com sucesso.", "sucesso");
    renderizar();
    botao.disabled = false;
  } catch (erro) {
    definirStatusEdicao("Não foi possível conectar ao servidor. Tente novamente.", "erro");
    botao.disabled = false;
  }
}

// ============================================================
// ===== CAMADA DE GRÁFICOS (SOMENTE LEITURA) =====
// Todas as funções abaixo apenas LEEM dadosAtuais e chamam as
// funções de cálculo já existentes. Nenhuma escrita no estado.
// ============================================================

function opcoesEixosEscuros(eixoY, eixoX) {
  return {
    y: Object.assign({
      beginAtZero: true,
      ticks: { color: CORES_GRAFICOS.cinza },
      grid: { color: CORES_GRAFICOS.grade }
    }, eixoY || {}),
    x: Object.assign({
      ticks: { color: CORES_GRAFICOS.cinza },
      grid: { color: CORES_GRAFICOS.grade }
    }, eixoX || {})
  };
}

// ------------------------------------------------------------
// GRÁFICO 1 — MÉDIA POR DISCIPLINA (barras horizontais, 0–10)
// ------------------------------------------------------------
function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas || !dadosAtuais) return;

  if (graficoMedias) {
    graficoMedias.destroy();
    graficoMedias = null;
  }

  const copia = dadosAtuais.map(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);
    const media = calcularMedia([n1, n2, n3]);
    return { disciplina: d.disciplina, media: media };
  });

  const labels = copia.map(function (d) { return d.disciplina; });
  const valores = copia.map(function (d) { return d.media; });

  graficoMedias = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Média",
        data: valores,
        backgroundColor: CORES_GRAFICOS.cianoSuave,
        borderColor: CORES_GRAFICOS.ciano,
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.9
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: CORES_GRAFICOS.fundo,
          titleColor: CORES_GRAFICOS.ciano,
          bodyColor: CORES_GRAFICOS.texto,
          borderColor: CORES_GRAFICOS.ciano,
          borderWidth: 1,
          callbacks: {
            label: function (ctx) {
              const v = ctx.parsed.x;
              if (v === null || v === undefined) return "Sem nota";
              return v.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: opcoesEixosEscuros(
        {
          beginAtZero: true,
          min: 0,
          max: 10,
          ticks: { color: CORES_GRAFICOS.cinza, stepSize: 2 }
        },
        {
          ticks: { color: CORES_GRAFICOS.cinza, autoSkip: false }
        }
      )
    }
  });
}

// ------------------------------------------------------------
// GRÁFICO 2 — EVOLUÇÃO DA MÉDIA GERAL (linha, 0–10)
// ------------------------------------------------------------
function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas || !dadosAtuais) return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
    graficoEvolucao = null;
  }

  const notasTri1 = [];
  const notasTri2 = [];
  const notasTri3 = [];

  dadosAtuais.forEach(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);
    if (n1 !== null) notasTri1.push(n1);
    if (n2 !== null) notasTri2.push(n2);
    if (n3 !== null) notasTri3.push(n3);
  });

  const medias = [
    calcularMedia(notasTri1),
    calcularMedia(notasTri2),
    calcularMedia(notasTri3)
  ];

  graficoEvolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média geral",
        data: medias,
        borderColor: CORES_GRAFICOS.ciano,
        backgroundColor: CORES_GRAFICOS.cianoSuave,
        pointBackgroundColor: CORES_GRAFICOS.ciano,
        pointBorderColor: CORES_GRAFICOS.fundo,
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.3,
        spanGaps: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: CORES_GRAFICOS.fundo,
          titleColor: CORES_GRAFICOS.ciano,
          bodyColor: CORES_GRAFICOS.texto,
          borderColor: CORES_GRAFICOS.ciano,
          borderWidth: 1,
          callbacks: {
            label: function (ctx) {
              const v = ctx.parsed.y;
              if (v === null || v === undefined) return "Sem notas";
              return v.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: opcoesEixosEscuros({
        beginAtZero: true,
        min: 0,
        max: 10,
        ticks: { color: CORES_GRAFICOS.cinza, stepSize: 2 }
      })
    }
  });
}

// ------------------------------------------------------------
// GRÁFICO 3 — FALTAS POR TRIMESTRE (3 barras: 1º, 2º, 3º)
// Referência interna de risco não é exibida.
// ------------------------------------------------------------
function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  if (!canvas || !dadosAtuais) return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
    graficoFaltas = null;
  }

  let faltasTri1 = 0;
  let faltasTri2 = 0;
  let faltasTri3 = 0;

  dadosAtuais.forEach(function (d) {
    const f = Array.isArray(d.faltas) ? d.faltas : [0, 0, 0];
    const f1 = Number(f[0]); const f2 = Number(f[1]); const f3 = Number(f[2]);
    faltasTri1 += isNaN(f1) ? 0 : f1;
    faltasTri2 += isNaN(f2) ? 0 : f2;
    faltasTri3 += isNaN(f3) ? 0 : f3;
  });

  const totalInterno = faltasTri1 + faltasTri2 + faltasTri3;

  const badge = document.getElementById("estadoFaltas");
  const cardFaltas = document.getElementById("cardFaltas");
  const critico = totalInterno >= LIMITE_CRITICO_FALTAS;

  if (badge) {
    if (critico) {
      badge.classList.remove("oculto");
    } else {
      badge.classList.add("oculto");
    }
  }
  if (cardFaltas) {
    if (critico) {
      cardFaltas.classList.add("critico");
    } else {
      cardFaltas.classList.remove("critico");
    }
  }

  graficoFaltas = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Faltas",
        data: [faltasTri1, faltasTri2, faltasTri3],
        backgroundColor: critico
          ? "rgba(248, 113, 113, 0.45)"
          : CORES_GRAFICOS.cianoSuave,
        borderColor: critico ? CORES_GRAFICOS.vermelho : CORES_GRAFICOS.ciano,
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: CORES_GRAFICOS.fundo,
          titleColor: CORES_GRAFICOS.ciano,
          bodyColor: CORES_GRAFICOS.texto,
          borderColor: CORES_GRAFICOS.ciano,
          borderWidth: 1,
          callbacks: {
            label: function (ctx) {
              return ctx.parsed.y + " faltas";
            }
          }
        }
      },
      scales: opcoesEixosEscuros({
        beginAtZero: true,
        ticks: { color: CORES_GRAFICOS.cinza, precision: 0 }
      })
    }
  });
}

// ------------------------------------------------------------
// FUNÇÃO: atualizarGraficos()
// Ponto único de atualização — chamado por renderizar().
// ------------------------------------------------------------
function atualizarGraficos() {
  if (!dadosAtuais) return;
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
function iniciar() {
  const botaoEntrar = document.getElementById("botao-entrar");
  const botaoAlterar = document.getElementById("botao-alterar");
  const botaoSalvar = document.getElementById("botao-salvar");
  const campoPin = document.getElementById("campo-pin");

  botaoEntrar.addEventListener("click", entrar);
  campoPin.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      entrar();
    }
  });
  botaoAlterar.addEventListener("click", alternarEdicao);
  botaoSalvar.addEventListener("click", salvar);

  document.getElementById("area-boletim").classList.add("oculto");
}

iniciar();