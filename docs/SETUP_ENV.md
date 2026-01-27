# 🔧 Setup Rápido do Ambiente

Se você está vendo erros sobre arquivos `.env` ou `secrets/` não encontrados, execute este setup:

## 🚀 Setup Automático (Recomendado)

```bash
npm run setup
```

Este comando irá criar automaticamente:
- ✅ `backend/.env` a partir de `.env.example`
- ✅ `backend/secrets/DATABASE_PASSWORD` se não existir
- ✅ `backend/secrets/SECRET_KEY` se não existir (gera uma chave aleatória)

Este script irá:
- ✅ Criar `.env` a partir de `.env.example`
- ✅ Criar `secrets/DATABASE_PASSWORD` se não existir
- ✅ Criar `secrets/SECRET_KEY` se não existir (gera uma chave aleatória)

## 📝 Setup Manual

Se preferir fazer manualmente:

### 1. Criar arquivo .env

```bash
cd backend
cp .env.example .env
```

### 2. Configurar secrets

```bash
cd backend/secrets

# Se não existir, criar DATABASE_PASSWORD
cp DATABASE_PASSWORD.template DATABASE_PASSWORD
# Edite com sua senha do banco

# Se não existir, criar SECRET_KEY
cp SECRET_KEY.template SECRET_KEY
# Ou gere uma chave forte:
python3 -c "import secrets; print(secrets.token_urlsafe(32))" > SECRET_KEY
```

## ✅ Verificação

Após o setup, verifique se os arquivos existem:

```bash
# Verificar .env
ls -la backend/.env

# Verificar secrets
ls -la backend/secrets/DATABASE_PASSWORD
ls -la backend/secrets/SECRET_KEY
```

## 🚀 Próximo Passo

Depois de configurar, execute:

```bash
npm run dev
```
