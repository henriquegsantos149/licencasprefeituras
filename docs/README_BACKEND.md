# 🚀 Guia de Configuração - Backend e Banco de Dados

Este guia explica como configurar o backend Python com FastAPI e o banco de dados PostgreSQL para o projeto Licenciamento Digital.

## 📋 Pré-requisitos

1. **Python 3.9+**
2. **PostgreSQL 12+** (ou use Docker)
3. **pip** para gerenciamento de dependências

## 🐳 Opção 1: Usando Docker (Recomendado)

A forma mais fácil de configurar o PostgreSQL é usando Docker:

```bash
# Iniciar PostgreSQL
docker-compose up -d postgres

# Verificar se está rodando
docker ps
```

O PostgreSQL estará disponível em `localhost:5432` com:
- **Usuário**: `postgres`
- **Senha**: `postgres`
- **Banco**: `licencas_prefeituras`

## 💻 Opção 2: Instalação Manual do PostgreSQL

### macOS (Homebrew)

```bash
brew install postgresql@14
brew services start postgresql@14
```

### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Criar banco de dados manualmente

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE licencas_prefeituras;

# Sair
\q
```

Ou use o script automatizado:

```bash
chmod +x execution/setup_postgres.sh
./execution/setup_postgres.sh
```

## 🔧 Configuração do Backend

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

### 3. Configurar variáveis de ambiente e secrets

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
- Apenas arquivos `.template` são commitados
- Veja `backend/secrets/README.md` para mais detalhes

### 4. Criar migration inicial

Primeiro, crie a migration inicial:

```bash
python execution/create_initial_migration.py
```

Isso criará um arquivo em `backend/alembic/versions/`. Revise o arquivo antes de aplicar.

### 5. Aplicar migrations e inicializar banco de dados

```bash
# A partir da raiz do projeto
python execution/init_database.py
```

Este script irá:
- ✅ Aplicar todas as migrations (criar tabelas via Alembic)
- ✅ Popular com atividades iniciais (Laticínio, Posto de Combustível, Pequeno Porte)

**Alternativamente, execute manualmente:**

```bash
# Aplicar migrations
python execution/run_migrations.py upgrade

# Seed dados iniciais
python execution/seed_data.py
```

### 5. Iniciar o servidor

```bash
# Opção 1: Usando o script de execução
python execution/run_server.py

# Opção 2: Diretamente com uvicorn
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

O servidor estará disponível em: **http://localhost:8000**

## 📚 Documentação da API

Após iniciar o servidor:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Testando a API

### Registrar um usuário

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "razao_social": "Empresa Teste Ltda",
    "nome_fantasia": "Empresa Teste",
    "cnpj": "12345678000190",
    "email": "teste@example.com",
    "password": "senha123",
    "confirm_password": "senha123",
    "telefone": "83999999999"
  }'
```

### Fazer login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

A resposta incluirá um `access_token` que você pode usar em requisições autenticadas.

### Listar processos (autenticado)

```bash
curl -X GET "http://localhost:8000/api/v1/processes/" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

## 🗂️ Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Usuários (empreendedores e gestores)
- **processes**: Processos de licenciamento
- **activities**: Tipos de atividades (Laticínio, Posto, etc.)
- **process_documents**: Documentos anexados aos processos
- **process_history**: Histórico de mudanças nos processos

## 🔄 Próximos Passos

1. **Integrar frontend**: Atualizar o frontend React para usar a API
2. **Upload de arquivos**: Implementar upload de documentos
3. **Testes**: Adicionar testes automatizados

## 🔄 Migrations do Banco de Dados

O projeto usa **Alembic** para gerenciar migrations. Veja `docs/MIGRATIONS.md` para detalhes completos.

**Comandos rápidos:**

```bash
# Criar nova migration
cd backend
alembic revision --autogenerate -m "descrição"

# Aplicar migrations
python execution/run_migrations.py upgrade

# Ver histórico
python execution/run_migrations.py history
```

## 🔐 Sistema de Secrets

Dados sensíveis são armazenados em arquivos individuais na pasta `secrets/` (nunca commitados):
- `secrets/DATABASE_PASSWORD` - Senha do banco de dados
- `secrets/SECRET_KEY` - Chave secreta para JWT

Cada secret tem seu próprio arquivo, facilitando o gerenciamento e a segurança.

Configurações não-sensíveis ficam em `.env`:
- Hosts, portas, URLs, etc.

Veja `backend/secrets/README.md` para documentação completa.

## 🐛 Troubleshooting

### Erro: "could not connect to server"

- Verifique se o PostgreSQL está rodando: `pg_isready`
- Se estiver usando Docker: `docker ps` para verificar o container
- Verifique as credenciais nos arquivos em `secrets/` (não no `.env`)

### Erro: "Required secret 'XXX' not found"

Certifique-se de que o diretório `secrets/` existe e contém todos os arquivos necessários:
```bash
cd backend/secrets
cp DATABASE_PASSWORD.template DATABASE_PASSWORD
cp SECRET_KEY.template SECRET_KEY
# Edite cada arquivo com valores reais
```

Veja `backend/secrets/README.md` para instruções detalhadas.

### Erro: "relation does not exist"

Execute as migrations:
```bash
python execution/run_migrations.py upgrade
```

Ou o script completo:
```bash
python execution/init_database.py
```

### Erro de migration

Se a migration falhar:
```bash
# Ver status atual
python execution/run_migrations.py current

# Ver histórico
python execution/run_migrations.py history
```

### Erro de CORS no frontend

Verifique se a URL do frontend está em `CORS_ORIGINS` no arquivo `.env`.

## 📝 Notas

- O banco de dados usa migrations via Alembic (não cria tabelas automaticamente)
- As atividades iniciais são populadas via `seed_data.py`
- Em produção, use um `SECRET_KEY` forte e seguro (gerado com `secrets.token_urlsafe(32)`)
- Os arquivos de secrets nunca devem ser commitados (estão no `.gitignore`)
- Apenas arquivos `.template` são commitados
- Configure backups regulares do banco de dados PostgreSQL
