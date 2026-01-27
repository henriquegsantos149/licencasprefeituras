# 📜 Scripts de Desenvolvimento

Este documento explica os scripts disponíveis para desenvolvimento.

## 🚀 Scripts Principais

### `npm run dev`

Inicia o ambiente completo de desenvolvimento:
1. ✅ Verifica se os arquivos `.env` e `.secrets` existem
2. 🔍 Verifica e aplica migrations do banco de dados
3. 🚀 Inicia o servidor backend (porta 8000)
4. 🚀 Inicia o servidor frontend (porta 5173)

**Uso:**
```bash
npm run dev
```

**O que acontece:**
- Se as migrations não estiverem aplicadas, elas serão aplicadas automaticamente
- Backend inicia em http://localhost:8000
- Frontend inicia em http://localhost:5173
- Ambos os servidores rodam em paralelo
- Use `Ctrl+C` para parar ambos

### `npm run dev:frontend`

Inicia apenas o servidor frontend (sem backend).

```bash
npm run dev:frontend
```

### `npm run dev:backend`

Inicia apenas o servidor backend com verificação de migrations.

```bash
npm run dev:backend
```

## 📁 Estrutura de Scripts

```
scripts/
├── start-dev.js        # Script principal - inicia frontend + backend
├── start-backend.js    # Script para iniciar apenas o backend
└── check-migrations.js # Script para verificar migrations
```

## 🔧 Requisitos

Para que `npm run dev` funcione corretamente:

1. **Python instalado** (3.9+)
2. **PostgreSQL rodando**
3. **Arquivo `.env`** configurado em `backend/`
4. **Arquivo `.secrets`** configurado em `backend/`
5. **Dependências Python instaladas**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

## 🐛 Troubleshooting

### Erro: "secrets/ directory not found" ou "Required secret files not found"

Configure os secrets:
```bash
cd backend/secrets
cp DATABASE_PASSWORD.template DATABASE_PASSWORD
cp SECRET_KEY.template SECRET_KEY
# Edite cada arquivo com valores reais
```

Veja `backend/secrets/README.md` para instruções detalhadas.

### Erro: ".env file not found"

Crie o arquivo de configuração:
```bash
cd backend
cp .env.example .env
# Edite .env com suas configurações
```

### Erro: "Migration failed"

Verifique:
- PostgreSQL está rodando
- Credenciais no `.secrets` estão corretas
- Banco de dados foi criado

Execute migrations manualmente:
```bash
python execution/run_migrations.py upgrade
```

### Erro: "Failed to start backend server"

Verifique:
- Python está instalado
- Dependências estão instaladas: `cd backend && pip install -r requirements.txt`
- Porta 8000 não está em uso

### Erro: "Failed to start frontend"

Verifique:
- Node.js está instalado
- Dependências npm estão instaladas: `npm install`
- Porta 5173 não está em uso

## 💡 Dicas

- O script aguarda 3 segundos após iniciar o backend antes de iniciar o frontend
- Use `Ctrl+C` uma vez para parar ambos os servidores graciosamente
- Os logs do backend e frontend aparecem no mesmo terminal
- Para ver apenas um servidor, use `npm run dev:frontend` ou `npm run dev:backend`
