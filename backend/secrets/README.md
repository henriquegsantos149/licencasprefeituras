# 🔐 Secrets Directory

Este diretório contém os arquivos de secrets (dados sensíveis) da aplicação.

## 📋 Estrutura

Cada secret é armazenado em um arquivo separado, nomeado com a chave do secret:

```
secrets/
├── DATABASE_PASSWORD    # Senha do banco de dados
├── SECRET_KEY           # Chave secreta para JWT
└── ...                 # Outros secrets conforme necessário
```

## 🚀 Configuração Inicial

### 1. Criar arquivos de secrets

```bash
cd backend/secrets
cp DATABASE_PASSWORD.template DATABASE_PASSWORD
cp SECRET_KEY.template SECRET_KEY
```

### 2. Editar com valores reais

Edite cada arquivo com o valor real do secret:

```bash
# Editar senha do banco
echo "sua-senha-aqui" > DATABASE_PASSWORD

# Editar chave secreta (gere uma forte)
python -c "import secrets; print(secrets.token_urlsafe(32))" > SECRET_KEY
```

Ou use um editor de texto:

```bash
nano DATABASE_PASSWORD
nano SECRET_KEY
```

## 🔒 Segurança

- ✅ Arquivos template (`.template`) são commitados
- ✅ Arquivos reais de secrets **NUNCA** são commitados (estão no `.gitignore`)
- ✅ O diretório `secrets/` tem permissões restritas (700)
- ✅ Cada secret está em um arquivo separado para melhor organização

## 📝 Secrets Disponíveis

### DATABASE_PASSWORD
Senha do banco de dados PostgreSQL.

**Exemplo:**
```
postgres
```

### SECRET_KEY
Chave secreta usada para assinar tokens JWT. Deve ser uma string aleatória forte.

**Como gerar:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Exemplo:**
```
xK9mP2qR7vT4wY8zA1bC3dE5fG6hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC0dE
```

## ➕ Adicionar Novos Secrets

1. Crie um arquivo `.template`:
   ```bash
   echo "valor-exemplo" > secrets/MY_NEW_SECRET.template
   ```

2. Copie para o arquivo real:
   ```bash
   cp secrets/MY_NEW_SECRET.template secrets/MY_NEW_SECRET
   ```

3. Edite com o valor real:
   ```bash
   nano secrets/MY_NEW_SECRET
   ```

4. Use no código:
   ```python
   from app.secrets import Secrets
   my_secret = Secrets.get_required("MY_NEW_SECRET")
   ```

## ⚠️ Importante

- **NUNCA** commite arquivos de secrets reais
- **SEMPRE** use arquivos `.template` como base
- **MANTENHA** os secrets seguros e não compartilhe
- **ALTERE** os secrets em produção para valores únicos e fortes
