# 🚀 Guia de Setup Completo - Licenciamento Digital

Este documento fornece um guia passo a passo para configurar todo o ambiente de desenvolvimento do projeto.

## 📋 Visão Geral

O projeto consiste em:
- **Frontend**: React + Vite (já configurado)
- **Backend**: Python + FastAPI (novo)
- **Banco de Dados**: PostgreSQL com migrations via Alembic (novo)

## 🗂️ Estrutura do Projeto

```
licencasprefeituras/
├── backend/              # Backend Python/FastAPI
│   ├── app/
│   │   ├── main.py       # Aplicação FastAPI
│   │   ├── models/       # Modelos de banco de dados
│   │   ├── schemas/      # Schemas Pydantic
│   │   ├── routers/      # Rotas da API
│   │   ├── config.py     # Configurações
│   │   └── secrets.py    # Gerenciamento de secrets
│   ├── alembic/          # Migrations do banco de dados
│   ├── requirements.txt
│   ├── .env.example      # Configurações não-sensíveis
│   └── secrets/           # Secrets (senhas, chaves) - um arquivo por secret
├── execution/            # Scripts de execução
│   ├── init_database.py
│   ├── create_initial_migration.py
│   ├── run_migrations.py
│   ├── seed_data.py
│   └── run_server.py
├── src/                  # Frontend React
├── docker-compose.yml    # PostgreSQL via Docker
└── README_BACKEND.md     # Documentação detalhada do backend
```

## 🚀 Setup Rápido

### 1. Configurar PostgreSQL

**Opção A: Docker (Recomendado)**

```bash
docker-compose up -d postgres
```

**Opção B: Instalação Manual**

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Criar banco
./execution/setup_postgres.sh
```

### 2. Configurar Backend

```bash
# Criar ambiente virtual
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com configurações não-sensíveis

# Configurar secrets
cd secrets
cp DATABASE_PASSWORD.template DATABASE_PASSWORD
cp SECRET_KEY.template SECRET_KEY
# Edite cada arquivo com valores reais
cd ..
```

### 3. Criar e Aplicar Migrations

```bash
# Criar migration inicial
python execution/create_initial_migration.py

# Aplicar migrations e seed dados
python execution/init_database.py
```

### 4. Iniciar Servidores

**Opção A: Tudo de uma vez (Recomendado)**

```bash
npm run dev
```

Este comando irá:
- ✅ Verificar e aplicar migrations automaticamente
- 🚀 Iniciar o backend em http://localhost:8000
- 🚀 Iniciar o frontend em http://localhost:5173

**Opção B: Separadamente**

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Ou: python execution/run_server.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# Ou: npm run dev (se backend já estiver rodando)
```

## 🔗 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## 🔐 Sistema de Secrets

O projeto separa configurações em dois arquivos:

### `.env` (Configurações não-sensíveis)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=licencas_prefeituras
DATABASE_USER=postgres
CORS_ORIGINS=http://localhost:5173
```

### `secrets/` (Dados sensíveis - NUNCA commitar)

Cada secret em um arquivo separado:
```
secrets/
├── DATABASE_PASSWORD    # Senha do banco
└── SECRET_KEY           # Chave JWT
```

**Configurar:**
```bash
cd backend/secrets
cp DATABASE_PASSWORD.template DATABASE_PASSWORD
cp SECRET_KEY.template SECRET_KEY
# Edite cada arquivo com valores reais
```

**⚠️ IMPORTANTE**: 
- `.secrets` está no `.gitignore`
- Gere uma `SECRET_KEY` forte:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

## 🔄 Migrations

O banco de dados usa **Alembic** para migrations:

```bash
# Criar nova migration
cd backend
alembic revision --autogenerate -m "descrição"

# Aplicar migrations
python execution/run_migrations.py upgrade

# Ver histórico
python execution/run_migrations.py history
```

Veja `docs/MIGRATIONS.md` para documentação completa.

## 📝 Próximos Passos

1. **Integrar Frontend com Backend**
   - Atualizar `AuthContext` para usar a API
   - Atualizar `WorkflowContext` para usar a API
   - Substituir localStorage por chamadas HTTP

2. **Configurar Variáveis de Ambiente no Frontend**
   - Criar arquivo `.env` no frontend com `VITE_API_URL=http://localhost:8000/api/v1`

3. **Testar Integração**
   - Registrar usuário via API
   - Criar processo via API
   - Verificar dados no banco

## 🐛 Troubleshooting

### Backend não conecta ao banco
- Verifique se PostgreSQL está rodando: `pg_isready` ou `docker ps`
- Verifique secrets no `.secrets` (não no `.env`)

### Erro: "Required secret 'XXX' not found"
- Certifique-se de que `secrets/` existe e tem todos os arquivos
- Copie os arquivos `.example` se necessário:
  ```bash
  cd backend/secrets
  cp DATABASE_PASSWORD.example DATABASE_PASSWORD
  cp SECRET_KEY.example SECRET_KEY
  ```

### Erro de migration
- Verifique se a migration inicial foi criada
- Revise o arquivo de migration antes de aplicar
- Veja `docs/MIGRATIONS.md` para mais ajuda

### Erro de importação no Python
- Certifique-se de estar no ambiente virtual: `source venv/bin/activate`
- Reinstale dependências: `pip install -r requirements.txt`

### CORS errors no frontend
- Verifique se `CORS_ORIGINS` no `.env` inclui `http://localhost:5173`

## 📚 Documentação Adicional

- **Backend detalhado**: Veja `docs/README_BACKEND.md`
- **Migrations**: Veja `docs/MIGRATIONS.md`
- **API Docs**: http://localhost:8000/docs (após iniciar o servidor)
- **Frontend**: Veja `README.md` na raiz

## ✅ Checklist de Setup

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `licencas_prefeituras` criado
- [ ] Ambiente virtual Python criado
- [ ] Dependências do backend instaladas
- [ ] Arquivo `.env` configurado (não-sensível)
- [ ] Diretório `secrets/` configurado com arquivos individuais (sensível)
- [ ] Migration inicial criada
- [ ] Migrations aplicadas (`alembic upgrade head`)
- [ ] Dados iniciais seedados
- [ ] Backend rodando em http://localhost:8000
- [ ] Frontend rodando em http://localhost:5173
- [ ] API Docs acessível em http://localhost:8000/docs
