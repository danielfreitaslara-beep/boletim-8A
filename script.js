// ============================================================
// CONFIGURAÇÃO FIXA DO ALUNO — 8º ANO / TURMA 8A / Nº 35
// Turma e chamada NÃO podem ser alteradas pela página.
// ============================================================
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 35,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// ============================================================
// DADOS FICTÍCIOS PADRONIZADOS — 8º ANO
// Este é um array (lista) de objetos. Cada objeto é uma disciplina.
// Usados quando a API não tem dados salvos (novo).
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
// Este valor NÃO é calculado a partir das faltas.
// Serve só para mostrar o card. No futuro será tratado de outra forma.
// ============================================================
const FREQUENCIA_DEMONSTRATIVA = 92;

// ============================================================
// ESTADO EM MEMÓRIA
// O PIN fica SOMENTE em memória durante a sessão.
// NUNCA é salvo em localStorage/sessionStorage, URL ou console.
// ============================================================
let pinDaSessao = null;      // guardado apenas em memória
let dadosAtuais = null;      // disciplinas exibidas no momento
let modoEdicao = false;      // controla se a tabela está editável

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
// FUNÇÃO: classeSituacao(texto)
// Devolve a classe CSS de acordo com a situação.
// ============================================================
function classeSituacao(texto) {
  if (texto === "Bom desempenho") return "situacao-bom";
  if (texto === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

// ============================================================
// FUNÇÃO: somarFaltas(faltas)
// Soma o array de faltas dos trimestres, com tolerância a dados
// vindos da API (números ou strings numéricas).
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
// Limpa e repreenche a tabela com os dados atuais.
// Segura contra duplicação (limpa o corpo antes).
// Usa textContent para evitar injeção de HTML.
// ============================================================
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");
  corpo.innerHTML = ""; // limpa antes de reconstruir

  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  dadosAtuais.forEach(function (d) {
    // 1) Normaliza as três notas
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    // 2) Calcula a média com as notas disponíveis
    const media = calcularMedia([n1, n2, n3]);

    // 3) Soma as faltas dos trimestres
    const faltasDisciplina = somarFaltas(d.faltas);
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

    // Disciplina (nome não editável)
    const tdNome = document.createElement("td");
    tdNome.textContent = d.disciplina;
    linha.appendChild(tdNome);

    // Notas e faltas (editáveis apenas em modo edição)
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

    // Média
    const tdMedia = document.createElement("td");
    tdMedia.textContent = formatarNota(media);
    linha.appendChild(tdMedia);

    // Faltas (editável em modo edição)
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

    // Situação
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
// Usada para preencher os inputs de edição a partir dos dados
// antigos (pode vir 82, "7,8", 7.0 etc.). Mostra o valor já
// normalizado para a escala 0–10 com vírgula.
// ============================================================
function formatarNotaNormalizado(valor) {
  const n = normalizarNota(valor);
  if (n === null) return "";
  return String(n).replace(".", ",");
}

// ============================================================
// FUNÇÃO: preencherCards(resumo)
// Limpa e recria os cards de resumo no topo da página.
// ============================================================
function preencherCards(resumo) {
  const container = document.getElementById("cards");
  container.innerHTML = ""; // limpa antes de reconstruir

  const mediaGeralTexto = resumo.mediaGeral !== null
    ? resumo.mediaGeral.toFixed(1).replace(".", ",")
    : "—";

  container.appendChild(criarCard("Média geral", mediaGeralTexto));
  container.appendChild(criarCard("Total de faltas", String(resumo.totalFaltas)));
  container.appendChild(criarCard("Bom desempenho", resumo.bomDesempenho + " disciplinas"));
  container.appendChild(criarCard("Precisam de atenção", resumo.atencao + " disciplinas"));
  // Frequência APENAS DEMONSTRATIVA (não é calculada pelas faltas)
  container.appendChild(criarCard("Frequência (demo)", FREQUENCIA_DEMONSTRATIVA + "%"));
}

// ============================================================
// FUNÇÃO: renderizar()
// Atualiza tabela e cards a partir de dadosAtuais.
// ============================================================
function renderizar() {
  const resumo = preencherTabela();
  preencherCards(resumo);
}

// ============================================================
// FUNÇÃO: clonarDados(dados)
// Clona os dados para edição segura em memória.
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
// Mostra a área do boletim e esconde a área de acesso.
// ============================================================
function mostrarBoletim() {
  document.getElementById("acesso").classList.add("oculto");
  document.getElementById("area-boletim").classList.remove("oculto");
}

// ============================================================
// FUNÇÃO: entrar()
// POST /api/v1/boletins/abrir
// Envia turma, numero_chamada e pin (apenas em memória).
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

    // Limpa o campo do PIN imediatamente após o envio
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

    // Guarda o PIN apenas em memória (não persiste em lugar algum)
    pinDaSessao = pinDigitado;

    // Decide os dados a exibir
    if (json && json.dados && Array.isArray(json.dados.disciplinas)) {
      // DADOS DA API > DADOS LOCAIS — usa exatamente o que veio
      dadosAtuais = clonarDados(json.dados.disciplinas);
    } else {
      // novo === true ou dados === null — usa os dados locais
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
// Liga/desliga o modo edição e re-renderiza a tabela.
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
// Regra específica do editor: aceita 0–10, ponto ou vírgula,
// ou vazio (vira null). NÃO aceita 75, 82, 100, -1, 11, abc.
// Retorna { ok: true, valor } ou { ok: false }.
// ============================================================
function validarNotaEdicao(texto) {
  const t = (texto === null || texto === undefined) ? "" : String(texto).trim();
  if (t === "") {
    return { ok: true, valor: null };
  }
  // Aceita apenas dígitos com no máximo um separador decimal (ponto ou vírgula)
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
// Aceita somente inteiro >= 0. Inválidos: -1, 2,5, abc, vazio.
// Retorna { ok: true, valor } ou { ok: false }.
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
// Lê os inputs, valida e monta o array de disciplinas para salvar.
// Se algo for inválido, marca o campo e retorna null.
// ============================================================
function coletarEdicao() {
  const corpo = document.getElementById("corpo-tabela");
  const linhas = corpo.querySelectorAll("tr");
  const resultado = [];
  let tudoValido = true;

  // Remove marcações antigas
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

    // Notas: inputs com data-campo tri1/tri2/tri3
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

    // Faltas: inputs com data-campo="falta" e data-trimestre 0/1/2
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
// PUT /api/v1/boletins/salvar
// Se falhar, NÃO apaga a edição nem fecha o modo edição.
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

    // Sucesso: atualiza os dados em memória e sai do modo edição
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
// INICIALIZAÇÃO — liga os eventos e prepara a tela
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

  // A tabela e os cards ficam vazios até o login.
  // A área de acesso é a única visível no início.
  document.getElementById("area-boletim").classList.add("oculto");
}

iniciar();