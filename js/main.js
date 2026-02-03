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
    limiteDiario: 8, // pontos/dia
    maxHorasPontuaveis: 4,
    questoesSemana: 180,
    metas: ["Lei Seca", "Exatas", "Tributário", "Auditoria"]
  },
  B: {
    nome: "Succi F. Caetano",
    area: "Policial",
    limiteDiario: 4, // pontos/dia
    maxHorasPontuaveis: 2,
    questoesSemana: 80,
    metas: ["Lei Seca", "Inquérito", "Teoria do Crime", "Volume"]
  }
};
