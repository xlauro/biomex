import type { MuscleGroup, MuscleId } from "../types/muscles";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  {
    id: "quads",
    name: "Quadríceps Femoral",
    subtitle: "Vasto Lateral, Medial e Reto Femoral",
    roleByPhase: [
      "Forte tensão isométrica/concêntrica inicial para quebrar a inércia da barra do solo.",
      "Ação concêntrica dominante estendendo os joelhos para elevar a barra até a patela.",
      "Ação excêntrica/isométrica de amortecimento enquanto os joelhos re-flexionam (Scoop).",
      "EXPLOSÃO MÁXIMA! Extensão violenta dos joelhos gerando impulso vertical na barra.",
      "Desaceleração excêntrica rápida seguida de estabilização no fundo do agachamento.",
      "Contração concêntrica potente para erguer o atleta do agachamento profundo até o lockout.",
    ],
  },
  {
    id: "glutes",
    name: "Glúteo Máximo e Médio",
    subtitle: "Extensores e Estabilizadores do Quadril",
    roleByPhase: [
      "Estabilização pélvica inicial mantendo o ângulo do tronco constante.",
      "Ativação moderada assistindo os isquiotibiais na sustentação do quadril.",
      "Pré-alongamento potente (Ciclo Alongamento-Encurtamento) preparando o quadril para a catapulta.",
      "PICO DE POTÊNCIA! Extensão explosiva do quadril projetando a pelve contra a barra.",
      "Estabilização em abdução e rotação externa no fundo da recepção (Catch).",
      "Extensão final do quadril garantindo o alinhamento completo em pé.",
    ],
  },
  {
    id: "hamstrings",
    name: "Isquiotibiais (Posteriores)",
    subtitle: "Bíceps Femoral, Semitendíneo e Semimembranáceo",
    roleByPhase: [
      "Tensão inicial elevada mantendo a pelve ancorada durante a saída.",
      "Controle da extensão do quadril para impedir que o quadril suba antes dos ombros.",
      "Transição crítica: tracionam a tíbia e reposicionam a alavanca para a potência máxima.",
      "Atuação sinergista em alta velocidade na extensão do quadril.",
      "Rápida flexão ativa puxando o corpo do atleta para baixo da barra.",
      "Estabilização posterior do joelho e extensão do quadril na subida.",
    ],
  },
  {
    id: "erectors",
    name: "Eretores da Espinha / Lombar",
    subtitle: "Iliocostal, Longuíssimo e Multífidos",
    roleByPhase: [
      "Isometria severa para manter a coluna neutra contra o grande braço de alavanca inicial.",
      "Sustentação rígida do tronco transmissor de força das pernas para a barra.",
      "Pico de exigência isométrica enquanto o tronco se verticaliza sob carga.",
      "Extensão dinâmica do tronco contribuindo para a velocidade terminal da barra.",
      "Hiper-estabilização isométrica no fundo do agachamento com carga sustentada.",
      "Manutenção da postura ortostática com a barra travada.",
    ],
  },
  {
    id: "lats",
    name: "Latíssimo do Dorso (Dorsal)",
    subtitle: "Grande Dorsal e Redondo Maior",
    roleByPhase: [
      "Ativação firme para deprimir as escápulas e colar a barra às canelas.",
      'Ação contínua de extensão do ombro ("varrer a barra" para trás em direção ao corpo).',
      "Máximo engajamento para aproximar a barra do centro de massa no quadril (Scoop).",
      "Mantém a barra colada ao púbis durante a explosão da Tripla Extensão.",
      "Estabilização da cintura escapular em rotação externa na recepção.",
      "Suporte estrutural da caixa torácica no bloqueio aéreo.",
    ],
  },
  {
    id: "traps",
    name: "Trapézio (Superior e Médio)",
    subtitle: "Elevadores e Retratores Escapulares",
    roleByPhase: [
      "Tensão postural suportando a tração axial dos braços esticados.",
      "Sustentação isométrica crescente conforme a barra acelera.",
      "Preparação escapular para a transferência de momento linear.",
      "ENCOLHIMENTO EXPLOSIVO (Shrug) no final da Tripla Extensão + puxada ativa sob a barra.",
      "Suporte ativo máximo em elevação e rotação superior da escápula sustentando a barra.",
      "Isometria intensa mantendo a plataforma escapular travada sob a carga.",
    ],
  },
  {
    id: "delts",
    name: "Deltoides (Ombros)",
    subtitle: "Porções Anterior, Lateral e Posterior",
    roleByPhase: [
      "Estabilização da articulação glenoumeral na pegada aberta ou nos ombros.",
      "Sinergia com o dorsal para evitar que a barra se afaste do eixo vertical.",
      "Posicionamento articular preparando a puxada alta.",
      "Auxílio na puxada vertical rápida após a extensão dos membros inferiores.",
      "EXIGÊNCIA MÁXIMA! Rotação rápida (Turnover) e travamento isométrico da carga.",
      "Sustentação isométrica contínua em flexão/abdução completa até o lockout.",
    ],
  },
  {
    id: "core",
    name: "Core / Parede Abdominal",
    subtitle: "Reto Abdominal, Oblíquos e Transverso",
    roleByPhase: [
      "Pressão intra-abdominal (Valsalva) criando um cilindro rígido no tronco.",
      "Estabilização anti-flexão durante a subida da barra até os joelhos.",
      "Rígido controle do tronco durante a mudança de direção dos joelhos.",
      "Transmissão de força dos membros inferiores sem perda de energia.",
      "PICO ISOMÉTRICO! Blindagem do tronco ao receber o impacto da barra.",
      "Estabilização global da coluna e pelve durante a recuperação.",
    ],
  },
  {
    id: "calves",
    name: "Panturrilhas (Tríceps Sural)",
    subtitle: "Gastrocnêmio e Sóleo",
    roleByPhase: [
      "Equilíbrio da pressão plantar no meio do pé.",
      "Estabilização do tornozelo enquanto a tíbia recua discretamente.",
      "Alongamento sob carga conforme os joelhos avançam sobre a barra.",
      "FLEXÃO PLANTAR EXPLOSIVA! Último elo da Tripla Extensão empurrando o solo.",
      "Dorsiflexão máxima controlada no fundo do agachamento de recepção.",
      "Equilíbrio postural com os pés planos no solo.",
    ],
  },
  {
    id: "arms",
    name: "Tríceps Braquial e Antebraços",
    subtitle: "Hook Grip (Pegada Gancho) e Extensores do Cotovelo",
    roleByPhase: [
      "Pegada em gancho (Hook Grip) ativa; braços relaxados agindo como cabos de aço.",
      "Forte isometria nos flexores dos dedos mantendo a barra segura.",
      "Manutenção da tensão nos punhos na passagem pelos joelhos.",
      "Guiam a barra próxima ao tronco durante a puxada alta.",
      "TRAVAMENTO (LOCKOUT) VIOLENTO do tríceps estendendo os cotovelos para aparar a barra.",
      "Cotovelos bloqueados em isometria sustentando a carga acima da cabeça.",
    ],
  },
];

export function getMuscleById(id: MuscleId): MuscleGroup | undefined {
  return MUSCLE_GROUPS.find((m) => m.id === id);
}

/**
 * Converte porcentagem de ativação EMG (0-100) em cor RGBA térmica com brilho dinâmico
 */
export function getThermalColor(percent: number, alpha: number = 1.0): string {
  const p = Math.max(0, Math.min(100, percent)) / 100;
  let r: number, g: number, b: number;

  if (p < 0.35) {
    const t = p / 0.35;
    r = 30 + (6 - 30) * t;
    g = 64 + (182 - 64) * t;
    b = 175 + (212 - 175) * t;
  } else if (p < 0.6) {
    const t = (p - 0.35) / 0.25;
    r = 6 + (234 - 6) * t;
    g = 182 + (179 - 182) * t;
    b = 212 + (8 - 212) * t;
  } else if (p < 0.82) {
    const t = (p - 0.6) / 0.22;
    r = 234 + (249 - 234) * t;
    g = 179 + (115 - 179) * t;
    b = 8 + (22 - 8) * t;
  } else {
    const t = (p - 0.82) / 0.18;
    r = 249 + (255 - 249) * t;
    g = 115 + (18 - 115) * t;
    b = 22 + (78 - 22) * t;
  }

  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}
