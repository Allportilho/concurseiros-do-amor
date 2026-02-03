function registrar() {
  const minutos = Number(document.getElementById("minutos").value);
  const questoes = Number(document.getElementById("questoes").value);

  let pontos = 0;

  // 1 ponto a cada 30 minutos
  pontos += Math.floor(minutos / 30);

  // 2 pontos a cada 20 questões
  pontos += Math.floor(questoes / 20) * 2;

  document.getElementById("resultado").innerText =
    `🔥 Você fez ${pontos} pontos hoje!`;
}

const perfis = {
  A: {
    nome: "Alisson Portilho",
    area: "Fiscal / Controle",
    maxHorasPontuaveis: 4,   // pode estudar até 4h pontuáveis
    maxPontosDiarios: 8     // mas só pode fazer no máximo 8 pts/dia
  },
  B: {
    nome: "Succi F. Caetano",
    area: "Policial",
    maxHorasPontuaveis: 2,   // só 2h pontuáveis
    maxPontosDiarios: 8     // mesmo teto de pontos 😈⚖️
  }
};

