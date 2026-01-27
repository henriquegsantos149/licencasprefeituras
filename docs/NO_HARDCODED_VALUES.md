# Sistema 100% Database-Driven - Sem Valores Hardcoded

## Princípio Fundamental

**Todas as roles e permissões são armazenadas e consultadas exclusivamente do banco de dados. Não há enums, valores hardcoded ou fallbacks no código.**

## O Que Foi Removido

### ❌ Removido: Enum UserRole
```python
# ANTES (removido)
class UserRole(str, enum.Enum):
    EMPREENDEDOR = "empreendedor"
    LICENCIADOR = "licenciador"
    ADMIN = "admin"
```

### ❌ Removido: Verificações Hardcoded de Role IDs
```python
# ANTES (removido)
if user.role_id in ['licenciador', 'admin']:
    # ...

# ANTES (removido)
if user.role_id == 'admin':
    # ...
```

### ❌ Removido: Fallbacks Hardcoded
```python
# ANTES (removido)
role = db.query(Role).filter(Role.is_default == True).first()
if not role:
    role = db.query(Role).filter(Role.id == 'empreendedor').first()  # Fallback hardcoded
```

## O Que Foi Implementado

### ✅ Verificação por Permissão (do banco)
```python
# AGORA - verifica permissão do banco
def require_licenciador_or_admin(user, db):
    # Verifica se role do usuário tem permissão VIEW_ADMIN no banco
    return has_permission(user, Permission.VIEW_ADMIN, db)
```

### ✅ Busca de Role Padrão (do banco)
```python
# AGORA - busca do banco, sem fallback
def get_default_role(db):
    role = db.query(Role).filter(Role.is_default == True).first()
    if not role:
        raise HTTPException(...)  # Erro se não houver - sem fallback
    return role
```

### ✅ Verificação de Permissões (do banco)
```python
# AGORA - todas as verificações vêm do banco
def can_view_all_processes(user, db):
    return has_permission(user, Permission.VIEW_ALL_PROCESSES, db)
    # Busca permissão do banco baseado na role do usuário
```

## Constantes Permission IDs

As constantes em `Permission` são **apenas para type safety e referência**. Os valores **devem existir no banco de dados**:

```python
class Permission:
    VIEW_ADMIN = "view_admin"  # Apenas constante - valor deve estar no banco
    MANAGE_USERS = "manage_users"  # Apenas constante - valor deve estar no banco
```

**Estas constantes não são valores hardcoded de lógica de negócio** - são apenas strings que devem corresponder aos IDs no banco.

## Estrutura no Banco de Dados

### Tabela `roles`
- Armazena todas as roles do sistema
- Campo `is_default` indica role padrão
- Campo `is_active` permite ativar/desativar

### Tabela `permissions`
- Armazena todas as permissões do sistema
- Campo `is_active` permite ativar/desativar

### Tabela `role_permissions`
- Relacionamento N:N entre roles e permissões
- Define quais permissões cada role tem

## Como Adicionar Nova Role

1. **Inserir no banco de dados:**
```sql
INSERT INTO roles (id, name, description, is_default, is_active)
VALUES ('nova_role', 'Nova Role', 'Descrição', false, true);
```

2. **Associar permissões:**
```sql
INSERT INTO role_permissions (role_id, permission_id)
VALUES ('nova_role', 'view_own_processes');
```

3. **Pronto!** O código já funciona - não precisa alterar nada.

## Como Adicionar Nova Permissão

1. **Inserir no banco de dados:**
```sql
INSERT INTO permissions (id, name, description, category, is_active)
VALUES ('nova_permissao', 'Nova Permissão', 'Descrição', 'process', true);
```

2. **Associar a roles:**
```sql
INSERT INTO role_permissions (role_id, permission_id)
VALUES ('admin', 'nova_permissao');
```

3. **Usar no código:**
```python
# Adicionar constante (opcional, para type safety)
PERMISSION_IDS["NOVA_PERMISSAO"] = "nova_permissao"

# Usar
if has_permission(user, "nova_permissao", db):
    # ...
```

## Verificações no Código

### ✅ Correto - Verifica Permissão do Banco
```python
if can_view_all_processes(user, db):  # Busca permissão do banco
    # ...
```

### ✅ Correto - Verifica Permissão Específica
```python
if has_permission(user, Permission.VIEW_ADMIN, db):  # Busca do banco
    # ...
```

### ❌ Incorreto - Verifica Role ID Hardcoded
```python
if user.role_id == 'admin':  # NÃO FAZER ISSO
    # ...
```

### ❌ Incorreto - Lista Hardcoded de Roles
```python
if user.role_id in ['licenciador', 'admin']:  # NÃO FAZER ISSO
    # ...
```

## Migrations

As migrations criam os dados iniciais no banco, mas após isso, **tudo é gerenciado no banco de dados**:

- Migration `create_roles_and_permissions_tables` cria roles e permissões iniciais
- Após a migration, você pode modificar/adiar/remover roles e permissões diretamente no banco
- O código não depende de valores específicos - apenas consulta o banco

## Garantias

✅ **Nenhum enum de roles**  
✅ **Nenhum valor hardcoded de role IDs**  
✅ **Nenhum fallback hardcoded**  
✅ **Todas as verificações consultam o banco**  
✅ **Permissões são verificadas, não role IDs**  
✅ **Sistema totalmente flexível e configurável via banco de dados**
