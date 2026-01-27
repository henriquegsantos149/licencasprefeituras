# Rota do Licenciamento Digital

Este é o repositório do front-end da plataforma **Rota do Licenciamento Digital**, desenvolvida para simplificar a gestão de licenciamento ambiental em prefeituras.

## 🚀 Tecnologias

-   **React** (v19.2.0)
-   **Vite** (v7.2.4)
-   **Tailwind CSS** (v4.1.18)
-   **React Router** (v7.12.0)
-   **Lucide React** (v0.562.0) - Ícones
-   **Tailwind CSS Animate** (v1.0.7) - Animações

## ✨ Funcionalidades

### 📱 Design Responsivo
- **Totalmente responsivo** para smartphones, tablets e desktops
- Menu hambúrguer para navegação mobile
- Sidebar como drawer em dispositivos móveis
- Layouts adaptativos com breakpoints Tailwind CSS
- Tabelas convertidas em cards em telas pequenas
- Formulários e componentes otimizados para touch

### 🎯 Principais Módulos

1. **Dashboard**
   - Visão geral dos processos de licenciamento
   - Cards de KPIs (Processos Ativos, Pendências)
   - Lista de processos com status e filtros
   - Navegação rápida para detalhes do processo
   - Botão de acesso rápido para novo processo

2. **Novo Processo**
   - Wizard de 3 etapas para criação de requerimentos
   - **Etapa 1**: Triagem inicial
     - Cadastro do requerente/razão social
     - Seleção da atividade do empreendimento
     - Visualização da documentação necessária
   - **Etapa 2**: Detalhes técnicos
     - Formulários dinâmicos baseados na atividade selecionada
     - Questões específicas por tipo de licenciamento
   - **Etapa 3**: Upload de documentação
     - Lista de documentos obrigatórios
     - Controle de progresso de upload
     - Validação antes de protocolar

3. **Detalhes do Processo**
   - Visualização completa do processo
   - Sistema de abas (Visão Geral, Documentação, Histórico)
   - **SLA e Prazos**:
     - Semáforo de status (Verde/Amarelo/Vermelho)
     - Prazo do requerente (quando em pendência)
     - Prazo do órgão (quando em análise)
     - Cálculo automático de dias restantes
   - **Ações do Gestor**:
     - Iniciar Análise
     - Solicitar Ajuste (pausa o prazo do órgão)
     - Agendar Vistoria
     - Emitir Licença
   - Histórico completo de alterações
   - Visualização de documentos enviados

4. **Gestão Municipal (Admin)**
   - Visão consolidada de todos os processos
   - **KPIs por Status**:
     - Atenção (Vencidos) - Vermelho
     - Prazo Curto - Amarelo (≤ 5 dias)
     - Em Dia - Verde
     - Total de processos
   - Tabela responsiva (desktop) / Cards (mobile)
   - Filtros e busca
   - Acesso rápido aos detalhes de cada processo

5. **Configurações**
   - Perfil do usuário
   - Preferências de notificações
   - Configurações de conta
   - Modo escuro (em desenvolvimento)

## 🛠️ Como rodar o projeto

Siga os passos abaixo para configurar o ambiente de desenvolvimento na sua máquina:

### 1. Clonar o repositório

```bash
git clone https://github.com/henriquegsantos149/licencasprefeituras.git
cd licencasprefeituras
```

### 2. Instalar dependências

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado (versão 18 ou superior recomendada).

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo `.env.example` para criar o seu arquivo `.env`:

```bash
cp .env.example .env
```
*(Caso esteja no Windows sem bash, apenas duplique o arquivo `.env.example` e renomeie para `.env` manualmente)*

### 4. Configurar Backend (Primeira vez)

Se você ainda não configurou o backend:

```bash
# Configurar variáveis de ambiente
cd backend
cp .env.example .env
# Edite .env com suas configurações

# Configurar secrets
cd secrets
cp DATABASE_PASSWORD.template DATABASE_PASSWORD
cp SECRET_KEY.template SECRET_KEY
# Edite cada arquivo com valores reais
cd ..

# Criar migration inicial (primeira vez)
cd ..
python execution/create_initial_migration.py

# Aplicar migrations
python execution/init_database.py
```

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

**O que acontece automaticamente:**
- ✅ Verifica e aplica migrations do banco de dados
- 🚀 Inicia o backend em `http://localhost:8000`
- 🚀 Inicia o frontend em `http://localhost:5173`

**Scripts disponíveis:**
- `npm run dev` - Inicia frontend + backend (com verificação de migrations)
- `npm run dev:frontend` - Apenas frontend
- `npm run dev:backend` - Apenas backend (com verificação de migrations)

Veja `README_SCRIPTS.md` para mais detalhes sobre os scripts.

### 6. Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### 7. Preview da build

```bash
npm run preview
```

### 7. Linting

```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx      # Cabeçalho com busca e notificações
│   │   ├── Layout.jsx       # Layout principal com sidebar e header
│   │   └── Sidebar.jsx      # Menu lateral (drawer em mobile)
│   └── ui/
│       ├── Badge.jsx        # Componente de badge de status
│       └── TrafficLight.jsx # Semáforo de prazo (verde/amarelo/vermelho)
├── context/
│   └── WorkflowContext.jsx  # Context API para gerenciamento de processos
├── pages/
│   ├── Dashboard.jsx       # Página inicial
│   ├── NewProcess.jsx       # Wizard de novo processo
│   ├── ProcessDetails.jsx   # Detalhes do processo
│   ├── Admin.jsx            # Gestão municipal
│   └── Settings.jsx         # Configurações
├── App.jsx                  # Componente raiz com rotas
├── main.jsx                 # Entry point
└── index.css                # Estilos globais e Tailwind
```

## 🎨 Design System

O projeto utiliza **Tailwind CSS v4** com um design system customizado:

### Cores Principais
- **Primary**: `#0F172A` (Slate 900)
- **Secondary**: `#334155` (Slate 700)
- **CTA**: `#0369A1` (Sky 700)
- **Background**: `#F8FAFC` (Slate 50)

### Breakpoints Responsivos
- **Mobile**: `< 640px` (default)
- **Tablet**: `≥ 640px` (sm:)
- **Desktop**: `≥ 768px` (md:)
- **Large Desktop**: `≥ 1024px` (lg:)

### Componentes Reutilizáveis

#### Classes CSS Customizadas
- `.btn-primary` - Botão primário com hover, shadow e animação
- `.btn-secondary` - Botão secundário com borda e hover
- `.card` - Card com shadow, hover e animação sutil
- `.input` - Input com focus states e validação visual

#### Componentes React
- **Badge** - Exibe status do processo com cores contextuais
- **TrafficLight** - Semáforo visual para prazos (verde/amarelo/vermelho)
- **Header** - Cabeçalho com busca e notificações
- **Sidebar** - Menu lateral responsivo (drawer em mobile)
- **Layout** - Container principal com estrutura responsiva

## 📱 Responsividade

O projeto foi desenvolvido com **mobile-first** e é totalmente responsivo:

### Mobile (< 640px)
- Sidebar oculta (menu hambúrguer)
- Layout em coluna única
- Cards ao invés de tabelas
- Textos e espaçamentos reduzidos
- Busca simplificada (apenas ícone)

### Tablet (≥ 640px)
- Grid de 2 colunas para cards
- Tabelas com scroll horizontal
- Sidebar ainda oculta (menu hambúrguer)

### Desktop (≥ 768px)
- Sidebar sempre visível
- Layout completo com sidebar fixa
- Tabelas completas
- Busca com campo de texto

### Large Desktop (≥ 1024px)
- Grid de 3 colunas
- Espaçamentos maiores
- Layout otimizado para telas grandes

## 🔄 Gerenciamento de Estado

O projeto utiliza **React Context API** (`WorkflowContext`) para gerenciar:

### Estado Global
- Lista de processos de licenciamento
- Adição de novos processos
- Atualização de status e histórico
- Cálculo automático de semáforo de prazos (SLA)
- Gerenciamento de prazos (requerente vs. órgão)

### Tipos de Atividades Suportadas
- **Laticínio** (Indústria de Transformação - Médio/Alto Risco)
- **Posto de Combustível** (Comércio Varejista - Alto Risco)
- **Pequeno Porte** (Padaria/Lava-Jato - Baixo Risco)

### Status de Processos
- `Aberto` - Processo recém-protocolado
- `Em Análise` - Em análise técnica pelo órgão
- `Pendência` - Aguardando ajustes do requerente (prazo pausado)
- `Vistoria Agendada` - Vistoria técnica agendada
- `Emitido` - Licença emitida
- `Indeferido` - Processo indeferido

### Sistema de SLA (Semáforo)
- **🟢 Verde**: Prazo em dia (> 5 dias restantes)
- **🟡 Amarelo**: Prazo curto (≤ 5 dias restantes)
- **🔴 Vermelho**: Prazo vencido
- **⚪ Cinza**: Processo finalizado (Emitido/Indeferido)

### Lógica de Prazos
- Quando o processo está em **Pendência**, o prazo do órgão é pausado
- O prazo do requerente começa a contar (15 dias)
- Quando o requerente responde, o prazo do órgão é retomado
- Cada atividade tem prazos específicos definidos

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento com hot-reload
- `npm run build` - Gera build otimizado para produção na pasta `dist/`
- `npm run preview` - Preview local da build de produção
- `npm run lint` - Executa ESLint para verificar qualidade do código

## 🗂️ Rotas da Aplicação

- `/` - Dashboard (página inicial)
- `/new` - Novo Processo (wizard de criação)
- `/process/:id` - Detalhes do Processo
- `/admin` - Gestão Municipal (visão administrativa)
- `/settings` - Configurações do usuário

## 🎯 Fluxo de Trabalho

1. **Criação do Processo**
   - Empreendedor acessa "Novo Processo"
   - Preenche dados do requerente e seleciona atividade
   - Responde questões técnicas específicas
   - Faz upload dos documentos obrigatórios
   - Protocola o pedido

2. **Análise pelo Órgão**
   - Gestor visualiza o processo no Dashboard ou Admin
   - Inicia análise técnica
   - Se necessário, solicita ajustes (cria pendência)
   - Agenda vistoria quando aplicável
   - Emite licença ou indefere

3. **Acompanhamento**
   - Empreendedor acompanha status no Dashboard
   - Visualiza prazos e pendências
   - Recebe notificações sobre mudanças de status
   - Acessa documentos e histórico completo

## 🚧 Próximas Melhorias

- [ ] Autocadastro do empreendedor.
- [ ] Armazenamento e exibição de TR.
- [ ] Cadastro de usuários do órgão.
- [ ] Agendamento por parte do empreendedor.
- [ ] Calendário de vistoria por parte do gestor.
- [ ] Integração com API backend.
- [ ] Autenticação e autorização.
- [ ] Upload real de documentos.
- [ ] Notificações em tempo real.

## 🔧 Requisitos do Sistema

- **Node.js**: Versão 18 ou superior
- **npm**: Versão 9 ou superior (ou yarn/pnpm compatível)
- **Navegadores suportados**:
  - Chrome/Edge (últimas 2 versões)
  - Firefox (últimas 2 versões)
  - Safari (últimas 2 versões)
  - Navegadores mobile (iOS Safari, Chrome Mobile)

## 📄 Licença

Este projeto é privado e de uso interno.

## 👥 Contribuindo

Este é um projeto interno. Para contribuições, entre em contato com a equipe de desenvolvimento.

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação técnica ou entre em contato com a equipe responsável.
