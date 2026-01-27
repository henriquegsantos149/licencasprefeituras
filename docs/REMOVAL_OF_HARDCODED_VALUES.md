# Remoção de Valores Hardcoded - Roles e Permissões

## ✅ Status: Completo

Todas as roles e permissões agora são **100% baseadas em banco de dados**. Não há enums ou valores hardcoded no código.

## Mudanças Realizadas

### 1. Removido Enum UserRole
- ❌ **Removido:** `class UserRole(str, enum.Enum)` do modelo User
- ✅ **Substituído por:** Foreign key `role_id` → `roles.id`

### 2. Removidas Verificações Hardcoded de Role IDs

#### Antes (Removido):
```python
if user.role_id in ['licenciador', 'admin']:
    # ...
    
if user.role_id == 'admin':
    # ...
```

#### Agora (Database-Driven):
```python
# Verifica permissão do banco, não role ID
if user_has_role_with_permission(user, Permission.VIEW_ADMIN, db):
    # Qualquer role com VIEW_ADMIN pode acessar
```

### 3. Removido Fallback Hardcoded

#### Antes (Removido):
```python
role = db.query(Role).filter(Role.is_default == True).first()
if not role:
    role = db.query(Role).filter(Role.id == 'empreendedor').first()  # Fallback
```

#### Agora (Database-Driven):
```python
role = db.query(Role).filter(Role.is_default == True).first()
if not role:
    raise HTTPException(...)  # Erro - sem fallback hardcoded
```

### 4. Funções Atualizadas para Usar Banco de Dados

#### `require_licenciador_or_admin()`
- **Antes:** Verificava `user.role_id in ['licenciador', 'admin']`
- **Agora:** Verifica permissão `VIEW_ADMIN` do banco de dados
- **Resultado:** Qualquer role com essa permissão pode acessar

#### `require_admin()`
- **Antes:** Verificava `user.role_id == 'admin'`
- **Agora:** Verifica permissão `MANAGE_USERS` do banco de dados
- **Resultado:** Qualquer role com essa permissão pode acessar

#### `get_default_role()`
- **Antes:** Tinha fallback para `'empreendedor'`
- **Agora:** Busca role com `is_default=True` do banco, retorna erro se não houver

### 5. Verificações em Routers

#### `processes.py`
- **Antes:** `if current_user.role.value == "empreendedor"`
- **Agora:** `if not can_view_all_processes(current_user, db)`
- **Resultado:** Verifica permissão do banco, não role ID

## Constantes Permission IDs

As constantes em `Permission` são **apenas para type safety**:

```python
class Permission:
    VIEW_ADMIN = "view_admin"  # String constante - valor deve estar no banco
    MANAGE_USERS = "manage_users"  # String constante - valor deve estar no banco
```

**Estas não são valores hardcoded de lógica de negócio** - são apenas referências que devem corresponder aos IDs no banco de dados.

## Verificações Finais

✅ **Nenhum enum de roles no código**  
✅ **Nenhuma verificação hardcoded de role IDs**  
✅ **Nenhum fallback hardcoded**  
✅ **Todas as verificações consultam o banco de dados**  
✅ **Funções verificam permissões, não role IDs**  
✅ **Sistema totalmente flexível via banco de dados**

## Como o Sistema Funciona Agora

1. **Criar Usuário:**
   - Se `role` não especificado → busca role com `is_default=True` do banco
   - Se não houver role padrão → retorna erro (sem fallback)

2. **Verificar Permissão:**
   - Busca role do usuário no banco
   - Busca permissões da role no banco (via `role_permissions`)
   - Verifica se permissão está na lista (do banco)

3. **Verificar Acesso Admin:**
   - Verifica se role do usuário tem permissão `VIEW_ADMIN` (do banco)
   - Não verifica role ID específico

4. **Verificar Acesso Admin Total:**
   - Verifica se role do usuário tem permissão `MANAGE_USERS` (do banco)
   - Não verifica role ID específico

## Exemplo de Uso Correto

```python
# ✅ CORRETO - Verifica permissão do banco
if can_view_all_processes(user, db):
    # Retorna todos os processos
else:
    # Retorna apenas processos do usuário

# ✅ CORRETO - Verifica permissão específica do banco
if has_permission(user, Permission.VIEW_ADMIN, db):
    # Usuário pode acessar admin

# ❌ INCORRETO - Não fazer isso
if user.role_id == 'admin':  # NÃO USAR
    # ...
```

## Garantias

O sistema agora garante que:
- ✅ Todas as roles vêm do banco de dados
- ✅ Todas as permissões vêm do banco de dados
- ✅ Todas as verificações consultam o banco
- ✅ Nenhum valor hardcoded de lógica de negócio
- ✅ Sistema totalmente configurável via banco de dados
