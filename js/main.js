// js/main.js - Sistema de Pontuação Concurseiros do Amor

// Estado da aplicação
const state = {
    currentWeek: 1,
    seasonWeeks: 4,
    currentDay: 'segunda',
    points: {
        fiscal: 0,    // Alisson
        policial: 0   // Succi
    },
    dailyData: {
        segunda: { fiscal: {}, policial: {} },
        terca: { fiscal: {}, policial: {} },
        quarta: { fiscal: {}, policial: {} },
        quinta: { fiscal: {}, policial: {} },
        sexta: { fiscal: {}, policial: {} },
        sabado: { fiscal: {}, policial: {} },
        domingo: { fiscal: {}, policial: {} }
    },
    weeklyTotals: {
        fiscal: {
            questions: 0,
            studyMinutes: 0,
            revisaoDays: 0,
            disciplinaDays: 0,
            daysStudied: 0
        },
        policial: {
            questions: 0,
            studyMinutes: 0,
            revisaoDays: 0,
            leiSecaDays: 0,
            disciplinaDays: 0,
            daysStudied: 0
        }
    },
    metasSemanais: {
        fiscal: {
            questionsTarget: 300,
            revisaoTarget: 7,
            disciplinaTarget: 7
        },
        policial: {
            questionsTarget: 80,
            revisaoTarget: 7,
            leiSecaTarget: 6,
            disciplinaTarget: 7
        }
    },
    penalidades: [],
    weekHistory: [],
    seasonWinner: null
};

// Dias da semana
const daysMap = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    updateUI();
    updateDayDisplay();
});

// Funções principais
function updateUI() {
    // Atualizar pontos
    document.getElementById('points-fiscal').textContent = state.points.fiscal;
    document.getElementById('points-policial').textContent = state.points.policial;
    
    // Atualizar progresso
    updateDailyProgress();
    updateWeeklyProgress();
    updateWeekHistory();
    updateSeasonHistory();
    updateCurrentWeek();
    
    // Salvar dados
    saveToLocalStorage();
}

function updateDayDisplay() {
    document.getElementById('current-day-display').textContent = daysMap[state.currentDay];
}

function selectDay(day) {
    state.currentDay = day;
    
    // Atualizar botões
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateDayDisplay();
    updateDailyProgress();
}

function updateDailyProgress() {
    const day = state.currentDay;
    const dataFiscal = state.dailyData[day].fiscal || {};
    const dataPolicial = state.dailyData[day].policial || {};
    
    // Estudo
    const studyFiscal = dataFiscal.study || 0;
    const studyPolicial = dataPolicial.study || 0;
    
    document.getElementById('study-info-fiscal').textContent = `Hoje: ${studyFiscal}/120 min`;
    document.getElementById('study-info-policial').textContent = `Hoje: ${studyPolicial}/120 min`;
    
    // Questões
    const questionsFiscal = dataFiscal.questions || 0;
    const questionsPolicial = dataPolicial.questions || 0;
    
    document.getElementById('questions-fiscal').value = questionsFiscal || '';
    document.getElementById('questions-policial').value = questionsPolicial || '';
    
    updateQuestionsProgress();
}

function updateQuestionsProgress() {
    // Alisson
    const progressFiscal = Math.min((state.weeklyTotals.fiscal.questions / state.metasSemanais.fiscal.questionsTarget) * 100, 100);
    const extraFiscal = Math.max(state.weeklyTotals.fiscal.questions - state.metasSemanais.fiscal.questionsTarget, 0);
    
    document.getElementById('questions-bar-fiscal').style.width = `${progressFiscal}%`;
    document.getElementById('questions-info-fiscal').textContent = 
        `Semana: ${state.weeklyTotals.fiscal.questions}/${state.metasSemanais.fiscal.questionsTarget} (${extraFiscal} extra)`;
    
    // Succi
    const progressPolicial = Math.min((state.weeklyTotals.policial.questions / state.metasSemanais.policial.questionsTarget) * 100, 100);
    const extraPolicial = Math.max(state.weeklyTotals.policial.questions - state.metasSemanais.policial.questionsTarget, 0);
    
    document.getElementById('questions-bar-policial').style.width = `${progressPolicial}%`;
    document.getElementById('questions-info-policial').textContent = 
        `Semana: ${state.weeklyTotals.policial.questions}/${state.metasSemanais.policial.questionsTarget} (${extraPolicial} extra)`;
}

function updateWeeklyProgress() {
    // Alisson
    document.getElementById('total-questions-fiscal').textContent = 
        `${state.weeklyTotals.fiscal.questions}/${state.metasSemanais.fiscal.questionsTarget}`;
    
    const diasMetasFiscal = Math.min(state.weeklyTotals.fiscal.revisaoDays, state.weeklyTotals.fiscal.disciplinaDays);
    document.getElementById('dias-metas-fiscal').textContent = `${diasMetasFiscal}/7`;
    
    const pontosMetasFiscal = calcularPontosMetas('fiscal');
    const pontosExtrasFiscal = calcularPontosExtras('fiscal');
    
    document.getElementById('pontos-metas-fiscal').textContent = pontosMetasFiscal;
    document.getElementById('pontos-extras-fiscal').textContent = pontosExtrasFiscal;
    
    // Succi
    document.getElementById('total-questions-policial').textContent = 
        `${state.weeklyTotals.policial.questions}/${state.metasSemanais.policial.questionsTarget}`;
    
    const diasMetasPolicial = Math.min(
        state.weeklyTotals.policial.revisaoDays,
        state.weeklyTotals.policial.leiSecaDays,
        state.weeklyTotals.policial.disciplinaDays
    );
    document.getElementById('dias-metas-policial').textContent = `${diasMetasPolicial}/7`;
    
    const pontosMetasPolicial = calcularPontosMetas('policial');
    const pontosExtrasPolicial = calcularPontosExtras('policial');
    
    document.getElementById('pontos-metas-policial').textContent = pontosMetasPolicial;
    document.getElementById('pontos-extras-policial').textContent = pontosExtrasPolicial;
    
    // Atualizar vencedor atual
    updateCurrentWinner();
}

function calcularPontosMetas(competidor) {
    let pontos = 0;
    const totals = state.weeklyTotals[competidor];
    const metas = state.metasSemanais[competidor];
    
    // Questões
    if (totals.questions >= metas.questionsTarget) pontos += 25;
    
    // Revisão (6 dias em 7)
    if (totals.revisaoDays >= 6) pontos += 25;
    
    // Disciplina (6 dias em 7)
    if (totals.disciplinaDays >= 6) pontos += 25;
    
    // Lei Seca apenas para Succi
    if (competidor === 'policial' && totals.leiSecaDays >= 6) pontos += 25;
    
    return pontos;
}

function calcularPontosExtras(competidor) {
    const extraQuestions = Math.max(
        state.weeklyTotals[competidor].questions - state.metasSemanais[competidor].questionsTarget,
        0
    );
    return extraQuestions;
}

function updateCurrentWinner() {
    const pontosFiscal = state.points.fiscal + calcularPontosMetas('fiscal') + calcularPontosExtras('fiscal');
    const pontosPolicial = state.points.policial + calcularPontosMetas('policial') + calcularPontosExtras('policial');
    
    if (pontosFiscal > pontosPolicial) {
        document.getElementById('winner-name').textContent = 'Alisson Portilho';
        document.getElementById('winner-name').style.color = 'var(--fiscal)';
        document.getElementById('winner-points').textContent = `${pontosFiscal} pontos`;
    } else if (pontosPolicial > pontosFiscal) {
        document.getElementById('winner-name').textContent = 'Succi F. Caetano';
        document.getElementById('winner-name').style.color = 'var(--policial)';
        document.getElementById('winner-points').textContent = `${pontosPolicial} pontos`;
    } else {
        document.getElementById('winner-name').textContent = 'Empate!';
        document.getElementById('winner-name').style.color = 'var(--accent)';
        document.getElementById('winner-points').textContent = `${pontosFiscal} pontos`;
    }
}

// Ações do usuário
function addStudyTime(competidor) {
    const inputId = `study-${competidor}`;
    const input = document.getElementById(inputId);
    const minutos = parseInt(input.value) || 0;
    
    if (minutos < 0 || minutos > 120) {
        showFeedback('Por favor, insira entre 0 e 120 minutos.', 'error');
        return;
    }
    
    if (minutos > 0) {
        const pontos = Math.floor(minutos / 30) * 10;
        state.points[competidor] += pontos;
        
        // Registrar no dia atual
        const day = state.currentDay;
        if (!state.dailyData[day][competidor]) {
            state.dailyData[day][competidor] = {};
        }
        state.dailyData[day][competidor].study = minutos;
        
        // Atualizar total semanal
        state.weeklyTotals[competidor].studyMinutes += minutos;
        
        // Verificar se estudou hoje
        if (minutos >= 30) {
            state.weeklyTotals[competidor].daysStudied++;
        }
        
        input.value = '';
        updateUI();
        
        const nome = competidor === 'fiscal' ? 'Alisson' : 'Succi';
        showFeedback(`${nome} ganhou ${pontos} pontos por ${minutos} minutos de estudo!`, 'success');
    }
}

function addQuestions(competidor) {
    const inputId = `questions-${competidor}`;
    const input = document.getElementById(inputId);
    const questoes = parseInt(input.value) || 0;
    
    if (questoes < 0) {
        showFeedback('Por favor, insira um número positivo.', 'error');
        return;
    }
    
    if (questoes > 0) {
        // Registrar no dia atual
        const day = state.currentDay;
        if (!state.dailyData[day][competidor]) {
            state.dailyData[day][competidor] = {};
        }
        state.dailyData[day][competidor].questions = questoes;
        
        // Atualizar total semanal
        state.weeklyTotals[competidor].questions += questoes;
        
        // Calcular pontos extras (após atingir a meta)
        const target = state.metasSemanais[competidor].questionsTarget;
        const currentTotal = state.weeklyTotals[competidor].questions;
        const previousTotal = currentTotal - questoes;
        
        let pontosExtras = 0;
        
        if (previousTotal >= target) {
            // Já tinha ultrapassado a meta
            pontosExtras = questoes;
        } else if (currentTotal > target) {
            // Ultrapassou a meta agora
            pontosExtras = currentTotal - target;
        }
        
        if (pontosExtras > 0) {
            state.points[competidor] += pontosExtras;
        }
        
        input.value = '';
        updateUI();
        
        const nome = competidor === 'fiscal' ? 'Alisson' : 'Succi';
        let mensagem = `${nome} adicionou ${questoes} questões`;
        if (pontosExtras > 0) {
            mensagem += ` e ganhou ${pontosExtras} pontos extras!`;
        }
        showFeedback(mensagem, 'success');
    }
}

function toggleMeta(competidor, meta) {
    const day = state.currentDay;
    if (!state.dailyData[day][competidor]) {
        state.dailyData[day][competidor] = {};
    }
    
    const atual = state.dailyData[day][competidor][meta] || false;
    state.dailyData[day][competidor][meta] = !atual;
    
    // Atualizar contadores semanais
    if (!atual) {
        // Adicionando meta
        if (meta === 'revisao') state.weeklyTotals[competidor].revisaoDays++;
        if (meta === 'lei-seca') state.weeklyTotals[competidor].leiSecaDays++;
        if (meta === 'disciplina') state.weeklyTotals[competidor].disciplinaDays++;
    } else {
        // Removendo meta
        if (meta === 'revisao') state.weeklyTotals[competidor].revisaoDays--;
        if (meta === 'lei-seca') state.weeklyTotals[competidor].leiSecaDays--;
        if (meta === 'disciplina') state.weeklyTotals[competidor].disciplinaDays--;
    }
    
    updateUI();
    
    const nome = competidor === 'fiscal' ? 'Alisson' : 'Succi';
    const nomeMeta = {
        'revisao': 'Revisão',
        'lei-seca': 'Lei Seca',
        'disciplina': 'Disciplina'
    }[meta];
    
    const acao = !atual ? 'marcada' : 'desmarcada';
    showFeedback(`${nome}: ${nomeMeta} ${acao}`, 'info');
}

function addSimulado(competidor) {
    state.points[competidor] += 100;
    updateUI();
    
    const nome = competidor === 'fiscal' ? 'Alisson' : 'Succi';
    showFeedback(`${nome} completou um simulado e ganhou 100 pontos!`, 'success');
}

function applyPenalty(competidor) {
    state.points[competidor] -= 50;
    state.penalidades.push({
        competidor,
        motivo: 'Falta de estudo',
        dia: state.currentDay
    });
    
    updateUI();
    
    const nome = competidor === 'fiscal' ? 'Alisson' : 'Succi';
    showFeedback(`${nome} perdeu 50 pontos por falta!`, 'error');
}

// Finalização da semana
function finalizarSemana() {
    // Calcular pontos totais
    const pontosFiscal = state.points.fiscal + calcularPontosMetas('fiscal') + calcularPontosExtras('fiscal');
    const pontosPolicial = state.points.policial + calcularPontosMetas('policial') + calcularPontosExtras('policial');
    
    let vencedor = null;
    let pontosVencedor = 0;
    let empate = false;
    
    if (pontosFiscal > pontosPolicial) {
        vencedor = 'fiscal';
        pontosVencedor = pontosFiscal;
    } else if (pontosPolicial > pontosFiscal) {
        vencedor = 'policial';
        pontosVencedor = pontosPolicial;
    } else {
        empate = true;
        pontosVencedor = pontosFiscal;
    }
    
    // Salvar resultado da semana
    const weekResult = {
        week: state.currentWeek,
        points: pontosVencedor,
        winner: empate ? 'empate' : vencedor,
        details: {
            fiscal: pontosFiscal,
            policial: pontosPolicial,
            dailyData: JSON.parse(JSON.stringify(state.dailyData))
        }
    };
    
    state.weekHistory.push(weekResult);
    
    // Verificar se é final da temporada
    if (state.currentWeek === state.seasonWeeks) {
        determinarCampeaoTemporada();
    }
    
    // Mostrar resultados
    mostrarResultados(weekResult, empate);
    
    // Preparar para próxima semana
    if (state.currentWeek < state.seasonWeeks) {
        state.currentWeek++;
    }
}

function mostrarResultados(weekResult, empate) {
    const modal = document.getElementById('results-modal');
    const content = document.getElementById('modal-results');
    
    let html = '';
    
    if (empate) {
        html = `
            <div class="result-empate">
                <h3><i class="fas fa-handshake"></i> Empate Técnico!</h3>
                <p>Ambos terminaram com <strong>${weekResult.points} pontos</strong>.</p>
                <div class="empate-players">
                    <div class="player">
                        <div class="player-avatar fiscal">A</div>
                        <div class="player-name">Alisson</div>
                        <div class="player-points">${weekResult.details.fiscal} pts</div>
                    </div>
                    <div class="player">
                        <div class="player-avatar policial">S</div>
                        <div class="player-name">Succi</div>
                        <div class="player-points">${weekResult.details.policial} pts</div>
                    </div>
                </div>
                <p class="empate-message">De acordo com o regulamento: ambos ganham! 😌</p>
            </div>
        `;
    } else {
        const nomeVencedor = weekResult.winner === 'fiscal' ? 'Alisson Portilho' : 'Succi F. Caetano';
        const areaVencedor = weekResult.winner === 'fiscal' ? 'Área Fiscal' : 'Área Policial';
        const corVencedor = weekResult.winner === 'fiscal' ? 'var(--fiscal)' : 'var(--policial)';
        
        html = `
            <div class="result-vencedor">
                <div class="vencedor-header" style="border-color: ${corVencedor}">
                    <div class="vencedor-avatar" style="background: ${corVencedor}">
                        ${weekResult.winner === 'fiscal' ? 'A' : 'S'}
                    </div>
                    <h3>🏆 Vencedor da Semana ${weekResult.week}</h3>
                    <div class="vencedor-nome" style="color: ${corVencedor}">${nomeVencedor}</div>
                    <div class="vencedor-area">${areaVencedor}</div>
                    <div class="vencedor-pontos">${weekResult.points} pontos</div>
                </div>
                
                <div class="vencedor-detalhes">
                    <h4><i class="fas fa-chart-line"></i> Detalhes:</h4>
                    <div class="detalhes-grid">
                        <div class="detalhe-item">
                            <span>Pontos totais:</span>
                            <span>${weekResult.points}</span>
                        </div>
                        <div class="detalhe-item">
                            <span>Questões extras:</span>
                            <span>${calcularPontosExtras(weekResult.winner)}</span>
                        </div>
                        <div class="detalhe-item">
                            <span>Pontos metas:</span>
                            <span>${calcularPontosMetas(weekResult.winner)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="vencedor-premios">
                    <h4><i class="fas fa-gift"></i> Prêmios da Semana:</h4>
                    <ul>
                        <li><i class="fas fa-film"></i> Escolher filme/série da semana</li>
                        <li><i class="fas fa-heart"></i> Date pago pelo outro</li>
                        <li><i class="fas fa-star"></i> Pedido especial</li>
                        <li><i class="fas fa-spa"></i> Massagem ou jantar preparado</li>
                        <li><i class="fas fa-umbrella-beach"></i> Escolher o rolê do fim de semana</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // Adicionar temporada se for o caso
    if (state.currentWeek === state.seasonWeeks && state.seasonWinner) {
        const nomeCampeao = state.seasonWinner === 'fiscal' ? 'Alisson Portilho' : 
                           state.seasonWinner === 'policial' ? 'Succi F. Caetano' : 'Empate';
        
        html += `
            <div class="season-champion">
                <h4><i class="fas fa-trophy"></i> 🏆 CAMPEÃO DA TEMPORADA 🏆</h4>
                <div class="champion-name">${nomeCampeao}</div>
                <div class="champion-premios">
                    <p>Prêmios da temporada:</p>
                    <ul>
                        <li>Um dia inteiro de mimos</li>
                        <li>Presente simbólico</li>
                        <li>Carta romântica</li>
                        <li>Jantar especial</li>
                        <li>Outro prêmio em comum acordo</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
    modal.style.display = 'flex';
}

function determinarCampeaoTemporada() {
    let vitoriasFiscal = 0;
    let vitoriasPolicial = 0;
    
    state.weekHistory.forEach(week => {
        if (week.winner === 'fiscal') vitoriasFiscal++;
        if (week.winner === 'policial') vitoriasPolicial++;
    });
    
    if (vitoriasFiscal > vitoriasPolicial) {
        state.seasonWinner = 'fiscal';
    } else if (vitoriasPolicial > vitoriasFiscal) {
        state.seasonWinner = 'policial';
    } else {
        // Empate - decidir por pontos totais
        let pontosFiscal = 0;
        let pontosPolicial = 0;
        
        state.weekHistory.forEach(week => {
            pontosFiscal += week.details.fiscal;
            pontosPolicial += week.details.policial;
        });
        
        if (pontosFiscal > pontosPolicial) {
            state.seasonWinner = 'fiscal';
        } else if (pontosPolicial > pontosFiscal) {
            state.seasonWinner = 'policial';
        } else {
            state.seasonWinner = 'empate';
        }
    }
}

function iniciarNovaSemana() {
    if (state.currentWeek <= state.seasonWeeks) {
        // Resetar dados da semana
        state.dailyData = {
            segunda: { fiscal: {}, policial: {} },
            terca: { fiscal: {}, policial: {} },
            quarta: { fiscal: {}, policial: {} },
            quinta: { fiscal: {}, policial: {} },
            sexta: { fiscal: {}, policial: {} },
            sabado: { fiscal: {}, policial: {} },
            domingo: { fiscal: {}, policial: {} }
        };
        
        state.weeklyTotals = {
            fiscal: {
                questions: 0,
                studyMinutes: 0,
                revisaoDays: 0,
                disciplinaDays: 0,
                daysStudied: 0
            },
            policial: {
                questions: 0,
                studyMinutes: 0,
                revisaoDays: 0,
                leiSecaDays: 0,
                disciplinaDays: 0,
                daysStudied: 0
            }
        };
        
        state.points = { fiscal: 0, policial: 0 };
        state.penalidades = [];
        state.currentDay = 'segunda';
        
        // Resetar botões do dia
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.day-btn').classList.add('active');
        
        updateUI();
        updateDayDisplay();
        
        showFeedback(`Semana ${state.currentWeek} iniciada! Boa sorte!`, 'success');
    } else {
        showFeedback('Temporada concluída! Reinicie para começar um novo ciclo.', 'info');
    }
}

// Histórico
function updateWeekHistory() {
    const container = document.getElementById('week-history');
    const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    
    let hasData = false;
    let html = '';
    
    days.forEach(day => {
        const dataFiscal = state.dailyData[day].fiscal || {};
        const dataPolicial = state.dailyData[day].policial || {};
        
        const studyFiscal = dataFiscal.study || 0;
        const studyPolicial = dataPolicial.study || 0;
        const questionsFiscal = dataFiscal.questions || 0;
        const questionsPolicial = dataPolicial.questions || 0;
        
        if (studyFiscal > 0 || studyPolicial > 0 || questionsFiscal > 0 || questionsPolicial > 0) {
            hasData = true;
            
            const metasFiscal = [];
            if (dataFiscal.revisao) metasFiscal.push('R');
            if (dataFiscal.disciplina) metasFiscal.push('D');
            
            const metasPolicial = [];
            if (dataPolicial.revisao) metasPolicial.push('R');
            if (dataPolicial.leiSeca) metasPolicial.push('L');
            if (dataPolicial.disciplina) metasPolicial.push('D');
            
            html += `
                <div class="history-day">
                    <div class="day-name">${daysMap[day]}</div>
                    <div class="day-data">
                        <span class="fiscal-data">A: ${studyFiscal}m ${questionsFiscal}q ${metasFiscal.join('')}</span>
                        <span class="policial-data">S: ${studyPolicial}m ${questionsPolicial}q ${metasPolicial.join('')}</span>
                    </div>
                </div>
            `;
        }
    });
    
    if (!hasData) {
        html = '<p class="empty-history">Nenhum registro ainda nesta semana.</p>';
    }
    
    container.innerHTML = html;
}

function updateSeasonHistory() {
    const container = document.getElementById('season-history');
    
    if (state.weekHistory.length === 0) {
        container.innerHTML = '<p class="empty-history">Nenhuma semana concluída ainda.</p>';
        return;
    }
    
    let html = '';
    
    state.weekHistory.forEach(week => {
        const vencedorNome = week.winner === 'fiscal' ? 'Alisson' : 
                           week.winner === 'policial' ? 'Succi' : 'Empate';
        const vencedorCor = week.winner === 'fiscal' ? 'var(--fiscal)' : 
                          week.winner === 'policial' ? 'var(--policial)' : 'var(--accent)';
        
        html += `
            <div class="season-week">
                <div class="week-number">Semana ${week.week}</div>
                <div class="week-winner" style="color: ${vencedorCor}">${vencedorNome}</div>
                <div class="week-points">${week.points} pts</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateCurrentWeek() {
    document.getElementById('current-week').textContent = state.currentWeek;
}

// Utilitários
function showFeedback(message, type = 'info') {
    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = `feedback feedback-${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    if (type === 'success') {
        feedback.style.backgroundColor = 'var(--success)';
    } else if (type === 'error') {
        feedback.style.backgroundColor = 'var(--danger)';
    } else {
        feedback.style.backgroundColor = 'var(--accent)';
    }
    
    document.body.appendChild(feedback);
    
    // Remover após 3 segundos
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (feedback.parentNode) {
                document.body.removeChild(feedback);
            }
        }, 300);
    }, 3000);
}

// Persistência
function saveToLocalStorage() {
    localStorage.setItem('concurseirosDoAmor', JSON.stringify(state));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('concurseirosDoAmor');
    if (saved) {
        const savedState = JSON.parse(saved);
        Object.assign(state, savedState);
    }
}

function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `concurseiros-do-amor-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showFeedback('Dados exportados com sucesso!', 'success');
}

function resetAllData() {
    if (confirm('⚠️ Tem certeza que deseja reiniciar TODOS os dados?\nIsso apagará todo o histórico e pontuações.')) {
        // Resetar estado
        state.currentWeek = 1;
        state.currentDay = 'segunda';
        state.points = { fiscal: 0, policial: 0 };
        state.dailyData = {
            segunda: { fiscal: {}, policial: {} },
            terca: { fiscal: {}, policial: {} },
            quarta: { fiscal: {}, policial: {} },
            quinta: { fiscal: {}, policial: {} },
            sexta: { fiscal: {}, policial: {} },
            sabado: { fiscal: {}, policial: {} },
            domingo: { fiscal: {}, policial: {} }
        };
        state.weeklyTotals = {
            fiscal: {
                questions: 0,
                studyMinutes: 0,
                revisaoDays: 0,
                disciplinaDays: 0,
                daysStudied: 0
            },
            policial: {
                questions: 0,
                studyMinutes: 0,
                revisaoDays: 0,
                leiSecaDays: 0,
                disciplinaDays: 0,
                daysStudied: 0
            }
        };
        state.penalidades = [];
        state.weekHistory = [];
        state.seasonWinner = null;
        
        // Limpar localStorage
        localStorage.removeItem('concurseirosDoAmor');
        
        // Resetar UI
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.day-btn').classList.add('active');
        
        updateUI();
        updateDayDisplay();
        
        showFeedback('Todos os dados foram reiniciados!', 'success');
    }
}

// Modal functions
function closeModal() {
    document.getElementById('results-modal').style.display = 'none';
}

function showHelp() {
    document.getElementById('help-modal').style.display = 'flex';
}

function closeHelp() {
    document.getElementById('help-modal').style.display = 'none';
}

// Adicionar estilos CSS para feedback
const feedbackStyles = document.createElement('style');
feedbackStyles.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .history-day {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--card-border);
    }
    
    .history-day:last-child {
        border-bottom: none;
    }
    
    .day-name {
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .day-data {
        display: flex;
        gap: 20px;
    }
    
    .fiscal-data {
        color: var(--fiscal);
    }
    
    .policial-data {
        color: var(--policial);
    }
    
    .season-week {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--card-border);
    }
    
    .season-week:last-child {
        border-bottom: none;
    }
    
    .week-number {
        color: var(--text-secondary);
    }
    
    .week-winner {
        font-weight: 600;
    }
    
    .week-points {
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .result-empate, .result-vencedor {
        padding: 20px;
    }
    
    .empate-players {
        display: flex;
        justify-content: center;
        gap: 40px;
        margin: 20px 0;
    }
    
    .player {
        text-align: center;
    }
    
    .player-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        margin: 0 auto 10px;
    }
    
    .player-avatar.fiscal {
        background: var(--fiscal);
    }
    
    .player-avatar.policial {
        background: var(--policial);
    }
    
    .player-name {
        font-weight: 600;
        margin-bottom: 5px;
    }
    
    .player-points {
        color: var(--text-secondary);
    }
    
    .empate-message {
        text-align: center;
        color: var(--accent);
        font-style: italic;
        margin-top: 20px;
    }
    
    .vencedor-header {
        text-align: center;
        padding: 20px;
        border-bottom: 2px solid;
        margin-bottom: 20px;
    }
    
    .vencedor-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        color: white;
        margin: 0 auto 15px;
    }
    
    .vencedor-nome {
        font-size: 1.8rem;
        font-weight: bold;
        margin: 10px 0;
    }
    
    .vencedor-area {
        color: var(--text-secondary);
        margin-bottom: 10px;
    }
    
    .vencedor-pontos {
        font-size: 2rem;
        font-weight: bold;
        color: var(--text-primary);
    }
    
    .vencedor-detalhes, .vencedor-premios {
        margin-bottom: 20px;
    }
    
    .vencedor-detalhes h4, .vencedor-premios h4 {
        color: var(--text-primary);
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .detalhes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .detalhe-item {
        padding: 15px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
    }
    
    .vencedor-premios ul {
        list-style: none;
        padding-left: 0;
    }
    
    .vencedor-premios li {
        padding: 8px 0;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .vencedor-premios li i {
        color: var(--accent);
        width: 20px;
    }
    
    .season-champion {
        padding: 20px;
        background: linear-gradient(135deg, rgba(255, 183, 77, 0.1), rgba(187, 134, 252, 0.1));
        border-radius: 8px;
        margin-top: 20px;
        text-align: center;
    }
    
    .season-champion h4 {
        color: var(--warning);
        margin-bottom: 15px;
        font-size: 1.3rem;
    }
    
    .champion-name {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--accent);
        margin-bottom: 15px;
    }
    
    .champion-premios ul {
        list-style: none;
        padding-left: 0;
    }
    
    .champion-premios li {
        padding: 5px 0;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(feedbackStyles);

// Fechar modais ao clicar fora
window.onclick = function(event) {
    const resultsModal = document.getElementById('results-modal');
    const helpModal = document.getElementById('help-modal');
    
    if (event.target === resultsModal) {
        closeModal();
    }
    
    if (event.target === helpModal) {
        closeHelp();
    }
};

// Prevenir envio do formulário
document.addEventListener('submit', function(e) {
    e.preventDefault();
});
// ==============================================
// FUNÇÕES ADICIONAIS PARA ATENDER AO REGULAMENTO
// ==============================================

// 1. Bônus de Constância (7 dias de estudo)
function verificarBonusConstancia(competidor) {
    const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    let diasEstudados = 0;
    
    days.forEach(day => {
        const data = state.dailyData[day][competidor] || {};
        if (data.study && data.study >= 30) { // Pelo menos 30 minutos
            diasEstudados++;
        }
    });
    
    return diasEstudados === 7;
}

// 2. Penalidade "Nenhuma Meta"
function verificarPenalidadeNenhumaMeta(competidor) {
    const totals = state.weeklyTotals[competidor];
    const metas = state.metasSemanais[competidor];
    
    // Verificar se todas as metas estão zeradas
    const questoesCumpridas = totals.questions >= metas.questionsTarget;
    const revisaoCumprida = totals.revisaoDays >= 6;
    const disciplinaCumprida = totals.disciplinaDays >= 6;
    
    // Para Succi, verificar também lei seca
    let leiSecaCumprida = true;
    if (competidor === 'policial') {
        leiSecaCumprida = totals.leiSecaDays >= 6;
    }
    
    // Se NENHUMA meta foi cumprida
    return !questoesCumpridas && !revisaoCumprida && !disciplinaCumprida && !leiSecaCumprida;
}

// 3. Sistema de Desempate
function desempate(pontosFiscal, pontosPolicial, metasFiscal, metasPolicial, questoesFiscal, questoesPolicial) {
    // 1º Critério: Quem cumpriu mais metas
    if (metasFiscal > metasPolicial) return 'fiscal';
    if (metasPolicial > metasFiscal) return 'policial';
    
    // 2º Critério: Quem fez mais questões
    if (questoesFiscal > questoesPolicial) return 'fiscal';
    if (questoesPolicial > questoesFiscal) return 'policial';
    
    // 3º Critério: Empate técnico
    return 'empate';
}

// 4. Calcular número de metas cumpridas
function contarMetasCumpridas(competidor) {
    let count = 0;
    const totals = state.weeklyTotals[competidor];
    const metas = state.metasSemanais[competidor];
    
    if (totals.questions >= metas.questionsTarget) count++;
    if (totals.revisaoDays >= 6) count++;
    if (totals.disciplinaDays >= 6) count++;
    
    if (competidor === 'policial' && totals.leiSecaDays >= 6) count++;
    
    return count;
}

// 5. Atualizar função finalizarSemana() com novas regras
function finalizarSemanaAtualizada() {
    // Calcular pontos base
    let pontosFiscal = state.points.fiscal;
    let pontosPolicial = state.points.policial;
    
    // Adicionar pontos das metas
    const pontosMetasFiscal = calcularPontosMetas('fiscal');
    const pontosMetasPolicial = calcularPontosMetas('policial');
    pontosFiscal += pontosMetasFiscal;
    pontosPolicial += pontosMetasPolicial;
    
    // Adicionar pontos extras (questões)
    const pontosExtrasFiscal = calcularPontosExtras('fiscal');
    const pontosExtrasPolicial = calcularPontosExtras('policial');
    pontosFiscal += pontosExtrasFiscal;
    pontosPolicial += pontosExtrasPolicial;
    
    // Verificar bônus de constância
    if (verificarBonusConstancia('fiscal')) {
        pontosFiscal += 100;
        showFeedback('Alisson ganhou +100 pontos de bônus por constância!', 'success');
    }
    if (verificarBonusConstancia('policial')) {
        pontosPolicial += 100;
        showFeedback('Succi ganhou +100 pontos de bônus por constância!', 'success');
    }
    
    // Verificar penalidade "nenhuma meta"
    if (verificarPenalidadeNenhumaMeta('fiscal')) {
        pontosFiscal -= 100;
        showFeedback('Alisson perdeu -100 pontos por não cumprir nenhuma meta!', 'error');
    }
    if (verificarPenalidadeNenhumaMeta('policial')) {
        pontosPolicial -= 100;
        showFeedback('Succi perdeu -100 pontos por não cumprir nenhuma meta!', 'error');
    }
    
    // Determinar vencedor com desempate
    const metasCumpridasFiscal = contarMetasCumpridas('fiscal');
    const metasCumpridasPolicial = contarMetasCumpridas('policial');
    const questoesFiscal = state.weeklyTotals.fiscal.questions;
    const questoesPolicial = state.weeklyTotals.policial.questions;
    
    let vencedor = null;
    let pontosVencedor = 0;
    let empate = false;
    
    if (pontosFiscal > pontosPolicial) {
        vencedor = 'fiscal';
        pontosVencedor = pontosFiscal;
    } else if (pontosPolicial > pontosFiscal) {
        vencedor = 'policial';
        pontosVencedor = pontosPolicial;
    } else {
        // Empate - usar sistema de desempate
        vencedor = desempate(pontosFiscal, pontosPolicial, 
                           metasCumpridasFiscal, metasCumpridasPolicial,
                           questoesFiscal, questoesPolicial);
        pontosVencedor = pontosFiscal;
        empate = (vencedor === 'empate');
    }
    
    // Salvar resultado da semana
    const weekResult = {
        week: state.currentWeek,
        points: pontosVencedor,
        winner: vencedor,
        details: {
            fiscal: pontosFiscal,
            policial: pontosPolicial,
            pontosMetasFiscal,
            pontosMetasPolicial,
            pontosExtrasFiscal,
            pontosExtrasPolicial,
            metasCumpridasFiscal,
            metasCumpridasPolicial
        }
    };
    
    state.weekHistory.push(weekResult);
    
    // Verificar se é final da temporada
    if (state.currentWeek === state.seasonWeeks) {
        determinarCampeaoTemporada();
    }
    
    // Mostrar resultados
    mostrarResultadosComDesempate(weekResult, empate, 
                                 metasCumpridasFiscal, metasCumpridasPolicial,
                                 questoesFiscal, questoesPolicial);
    
    // Preparar para próxima semana
    if (state.currentWeek < state.seasonWeeks) {
        state.currentWeek++;
    }
}

// 6. Substituir a chamada do botão "Finalizar Semana"
// No HTML, mudar: onclick="finalizarSemana()" para onclick="finalizarSemanaAtualizada()"

// 7. Função de exportação melhorada
function exportarDadosCompletos() {
    const dadosCompletos = {
        estadoAtual: state,
        dataExportacao: new Date().toISOString(),
        versaoSistema: '2.0',
        exportadoPor: navigator.userAgent,
        resumo: {
            semanaAtual: state.currentWeek,
            pontosAlisson: state.points.fiscal,
            pontosSucci: state.points.policial,
            historicoSemanas: state.weekHistory.length
        }
    };
    
    const dadosStr = JSON.stringify(dadosCompletos, null, 2);
    const nomeArquivo = `concurseiros-amor-${new Date().toISOString().slice(0,10)}.json`;
    
    // Criar link para download
    const blob = new Blob([dadosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showFeedback('Dados exportados com sucesso!', 'success');
}
