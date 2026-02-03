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
