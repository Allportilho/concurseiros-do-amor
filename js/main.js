const perfis = {
  A: {
    nome: "Alisson Portilho",
    area: "Fiscal / Controle",
    maxHorasPontuaveis: 4,
    maxPontosDiarios: 8,
    disciplinas: {
      basicas: [
        "Português",
        "Raciocínio Lógico / Estatística",
        "Informática",
        "Direito Constitucional",
        "Direito Administrativo"
      ],
      especificas: [
        "Direito Tributário",
        "Legislação Tributária",
        "Contabilidade",
        "Auditoria",
        "AFO"
      ]
    }
  },

  B: {
    nome: "Succi F. Caetano",
    area: "Policial",
    maxHorasPontuaveis: 2,
    maxPontosDiarios: 8,
    disciplinas: {
      basicas: [
        "Português",
        "Raciocínio Lógico",
        "Informática",
        "Direitos Humanos",
        "Legislação Penal Especial"
      ],
      especificas: [
        "Direito Penal",
        "Processo Penal",
        "Criminologia",
        "Investigação Policial",
        "Medicina Legal"
      ]
    }
  }
};


let ranking = {
  semanal: { A: 0, B: 0 },
  mensal: { A: 0, B: 0 },
  geral: { A: 0, B: 0 }
};

function registrar() {
  const perfilSelecionado = document.getElementById("perfil").value;
  const minutos = Number(document.getElementById("minutos").value);
  const questoes = Number(document.getElementById("questoes").value);

  const perfil = perfis[perfilSelecionado];

  let pontos = Math.floor(minutos / 30) + Math.floor(questoes / 20) * 2;

  const maxPorHoras = perfil.maxHorasPontuaveis * 2;
  if (pontos > maxPorHoras) pontos = maxPorHoras;
  if (pontos > perfil.maxPontosDiarios) pontos = perfil.maxPontosDiarios;

  ranking.semanal[perfilSelecionado] += pontos;
  ranking.mensal[perfilSelecionado] += pontos;
  ranking.geral[perfilSelecionado] += pontos;

  atualizarRanking();

  document.getElementById("resultado").innerText =
    `🔥 ${perfil.nome} fez ${pontos} pontos hoje!`;
}

function atualizarRanking() {
  document.getElementById("rankSemanal").innerText =
    `Alisson: ${ranking.semanal.A} | Succi: ${ranking.semanal.B}`;

  document.getElementById("rankMensal").innerText =
    `Alisson: ${ranking.mensal.A} | Succi: ${ranking.mensal.B}`;

  document.getElementById("rankGeral").innerText =
    `Alisson: ${ranking.geral.A} | Succi: ${ranking.geral.B}`;
}

