# Backend API - Licenciamento Digital

Backend em Python usando FastAPI para comunicação com o frontend React.

## 🚀 Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **PostgreSQL** - Banco de dados relacional
- **SQLAlchemy** - ORM para Python
- **Alembic** - Migrações de banco de dados
- **JWT** - Autenticação com tokens
- **Pydantic** - Validação de dados

## 📋 Pré-requisitos

1. **Python 3.9+** instalado
2. **PostgreSQL** instalado e rodando
3. **pip** ou **pipenv** para gerenciamento de dependências

## 🛠️ Instalação

### 1. Criar ambiente virtual

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

### 2. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar banco de dados PostgreSQL

Certifique-se de que o PostgreSQL está rodando e crie o banco de dados:

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE licencas_prefeituras;

# Sair do psql
\q
```

### 4. Configurar variáveis de ambiente e secrets

**Configurar arquivo `.env` (configurações não-sensíveis):**

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=licencas_prefeituras
DATABASE_USER=postgres

API_V1_PREFIX=/api/v1
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development
```

**Configurar secrets (dados sensíveis):**

Cada secret é armazenado em um arquivo separado na pasta `secrets/`:

```bash
cd backend/secrets
cp DATABASE_PASSWORD.template DATABASE_PASSWORD
cp SECRET_KEY.template SECRET_KEY
```

Edite cada arquivo com o valor real:

```bash
# Editar senha do banco
echo "postgres" > DATABASE_PASSWORD

# Gerar e editar chave secreta
python -c "import secrets; print(secrets.token_urlsafe(32))" > SECRET_KEY
```

**⚠️ IMPORTANTE**: 
- Os arquivos de secrets estão no `.gitignore` e NUNCA devem ser commitados
- Apenas arquivos `.example` são commitados
- Veja `backend/secrets/README.md` para mais detalhes

### 5. Criar migration inicial

Primeiro, crie a migration inicial:

```bash
# A partir da raiz do projeto
python execution/create_initial_migration.py
```

Isso criará um arquivo de migration em `backend/alembic/versions/`. Revise o arquivo antes de aplicar.

### 6. Aplicar migrations e inicializar banco de dados

Execute o script de inicialização:

```bash
# A partir da raiz do projeto
python execution/init_database.py
```

Este script irá:
- ✅ Aplicar todas as migrations (criar tabelas)
- ✅ Popular com atividades iniciais (Laticínio, Posto de Combustível, Pequeno Porte)

**Alternativamente, você pode executar os passos manualmente:**

```bash
# Aplicar migrations
python execution/run_migrations.py upgrade

# Seed dados iniciais
python execution/seed_data.py
```

## 🚀 Executar o servidor

### Opção 1: Usando o script de execução

```bash
# A partir da raiz do projeto
python execution/run_server.py
```

### Opção 2: Usando uvicorn diretamente

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Opção 3: Usando o script shell

```bash
cd backend
chmod +x run.sh
./run.sh
```

O servidor estará disponível em: `http://localhost:8000`

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Autenticação e Autorização

A API usa JWT (JSON Web Tokens) para autenticação e um sistema de **roles e permissões baseado em banco de dados**.

### Sistema de Roles

O sistema possui três roles principais:
- **empreendedor** (default): Acesso a tudo exceto gestão municipal
- **licenciador**: Acesso à gestão municipal
- **admin**: Acesso total

Para mais detalhes, consulte `ROLES_AND_PERMISSIONS.md`.

### Registrar novo usuário

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "razao_social": "Empresa Teste Ltda",
  "nome_fantasia": "Empresa Teste",
  "role": "empreendedor"  // Opcional - se não especificado, usa role padrão do banco
  "cnpj": "12345678000190",
  "email": "teste@example.com",
  "password": "senha123",
  "confirm_password": "senha123",
  "telefone": "83999999999",
  "endereco": {
    "cep": "58000000",
    "logradouro": "Rua Teste",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "João Pessoa",
    "uf": "PB"
  }
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "teste@example.com",
  "password": "senha123"
}
```

Resposta inclui `access_token` que deve ser usado em requisições autenticadas:

```bash
Authorization: Bearer <access_token>
```

## 📁 Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação FastAPI principal
│   ├── config.py            # Configurações e variáveis de ambiente
│   ├── database.py          # Conexão com banco de dados
│   ├── auth.py              # Utilitários de autenticação
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── user.py
│   │   ├── process.py
│   │   └── activity.py
│   ├── schemas/             # Schemas Pydantic
│   │   ├── user.py
│   │   ├── process.py
│   │   └── activity.py
│   └── routers/             # Rotas da API
│       ├── auth.py
│       ├── users.py
│       ├── processes.py
│       └── activities.py
├── requirements.txt
├── .env.example
└── README.md
```

## 🔌 Endpoints Principais

### Autenticação
- `POST /api/v1/auth/register` - Registrar novo usuário
- `POST /api/v1/auth/login` - Fazer login
- `GET /api/v1/auth/me` - Obter usuário atual

### Usuários
- `GET /api/v1/users/` - Listar usuários
- `GET /api/v1/users/{user_id}` - Obter usuário específico

### Processos
- `POST /api/v1/processes/` - Criar novo processo
- `GET /api/v1/processes/` - Listar processos
- `GET /api/v1/processes/{process_id}` - Obter processo específico
- `PATCH /api/v1/processes/{process_id}` - Atualizar processo
- `GET /api/v1/processes/{process_id}/history` - Obter histórico do processo

### Atividades
- `GET /api/v1/activities/` - Listar atividades disponíveis
- `GET /api/v1/activities/{activity_id}` - Obter atividade específica

## 🗄️ Modelos de Dados

### User
- Representa empreendedores e gestores
- Campos: id, razao_social, cnpj, email, password_hash, role_id (FK para roles), etc.
- Relacionamentos: Role, Company, UserPreferences

### Role
- Representa roles do sistema (empreendedor, licenciador, admin)
- Campos: id, name, description, is_default, is_active
- Relacionamentos: User, Permission (N:N)

### Permission
- Representa permissões do sistema
- Campos: id, name, description, category, is_active
- Relacionamentos: Role (N:N)

### Company
- Representa empresas (pessoa jurídica)
- Campos: id, user_id, razao_social, cnpj, endereco, etc.
- Relacionamentos: User, Activity (N:N), Process

### Process
- Representa um processo de licenciamento
- Campos: id, company_id, activity_id, status, deadlines, etc.
- Relacionamentos: Company, Activity, ProcessDocument, ProcessHistory

### Activity
- Representa tipos de atividades de licenciamento
- Campos: id, name, category, risk_level, required_documents, questions
- Relacionamentos: Company (N:N), Process

### ProcessDocument
- Documentos anexados a um processo
- Campos: id, process_id, document_type, file_path, is_uploaded, etc.

### ProcessHistory
- Histórico de mudanças em um processo
- Campos: id, process_id, action, user, observation, created_at

## 🔄 Migrations do Banco de Dados

O projeto usa **Alembic** para gerenciar migrations do banco de dados.

### Migrations Principais

1. **Initial Migration**: Criação inicial de todas as tabelas
2. **add_company_relationships**: Implementa relacionamentos User → Companies → Activities
3. **create_roles_and_permissions**: Sistema de roles e permissões no banco de dados
4. **update_roles_to_licenciador**: Atualiza role GESTOR para LICENCIADOR

Para mais detalhes, consulte `MIGRATIONS.md`.

### Comandos Úteis

```bash
# Criar nova migration
cd backend
alembic revision --autogenerate -m "descrição da mudança"

# Aplicar migrations
alembic upgrade head

# Reverter última migration
alembic downgrade -1

# Ver histórico de migrations
alembic history

# Ver migration atual
alembic current
```

Ou use os scripts de execução:

```bash
# Aplicar migrations
python execution/run_migrations.py upgrade

# Reverter migration
python execution/run_migrations.py downgrade --revision <revision_id>

# Ver histórico
python execution/run_migrations.py history
```

### Workflow de Migrations

1. **Modificar modelos** em `app/models/`
2. **Criar migration**: `python execution/create_initial_migration.py` (primeira vez) ou `alembic revision --autogenerate -m "descrição"`
3. **Revisar migration** gerada em `alembic/versions/`
4. **Aplicar migration**: `python execution/run_migrations.py upgrade`

## 🔐 Sistema de Secrets

Dados sensíveis (senhas, chaves secretas) são armazenados em arquivos individuais na pasta `secrets/`:
- ✅ Cada secret tem seu próprio arquivo (ex: `secrets/DATABASE_PASSWORD`)
- ✅ Estão no `.gitignore` e nunca são commitados
- ✅ Apenas arquivos `.template` são commitados
- ✅ São carregados automaticamente pela aplicação
- ✅ Separa configuração não-sensível (`.env`) de secrets (`secrets/`)

**Secrets disponíveis:**
- `DATABASE_PASSWORD` - Senha do banco de dados (arquivo: `secrets/DATABASE_PASSWORD`)
- `SECRET_KEY` - Chave secreta para JWT (arquivo: `secrets/SECRET_KEY`)

Veja `secrets/README.md` para documentação completa.

## 🔄 Próximos Passos

1. **Integrar frontend com backend**: Atualizar o frontend para usar a API
2. **Upload de arquivos**: Implementar upload de documentos
3. **Notificações**: Sistema de notificações em tempo real
4. **Relatórios**: Geração de relatórios e dashboards
5. **Testes**: Adicionar testes unitários e de integração

## 🐛 Troubleshooting

### Erro de conexão com banco de dados

Verifique se:
- PostgreSQL está rodando
- Credenciais no `.env` estão corretas
- Banco de dados foi criado

### Erro de importação

Certifique-se de estar no diretório correto e que o ambiente virtual está ativado.

### Erro de CORS

Verifique se a URL do frontend está na lista `CORS_ORIGINS` no arquivo `.env`.
