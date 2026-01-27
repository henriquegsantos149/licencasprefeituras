# 🔄 Guia de Migrations - Alembic

Este documento explica como usar o sistema de migrations do Alembic no projeto.

## 📋 Visão Geral

O projeto usa **Alembic** para gerenciar mudanças no esquema do banco de dados PostgreSQL. Isso permite:

- ✅ Versionamento do esquema do banco
- ✅ Migrations reversíveis (upgrade/downgrade)
- ✅ Sincronização entre ambientes (dev, staging, produção)
- ✅ Histórico de mudanças

## 🚀 Primeira Configuração

### 1. Criar Migration Inicial

Após criar os modelos pela primeira vez:

```bash
python execution/create_initial_migration.py
```

Isso criará um arquivo em `alembic/versions/` com todas as tabelas iniciais.

### 2. Revisar a Migration

Antes de aplicar, sempre revise o arquivo gerado em `alembic/versions/`:

```python
def upgrade():
    # Verifique se as mudanças estão corretas
    op.create_table('users', ...)
    # ...

def downgrade():
    # Verifique se a reversão está correta
    op.drop_table('users')
    # ...
```

### 3. Aplicar a Migration

```bash
python execution/run_migrations.py upgrade
```

Ou diretamente:

```bash
cd backend
alembic upgrade head
```

## 📝 Workflow de Desenvolvimento

### Criar Nova Migration

1. **Modifique os modelos** em `app/models/`:
   ```python
   class User(Base):
       # Adicione novos campos
       new_field = Column(String, nullable=True)
   ```

2. **Gere a migration**:
   ```bash
   cd backend
   alembic revision --autogenerate -m "add new_field to users"
   ```

3. **Revise o arquivo gerado** em `alembic/versions/`

4. **Aplique a migration**:
   ```bash
   alembic upgrade head
   ```

### Exemplo Completo

```bash
# 1. Modificar modelo
# Edite app/models/user.py

# 2. Criar migration
cd backend
alembic revision --autogenerate -m "add phone verification to users"

# 3. Revisar alembic/versions/XXXX_add_phone_verification_to_users.py

# 4. Aplicar
alembic upgrade head
```

## 🔧 Comandos Úteis

### Ver Status Atual

```bash
alembic current
```

### Ver Histórico

```bash
alembic history
```

### Aplicar Todas as Migrations

```bash
alembic upgrade head
```

### Reverter Última Migration

```bash
alembic downgrade -1
```

### Reverter para Revision Específica

```bash
alembic downgrade <revision_id>
```

### Ver SQL que Será Executado (sem aplicar)

```bash
alembic upgrade head --sql
```

## 📁 Estrutura de Arquivos

```
backend/
├── alembic/
│   ├── env.py              # Configuração do Alembic
│   ├── script.py.mako      # Template para migrations
│   └── versions/           # Arquivos de migration
│       └── XXXX_initial_migration.py
├── alembic.ini             # Configuração principal
└── app/
    └── models/            # Modelos SQLAlchemy
```

## ⚠️ Boas Práticas

1. **Sempre revise migrations** antes de aplicar
2. **Teste downgrade** antes de fazer commit
3. **Use mensagens descritivas** ao criar migrations
4. **Não edite migrations já aplicadas** - crie uma nova
5. **Faça backup** antes de migrations em produção
6. **Teste em ambiente de desenvolvimento** primeiro

## 🐛 Troubleshooting

### Erro: "Target database is not up to date"

Aplique as migrations pendentes:

```bash
alembic upgrade head
```

### Erro: "Can't locate revision identified by 'XXXX'"

Verifique o histórico:

```bash
alembic history
```

E sincronize com o banco:

```bash
alembic stamp head
```

### Migration não detecta mudanças

Certifique-se de:
- Importar todos os modelos em `alembic/env.py`
- Usar `--autogenerate` ao criar migration
- Verificar se os modelos estão corretos

## 🔄 Migrations em Produção

1. **Backup do banco** antes de aplicar
2. **Teste em staging** primeiro
3. **Aplique durante janela de manutenção**
4. **Monitore logs** durante aplicação
5. **Tenha plano de rollback** pronto

```bash
# Em produção
alembic upgrade head

# Se algo der errado
alembic downgrade -1
```

## 📋 Migrations Existentes

### Migrations Aplicadas

1. **49276bf7c3fa_initial_migration_create_all_tables**
   - Criação inicial de todas as tabelas (users, activities, processes, etc.)

2. **add_user_preferences**
   - Adiciona suporte a preferências de usuário

3. **convert_preferences_to_table**
   - Converte preferências de JSON para tabela separada

4. **add_company_relationships** (revision: add_company_relationships)
   - Cria tabela `companies`
   - Cria tabela `company_activities` (N:N)
   - Adiciona `company_id` em `processes`
   - Migra dados existentes

5. **update_roles_to_licenciador** (revision: update_roles_to_licenciador)
   - Atualiza enum `userrole`: GESTOR → LICENCIADOR
   - Migra usuários existentes

6. **create_roles_and_permissions** (revision: create_roles_and_permissions)
   - Cria tabelas `roles`, `permissions`, `role_permissions`
   - Insere roles e permissões padrão
   - Adiciona `role_id` em `users`
   - Migra dados de `role` (enum) para `role_id` (FK)

### Ordem de Aplicação

As migrations devem ser aplicadas na seguinte ordem:

```bash
alembic upgrade head
```

O Alembic gerencia automaticamente a ordem baseado em `down_revision`.

## 📚 Referências

- [Documentação Alembic](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Migrations](https://docs.sqlalchemy.org/en/14/core/metadata.html)
