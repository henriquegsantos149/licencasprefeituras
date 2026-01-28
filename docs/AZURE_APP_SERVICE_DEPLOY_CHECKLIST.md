# Checklist de Deploy na Azure (App Service) — Licenciamento Digital (via Portal)

Este checklist cobre o deploy do **backend (FastAPI)** em **Azure App Service (Linux)** e do **banco (PostgreSQL)** em **Azure Database for PostgreSQL Flexible Server**.  
Para o **frontend (Vite/React)**, há duas opções: **Static Web Apps (recomendado)** ou **App Service (Node)**.

> Este documento assume que você vai fazer **tudo pelo Portal da Azure** (UI). Onde fizer sentido, há uma seção opcional ao final com **CLI** como alternativa.

---

## ✅ Pré-requisitos

- [x] Acesso ao **Portal da Azure** com permissão para criar recursos (RG, App Service, PostgreSQL)
- [x] Repositório pronto para build/deploy:
  - [x] `node_modules/` **não** está versionado (já está no `.gitignore`)
  - [x] Backend tem `backend/requirements.txt`
  - [x] Endpoint de saúde existe (o backend já tem `GET /health`)

---

## ✅ Banco de dados (PostgreSQL Flexible Server)

### 1) Resource Group

- [x] Criar/Reusar Resource Group (já existe)
  - Portal: **Resource groups** → **Create**
  - Preencha: **Subscription**, **Resource group name** (ex: `rg-licencas`), **Region**

### 2) PostgreSQL Flexible Server

- [x] Criar PostgreSQL Flexible Server (já existe)
  - Portal: **Create a resource** → procure **Azure Database for PostgreSQL Flexible Server** → **Create**
  - Aba **Basics**:
    - [ ] **Server name** (ex: `pg-licencas`)
    - [ ] **Region**
    - [ ] **Workload type** (Dev/Test ou Production)
    - [ ] **Compute + storage** (ex: Burstable para dev)
    - [ ] **Admin username** (ex: `postgresadmin`)
    - [ ] **Password** (forte)
  - Aba **Networking**:
    - [x] Defina o acesso **Private/VNet (VNet integration)** (confirmado)
  - Aba **Review + create** → **Create**

### 3) Criar database

- [x] Criar o database `licencas_prefeituras` (já aparece na listagem)
  - Portal: **PostgreSQL flexible server** → (seu server) → **Databases** → **Add**

### 4) Rede/segurança/backup (mínimo)

- [ ] Configurar rede/acesso:
  - [ ] **Private access / VNet**:
    - [ ] Confirmar que existe **Private DNS zone** vinculada à VNet (ex.: `privatelink.postgres.database.azure.com`)
    - [ ] Confirmar que o servidor Postgres está usando **Private endpoint / private access** (sem acesso público)
    - [ ] Garantir que o **App Service (backend)** fará **VNet Integration** na mesma VNet (ver seção do Backend)
  - [ ] **Public access (se aplicável)**: liberar somente o necessário via firewall (IP do App Service) — não recomendado se você já está em VNet
  - [ ] **TLS** habilitado (padrão Azure)
  - [ ] **Backups** habilitados e retenção definida

- [ ] Se for usar **Public access**, crie uma regra de firewall para seu IP:
  - Portal: seu **PostgreSQL server** → **Networking** → **Firewall rules** → **Add current client IP address**

---

## ✅ Backend (FastAPI) no Azure App Service (Linux)

### 1) Criar App Service

- [ ] Criar App Service
  - Portal: **Create a resource** → **Web App** → **Create**
  - Aba **Basics**:
    - [ ] **Publish** = Code
    - [ ] **Runtime stack** = Python 3.11
    - [ ] **Operating System** = Linux
    - [ ] **Region**
    - [ ] **App Service Plan** (crie um novo se necessário)
    - [ ] **Name** (ex: `api-licencas-<unico>`)
  - **Review + create** → **Create**

### 2) Configurar Application Settings (env vars)

No Portal: **Web App > Configuration > Application settings**, configurar:

- [ ] `DATABASE_HOST` = `pg-licencas.postgres.database.azure.com` (exemplo)
- [ ] `DATABASE_PORT` = `5432`
- [ ] `DATABASE_NAME` = `licencas_prefeituras`
- [ ] `DATABASE_USER` = `postgresadmin`
- [ ] `CORS_ORIGINS` = `https://<dominio-frontend>` (sem `localhost` em produção)
- [ ] `ENVIRONMENT` = `production`
- [ ] (opcional) `API_V1_PREFIX` = `/api/v1`

### 3) Secrets (CRÍTICO)

O backend agora aceita secrets via **env vars** (Application Settings / Key Vault) e faz **fallback** para arquivos em `backend/secrets/`:
- `DATABASE_PASSWORD`
- `SECRET_KEY`

Escolha **um** dos caminhos:

- [x] **Opção A (recomendada)**: backend aceita secrets via **env vars** (App Settings / Key Vault).
- [ ] **Opção B (sem alterar código)**: montar um diretório (Storage Mount) com os arquivos:
  - [ ] `/home/site/wwwroot/secrets/DATABASE_PASSWORD`
  - [ ] `/home/site/wwwroot/secrets/SECRET_KEY`

> Observação: em App Service Linux, o app roda sob `/home/site/wwwroot`. Garanta que o backend enxergue o diretório de secrets esperado.

**Como configurar a Opção A no Portal (Application Settings / Key Vault):**
- [ ] Web App → **Settings > Configuration > Application settings** → **New application setting**
  - [ ] `DATABASE_PASSWORD` = `<senha do banco>` **ou** use referência do Key Vault
  - [ ] `SECRET_KEY` = `<chave JWT forte>` **ou** use referência do Key Vault
- [ ] Salvar e **Restart** no Web App

> Nota: referências do Key Vault no App Service são resolvidas em runtime e ficam disponíveis como variáveis de ambiente, então o backend consegue ler normalmente.

**Se você escolher a Opção B (Storage Mount):**
- [ ] Criar um **Storage Account** (se ainda não tiver)
- [ ] Criar um **File share** (Azure Files) e colocar dentro dele os arquivos:
  - [ ] `DATABASE_PASSWORD` (conteúdo: senha do banco)
  - [ ] `SECRET_KEY` (conteúdo: chave JWT)
- [ ] No Web App: **Settings > Configuration > Path mappings > New Azure Storage Mount**
  - [ ] **Mount path** = `/home/site/wwwroot/secrets`
  - [ ] **Storage type** = Azure Files
  - [ ] Aponte para o share criado

### 4) Comando de inicialização (Startup Command)

No Portal: **Web App > Configuration > General settings > Startup Command**:

- [ ] Definir:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 5) Deploy do código (monorepo)

Você pode publicar via **GitHub Actions** (recomendado) ou pelo Portal.

#### Opção A (recomendada) — GitHub Actions

- [ ] Criar o workflow no repositório
  - [x] Workflow criado em `.github/workflows/deploy-backend-azure-appservice.yml`
  - [ ] Editar no workflow o `AZURE_WEBAPP_NAME` (nome do seu Web App)
- [ ] Criar secret no GitHub:
  - Portal → seu **Web App** → **Get publish profile** (baixar o arquivo)
  - GitHub → **Settings > Secrets and variables > Actions > New repository secret**
    - [ ] `AZURE_WEBAPP_PUBLISH_PROFILE` = conteúdo do publish profile (XML)
- [ ] Habilitar build durante o deploy (necessário para instalar `requirements.txt`):
  - Portal → Web App → **Configuration > Application settings**
    - [ ] `SCM_DO_BUILD_DURING_DEPLOYMENT` = `true`
  - Salvar e **Restart**
- [ ] Fazer push para `main` (ou rodar manualmente em **Actions > workflow_dispatch**)

#### Opção B — Deployment Center (GitHub)
- [ ] Web App → **Deployment Center**
- [ ] Source = **GitHub** (ou Azure Repos)
- [ ] Selecione **repo** e **branch**
- [ ] Garanta que o workflow publique **a pasta `backend/`** (monorepo)
- [ ] Verifique logs do build/deploy no próprio Deployment Center

#### Opção C — Advanced Tools (Kudu) / Zip Deploy
- [ ] Web App → **Advanced Tools** → **Go** (abre o Kudu)
- [ ] Use **Zip Deploy** para enviar o artefato do backend

> Importante: este projeto é monorepo. Para App Service Python, o conteúdo publicado deve corresponder ao que o runtime espera (normalmente o diretório do backend).

---

## ✅ Migrations (Alembic) e Seed inicial

O backend **não** cria tabelas automaticamente; é via **Alembic**.

- [ ] Rodar migrations no banco Azure:
  - [ ] `alembic upgrade head`
- [ ] Rodar seed inicial (se necessário):
  - [ ] `python execution/seed_data.py` (ou o fluxo equivalente em produção)

Opções práticas:
- [ ] Rodar via **SSH/Console do App Service** (com cuidado)
- [ ] Rodar via **pipeline CI/CD** (recomendado)
- [ ] Rodar localmente apontando para o Postgres Azure (menos recomendado para times)

No Portal (opção prática):
- [ ] Web App → **SSH**
  - [ ] Rodar `alembic upgrade head`
  - [ ] (se aplicável) rodar o seed apropriado

---

## ✅ Frontend (Vite/React) — escolha uma estratégia

### Opção 1 (recomendada): Azure Static Web Apps

- [ ] Portal: **Create a resource** → **Static Web App**
- [ ] Conectar com GitHub e configurar build
  - [ ] **App location** (raiz do frontend)
  - [ ] **Output location** = `dist`
- [ ] Configurar roteamento SPA (fallback para `index.html`)

### Opção 2: App Service (Node)

- [ ] Criar Web App (Node)
  - Portal: **Create a resource** → **Web App**
  - **Runtime stack** = Node 20 LTS (Linux)

- [ ] Definir variável do Vite (build-time):
  - [ ] `VITE_API_URL` = `https://api-licencas-<unico>.azurewebsites.net/api/v1`

- [ ] Garantir que o frontend use a API correta:
  - [ ] O projeto já suporta `import.meta.env.VITE_API_URL`

---

## ✅ Validação pós-deploy

- [ ] API responde:
  - [ ] `GET /health` retorna 200
  - [ ] `GET /docs` abre o Swagger (se habilitado)
- [ ] Banco conecta:
  - [ ] Logs não mostram erro de conexão
  - [ ] Migrações aplicadas (tabelas existem)
- [ ] Autenticação:
  - [ ] `POST /api/v1/auth/register` funciona
  - [ ] `POST /api/v1/auth/login` retorna token
- [ ] CORS:
  - [ ] Sem erro de CORS no browser
  - [ ] `CORS_ORIGINS` contém exatamente o(s) domínio(s) do frontend

---

## ✅ Observabilidade e operação

- [ ] **Logs** do App Service habilitados (Application Logging)
- [ ] **Health check** configurado apontando para `/health`
- [ ] **Alertas** (CPU/memória/5xx/latência)
- [ ] **Backups** do PostgreSQL revisados e testados
- [ ] **Rotação de secrets** (idealmente via Key Vault)

---

## (Opcional) CLI como alternativa rápida

Se em algum momento você quiser automatizar via CLI, você pode usar os comandos equivalentes (exemplos) abaixo:

```bash
az group create -n rg-licencas -l eastus

az postgres flexible-server create \
  -g rg-licencas \
  -n pg-licencas \
  -l eastus \
  --tier Burstable --sku-name Standard_B1ms \
  --storage-size 32 \
  --version 15

az appservice plan create -g rg-licencas -n plan-licencas --is-linux --sku B1
```

