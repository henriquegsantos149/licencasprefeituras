# 📦 Instalação de Dependências Python

Se você está vendo o erro `ModuleNotFoundError: No module named 'alembic'`, significa que as dependências do Python não estão instaladas.

## 🚀 Instalação Rápida

### 1. Criar ambiente virtual (se ainda não criou)

```bash
cd backend
python3 -m venv venv
```

### 2. Ativar ambiente virtual

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Verificar instalação

```bash
python -c "import alembic; print('✅ Alembic instalado')"
python -c "import fastapi; print('✅ FastAPI instalado')"
```

## 🔄 Comandos Completos (Copy & Paste)

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
npm run dev
```

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..
npm run dev
```

## ⚠️ Problemas Comuns

### Erro: "python3: command not found"

Use `python` ao invés de `python3`:
```bash
python -m venv venv
```

### Erro: "pip: command not found"

Instale pip primeiro ou use:
```bash
python3 -m ensurepip --upgrade
```

### Erro: "Permission denied"

Use `--user` flag:
```bash
pip install --user -r requirements.txt
```

Ou use o ambiente virtual (recomendado).

## ✅ Após Instalação

Depois de instalar as dependências, você pode executar:

```bash
npm run dev
```

O sistema irá:
1. ✅ Verificar dependências
2. ✅ Aplicar migrations
3. ✅ Iniciar backend
4. ✅ Iniciar frontend
