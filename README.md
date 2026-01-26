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

2. **Novo Processo**
   - Wizard de 3 etapas para criação de requerimentos
   - Triagem inicial com seleção de atividade
   - Formulários técnicos dinâmicos
   - Upload de documentação obrigatória

3. **Detalhes do Processo**
   - Visualização completa do processo
   - Sistema de abas (Visão Geral, Documentação, Histórico)
   - SLA e prazos com semáforo de status
   - Ações do gestor (Análise, Pendência, Vistoria, Emissão)

4. **Gestão Municipal (Admin)**
   - Visão consolidada de todos os processos
   - KPIs por status (Vencidos, Prazo Curto, Em Dia)
   - Tabela responsiva (desktop) / Cards (mobile)
   - Filtros e busca

5. **Configurações**
   - Perfil do usuário
   - Preferências de notificações
   - Configurações de conta

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

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O projeto estará rodando em `http://localhost:5173`.

### 5. Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### 6. Preview da build

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
- `.btn-primary` - Botão primário com hover e shadow
- `.btn-secondary` - Botão secundário com borda
- `.card` - Card com shadow e hover
- `.input` - Input com focus states

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

O projeto utiliza **React Context API** para gerenciar:
- Lista de processos
- Adição de novos processos
- Atualização de status
- Cálculo de semáforo de prazos (SLA)
- Histórico de alterações

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview da build de produção
- `npm run lint` - Executa ESLint

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

## 📄 Licença

Este projeto é privado e de uso interno.
