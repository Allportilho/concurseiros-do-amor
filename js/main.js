const perfis = {
  A: {
    nome: "Alisson Portilho",
    area: "Fiscal / Controle",
    maxHorasPontuaveis: 4,
    maxPontosDiarios: 8
  },
  B: {
    nome: "Succi F. Caetano",
    area: "Policial",
    maxHorasPontuaveis: 2,
    maxPontosDiarios: 8
  }
};

function registrar() {
  const perfilSelecionado = document.getElementById("perfil").value;
  const minutos = Number(document.getElementById("minutos").value);
  const questoes = Number(document.getElementById("questoes").value);

  const perfil = perfis[perfilSelecionado];

  let pontos = 0;

  // 1 ponto a cada 30 min
  const pontosPorTempo = Math.floor(minutos / 30);

  // 2 pontos a cada 20 questões
  const pontosPorQuestoes = Math.floor(questoes / 20) * 2;

  pontos = pontosPorTempo + pontosPorQuestoes;

  // Limitar pelas horas pontuáveis
  const maxPontosPorHoras = perfil.maxHorasPontuaveis * 2; // 2 pts por hora
  if (pontos > maxPontosPorHoras) {
    pontos = maxPontosPorHoras;
  }

  // Limitar pelo teto diário
  if (pontos > perfil.maxPontosDiarios) {
    pontos = perfil.maxPontosDiarios;
  }

  document.getElementById("resultado").innerText =
    `🔥 ${perfil.nome} fez ${pontos} pontos hoje!`;
}

