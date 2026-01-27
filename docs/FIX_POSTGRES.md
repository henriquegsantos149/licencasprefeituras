# 🔧 Corrigir Configuração do PostgreSQL

O erro `role "postgres" does not exist` significa que o PostgreSQL não tem o usuário "postgres" configurado.

## 🚀 Solução Rápida

### Opção 1: Usar npm (Recomendado - Funciona em todos os sistemas)

```bash
npm run fix-postgres
```

Este comando irá:
- ✅ Detectar seu usuário do sistema
- ✅ Testar conexão com esse usuário
- ✅ Atualizar `backend/.env` automaticamente

### Opção 2: Usar script shell

```bash
./execution/fix-postgres-user.sh
```

### Opção 2: Criar usuário postgres

Se preferir usar o usuário "postgres":

```bash
createuser -s postgres
```

Depois, defina uma senha (se necessário):
```bash
psql postgres -c "ALTER USER postgres WITH PASSWORD 'sua-senha';"
```

E atualize `backend/secrets/DATABASE_PASSWORD` com a senha.

### Opção 3: Manual

1. Descubra seu usuário PostgreSQL:
   ```bash
   psql -l
   # Ou tente:
   psql -U $(whoami) -d postgres
   ```

2. Atualize `backend/.env`:
   ```bash
   DATABASE_USER=seu-usuario-aqui
   ```

3. Atualize `backend/secrets/DATABASE_PASSWORD`:
   - Se não precisar de senha (comum no macOS local), deixe vazio
   - Ou coloque sua senha se configurou uma

## 📝 Verificação

Após corrigir, teste a conexão:

```bash
cd backend
source venv/bin/activate
python -c "from app.config import settings; from sqlalchemy import create_engine; engine = create_engine(settings.DATABASE_URL); conn = engine.connect(); print('✅ Conexão OK!'); conn.close()"
```

## 🐳 Usando Docker (Alternativa)

Se preferir usar Docker, o `docker-compose.yml` já está configurado:

```bash
docker-compose up -d postgres
```

Isso criará um PostgreSQL com usuário "postgres" e senha "postgres".
