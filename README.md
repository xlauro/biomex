# KineLab LPO / BioSim 🏋️‍♂️

Simulador Biomecânico e Laboratório Cinemático em Tempo Real para Levantamento de Peso Olímpico (LPO) desenvolvido em **TypeScript Modular** de alta performance, empacotado com **Vite**, estilizado com **Tailwind CSS v4** e testado no runtime **Bun**.

---

## 🚀 Funcionalidades

- **Manequim Anatômico 2D em 60+ FPS**:
  - **Vista Sagital (Lateral)** e **Vista Coronal (Frontal)** sincronizadas.
  - 10 grupamentos musculares modelados com fusos musculares orgânicos e estrias anatômicas.
  - **Mapa Térmico de Recrutamento (EMG)** com brilho térmico e contração visual pulsante proporcional à ativação.
  - Filtro interativo: passe o cursor sobre qualquer músculo para destacá-lo no atleta ou clique para fixar o filtro com callout cinesiológico da fase.

- **Física & Cinemática Vetorial Real**:
  - Ângulos articulares calculados por produto escalar e trigonometria vetorial real (Joelho, Quadril, Tronco, Cotovelo, Ombro).
  - Derivadas instantâneas contínuas de velocidade ($v = \frac{dy}{dt}$) e aceleração ($a = \frac{dv}{dt}$).
  - Cálculo dinâmico de Potência Mecânica instantânea ($P = F \cdot v$ em Watts) e Trabalho mecânico acumulado ($W$ em Joules).
  - Vetor de Força de Reação do Solo (FRS) proporcional à carga e aceleração.
  - Medidor de Centro de Pressão Plantar (CoP) nos pés (calcanhar, mediopé e antepé).

- **Multi-Movimentos de LPO**:
  - **Snatch (Arranco)**: 6 fases biomecânicas (Setup, 1º Puxão, Transição/Scoop, 2º Puxão com Tripla Extensão, Entrada/Catch e Lockout).
  - **Clean & Jerk (Arremesso)**: 6 fases (Saída, Puxão, Rack no Front Squat, Subida, Dip & Drive e Split Jerk).
  - Arquitetura plugável através do `MovementRegistry` pronta para novos exercícios (ex: Agachamentos, Levantamento Terra).

- **Configuração de Carga e Anilhas Olímpicas Oficiais (IWF)**:
  - Ajuste de massa da barra de 20kg a 260kg em tempo real.
  - Cálculo automático e empilhamento visual das anilhas IWF oficiais (Vermelha 25kg, Azul 20kg, Amarela 15kg, Verde 10kg, Branca 5kg, Preta 2.5kg e presilhas).

- **Telemetria Analítica & Gráficos Sincronizados**:
  - Gráfico de curvas temporais (Velocidade e Potência) com cursor temporal (playhead) sincronizado.
  - Linha do tempo interativa milissegundo a milissegundo com atalhos de fases e controle de velocidade (0.2x, 0.5x, 1.0x).
  - Zoom & Pan interativo no Canvas (Scroll do mouse para zoom, clique e arraste para navegar, duplo clique para resetar).
  - Exportação de fotos PNG em alta definição e exportação de datasets completos em CSV para pesquisa científica.

---

## 📦 Instalação e Execução

### 1. Instalar dependências
```bash
bun install
```

### 2. Iniciar servidor de desenvolvimento (Vite)
```bash
bun run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### 3. Executar suíte de testes unitários
```bash
bun test
```

### 4. Checagem de tipos TypeScript estrita
```bash
bun run typecheck
```

### 5. Compilar para produção
```bash
bun run build
```

---

## 📂 Arquitetura do Projeto

```
src/
├── core/                   # Matemática pura e cálculos físicos
│   ├── vector2d.ts         # Álgebra vetorial 2D e ângulos articulares
│   ├── physics.ts          # Dinâmica da barra, forças, potência e anilhas IWF
│   └── spline.ts           # Interpolação suave e splines cúbicos
├── data/                   # Catálogo anatômico e exercícios
│   ├── muscles.ts          # Definição dos 10 grupos musculares e escala térmica
│   └── movements/
│       ├── snatch.ts       # Keyframes e dados biomecânicos do Snatch
│       ├── cleanAndJerk.ts # Keyframes e dados do Clean & Jerk
│       └── registry.ts     # Registro extensível de movimentos
├── engine/                 # Núcleo de simulação e estado
│   ├── state.ts            # Gerenciador de estado reativo e opções
│   ├── kinematicsEngine.ts # Calculador contínuo de ângulos, derivadas e trajetórias
│   └── loop.ts             # RAF loop desacoplado com delta-time
├── renderer/               # Renderização gráfica Canvas 2D
│   ├── canvasManager.ts    # Gerenciador de viewport, DPR, zoom e pan
│   ├── environment.ts      # Plataforma e grade métrica de laboratório
│   ├── mannequin.ts        # Manequim em vistas sagital e coronal
│   ├── muscleRenderer.ts   # Ventres musculares orgânicos e mapas térmicos
│   ├── barbellRenderer.ts  # Barra e anilhas olímpicas geradas por física
│   ├── trajectoryRenderer.ts # Curva-S e fantasmas estroboscópicos
│   └── overlayRenderer.ts  # Arcos angulares, vetor FRS e CoP
└── ui/                     # Componentes de interface e gráficos
    ├── hud.ts              # Telemetria flutuante superior
    ├── timeline.ts         # Scrubber, controle de reprodução e botões de fase
    ├── charts.ts           # Gráficos de velocidade e potência instantânea
    ├── muscleList.ts       # Lista de EMG em tempo real e callouts
    ├── controls.ts         # Seletores de câmera, exercícios e carga
    └── exportModal.ts      # Exportação de fotos PNG e arquivos CSV
```

---

## 🧪 Testes

A engine de física e os operadores matemáticos possuem testes unitários automatizados cobrindo:
- Álgebra e produtos escalares em `tests/math/vector.test.ts`.
- Cálculo de forças dinâmicas e distribuição de anilhas em `tests/physics/kinematics.test.ts`.
- Validação de integridade dos keyframes e interpolação em `tests/movements/interpolation.test.ts`.

---

## 🏛️ Histórico
O arquivo monolítico original foi preservado em `res/index.html` para fins de referência comparativa.
