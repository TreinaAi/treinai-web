# TreinAi

Aplicativo web de acompanhamento de treino de hipertrofia (migração em Angular de um app original em HTML/CSS/JS puro). Permite registrar sessões de treino com séries, cronômetro de descanso, acompanhar o histórico, medir a evolução corporal e consultar um guia de uso — tudo salvo localmente no dispositivo (`localStorage`).

Gerado com [Angular CLI](https://github.com/angular/angular-cli) versão 22.3.0.

## Funcionalidades

### 🏋️ Treino
- Escolha entre os treinos do catálogo (hoje "Treino A" e "Treino B"); um badge indica qual é o **Próximo** sugerido, com base no treino da última sessão.
- Card com o **último treino realizado** (nome e data).
- Ao iniciar uma sessão, cada exercício vem com **autopreenchimento** de kg/reps a partir da última execução do mesmo exercício no histórico.
- Cada exercício é expansível/colapsável e mostra grupo muscular, séries×repetições, descanso sugerido, RIR, campos de RIR final/descanso usado/observações e uma dica de execução.
- Ao marcar uma série como concluída, inicia automaticamente um **cronômetro de descanso** (barra fixa no rodapé, com beep sonoro e vibração ao zerar, e botões +15s/−30s/pular).
- Toasts de confirmação para ações como iniciar/finalizar treino.
- Validação ao finalizar: exige pelo menos uma série preenchida.

### 📋 Histórico
- Lista de sessões registradas, mais recente primeiro, expansível para ver detalhes de cada exercício (séries, RIR, descanso, observações).
- Cálculo automático do **volume total** (kg × reps) de cada sessão.
- Exclusão de sessões e exportação de todo o histórico (+ medições) em **CSV**.

### 📈 Evolução
- Formulário para registrar peso, cintura, peito, braço, coxa, sono e observações.
- Card de **resumo** com a variação de peso/cintura/braço desde a primeira medição (setas para cima/baixo conforme o sentido desejado — cintura menor é "bom", peso/braço maiores são "bom").
- Gráfico de linha (SVG) da evolução do peso ao longo do tempo.
- Histórico de medições com exclusão individual.

### 📖 Guia
- Conteúdo explicativo completo (como usar, frequência, prioridade, descanso, aquecimento, intensidade, progressão, exemplos, segurança) e tabela de parâmetros de referência.
- Seção "Seus dados": exportar CSV ou apagar todos os dados salvos no dispositivo.

## Arquitetura

```
src/app/
├── core/
│   ├── models/app.models.ts        # Tipos compartilhados (WorkoutTemplate, Session, Measurement...)
│   ├── data/
│   │   └── workout-templates.mock.ts   # Dados mockados do catálogo de treinos
│   ├── services/
│   │   ├── treino-data.service.ts      # Sessões, rascunho em andamento e medições do usuário (localStorage)
│   │   ├── workout-catalog.service.ts  # Catálogo de treinos (templates) + estados de loading/erro
│   │   ├── workout-templates.source.ts        # Porta (classe abstrata) de acesso ao catálogo
│   │   ├── mock-workout-templates.source.ts   # Implementação mock da porta acima
│   │   ├── toast.service.ts            # Notificações temporárias no rodapé
│   │   └── rest-timer.service.ts       # Cronômetro de descanso (beep + vibração)
│   └── utils/format.util.ts        # parseNumber, todayISO, formatTime
├── features/
│   ├── workout/      # Tela de Treino (escolha de treino + sessão em andamento)
│   ├── history/      # Tela de Histórico
│   ├── evolution/     # Tela de Evolução
│   └── guide/         # Tela de Guia
├── layouts/
│   └── main-layout/   # Topbar (subtítulo dinâmico por aba) + tabbar de navegação
├── shared/
│   ├── toast/              # <app-toast>, exibido globalmente
│   └── rest-timer-bar/     # <app-rest-timer-bar>, exibido globalmente
└── app.routes.ts      # Rotas com lazy-loading (loadComponent) por feature
```

### Fluxo de dados

- **`WorkoutCatalogService`** é responsável por *quais treinos existem* (o catálogo). Ele não sabe nada sobre sessões do usuário — só expõe `templates`, `loading` e `error` como signals somente-leitura, carregados via `WorkoutTemplatesSource.fetchTemplates()`.
- **`TreinoDataService`** é responsável pelo *progresso do usuário*: sessões concluídas, medições de evolução e o rascunho (`draft`) da sessão em andamento. Ele injeta `WorkoutCatalogService` para resolver nomes/exercícios do treino ativo, mas não conhece a origem dos dados do catálogo.
- Ambos os serviços usam **Angular signals** (`signal`, `computed`, `effect`) como única fonte de verdade; os componentes (standalone, com `inject()`) apenas leem e chamam métodos — não há `NgModule` nem RxJS para estado, só para o roteador (`toSignal` no layout).
- O estado de `TreinoDataService` (sessões, medições, rascunho) é persistido em `localStorage` a cada mudança via um `effect()`.

### Catálogo de treinos pronto para uma API futura

Hoje o catálogo de treinos (A/B) é mockado localmente, mas a aplicação já está preparada para o dia em que os treinos passarem a vir de uma API vinculada ao usuário autenticado, usando um padrão de porta/adaptador:

```
WorkoutCatalogService
        │  injeta
        ▼
WorkoutTemplatesSource (classe abstrata = porta/token de DI)
        ▲  implementada por
        │
MockWorkoutTemplatesSource (dados locais, com latência simulada)
```

Para integrar uma API real, basta:
1. Criar uma nova implementação (ex.: `HttpWorkoutTemplatesSource`) que implemente `WorkoutTemplatesSource` usando `HttpClient`.
2. Trocar o provider em `app.config.ts`:
   ```ts
   { provide: WorkoutTemplatesSource, useClass: HttpWorkoutTemplatesSource }
   ```

Nenhum componente ou outro serviço precisa ser alterado. Por esse motivo, os ids dos treinos no mock são **UUIDs** (não `'A'`/`'B'`) e o tipo `WorkoutTemplate.id`/`treino` é `string` — nada no app assume um formato específico de id, e o número de treinos disponíveis não é fixo em 2 (a tela de Treino itera sobre `templates()` dinamicamente).

### Decisões técnicas

- **Angular 22**, componentes `standalone: true`, sem `NgModule`.
- **Signals** para todo o estado da aplicação (`signal`/`computed`/`effect`), em vez de `BehaviorSubject`/RxJS.
- **`@Service()`** é usado como decorator de injeção de dependência (equivalente a `@Injectable({ providedIn: 'root' })` nesta versão do Angular).
- **Lazy loading** por rota via `loadComponent` em `app.routes.ts`.
- Persistência simples em **`localStorage`** para dados do usuário (sessões/medições); o catálogo de treinos é a única parte pensada para vir de uma API.

## Como rodar localmente

### Pré-requisitos
- Node.js compatível com o Angular CLI 22 (`^22.22.3 || ^24.15.0 || >=26.0.0`)
- npm

### Instalar dependências
```bash
npm install
```

### Servidor de desenvolvimento
```bash
npm start
```
Abre em `http://localhost:4200/` com reload automático a cada alteração nos arquivos.

### Build de produção
```bash
npm run build
```
Gera os artefatos otimizados em `dist/treinai-web`.

### Testes unitários
```bash
npm test
```
Executa os testes com [Vitest](https://vitest.dev/).

