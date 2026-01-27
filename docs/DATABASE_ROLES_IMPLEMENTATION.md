# Implementação de Roles e Permissões no Banco de Dados

## Resumo

O sistema de roles e permissões está **100% baseado em banco de dados**. **Não há enums ou valores hardcoded no código**. Todas as roles e permissões são armazenadas e consultadas do banco de dados, permitindo flexibilidade total e gerenciamento dinâmico.

## Mudanças Implementadas

### 1. Novos Modelos

#### `Role` (`app/models/role.py`)
- Tabela `roles` com campos:
  - `id`: ID da role (string, primary key)
  - `name`: Nome de exibição
  - `description`: Descrição
  - `is_default`: Se é role padrão para novos usuários
  - `is_active`: Se está ativa

#### `Permission` (`app/models/role.py`)
- Tabela `permissions` com campos:
  - `id`: ID da permissão (string, primary key)
  - `name`: Nome de exibição
  - `description`: Descrição
  - `category`: Categoria (process, admin, user)
  - `is_active`: Se está ativa

#### Tabela `role_permissions`
- Tabela intermediária N:N entre `roles` e `permissions`

### 2. Modelo User Atualizado

- Removido: `role` (SQLEnum)
- Adicionado: `role_id` (String, ForeignKey para `roles.id`)
- Propriedade `role` mantida para backward compatibility (retorna `role_id`)
- Relacionamento `role_obj` adicionado para acessar objeto Role completo

### 3. Sistema de Permissões Atualizado

#### `app/permissions.py`
- **100% database-driven**: Todas as funções buscam dados do banco
- `get_user_permissions(user, db)`: Busca permissões do banco
- `has_permission(user, permission_id, db)`: Verifica permissão específica do banco
- `require_licenciador_or_admin()`: Verifica permissão `VIEW_ADMIN` do banco (não usa role IDs hardcoded)
- `require_admin()`: Verifica permissão `MANAGE_USERS` do banco (não usa role ID hardcoded)
- `get_default_role(db)`: Busca role padrão do banco (sem fallback hardcoded)
- **Nenhum enum ou valor hardcoded de roles/permissões**

### 4. Schemas Atualizados

#### `UserCreate`
- `role`: Agora é `Optional[str]` (role ID) ao invés de `UserRole` enum
- Se `None`, usa role padrão do banco

#### `UserResponse`
- `role`: Role ID (string)
- `role_name`: Nome da role (opcional, carregado do relacionamento)

### 5. Routers Atualizados

Todos os routers foram atualizados para:
- Usar `can_view_all_processes(user, db)` com parâmetro `db`
- Usar `can_manage_processes(user, db)` com parâmetro `db`
- Carregar relacionamento `role_obj` quando necessário
- Usar `get_default_role(db)` ao criar usuários

### 6. Migration Criada

#### `create_roles_and_permissions_tables.py`
- Cria tabelas `roles`, `permissions`, `role_permissions`
- Insere roles padrão:
  - `empreendedor` (is_default: true)
  - `licenciador`
  - `admin`
- Insere 9 permissões padrão
- Associa permissões às roles
- Adiciona coluna `role_id` em `users`
- Migra dados existentes de `role` (enum) para `role_id`
- Cria foreign key constraint

## Estrutura do Banco de Dados

```
roles
├── id (PK)
├── name
├── description
├── is_default
└── is_active

permissions
├── id (PK)
├── name
├── description
├── category
└── is_active

role_permissions (N:N)
├── role_id (FK -> roles.id)
└── permission_id (FK -> permissions.id)

users
├── ...
└── role_id (FK -> roles.id)
```

## Dados Padrão

### Permissões Criadas
1. `view_own_processes` - Visualizar processos próprios
2. `view_all_processes` - Visualizar todos os processos
3. `create_process` - Criar novos processos
4. `update_own_process` - Atualizar processos próprios
5. `update_any_process` - Atualizar qualquer processo
6. `view_admin` - Acessar área de gestão municipal
7. `manage_processes` - Gerenciar processos
8. `manage_users` - Gerenciar usuários
9. `manage_activities` - Gerenciar atividades

### Roles e Suas Permissões

#### empreendedor (default)
- `view_own_processes`
- `create_process`
- `update_own_process`

#### licenciador
- `view_all_processes`
- `view_admin`
- `manage_processes`
- `update_any_process`

#### admin
- Todas as 9 permissões

## Como Usar

### Verificar Permissão (do banco de dados)
```python
from app.permissions import has_permission

# Busca permissão do banco de dados
if has_permission(user, "view_admin", db):
    # Usuário pode acessar admin
```

### Obter Todas as Permissões (do banco de dados)
```python
from app.permissions import get_user_permissions

# Busca todas as permissões do banco baseado na role do usuário
permissions = get_user_permissions(user, db)
# Retorna: {'view_own_processes', 'create_process', ...}
```

### Criar Usuário com Role Específica
```python
# Role ID deve existir no banco de dados
user_data = UserCreate(
    email="user@example.com",
    password="123456",
    razao_social="Empresa Teste",
    cnpj="12345678000190",
    role="<role_id_from_database>"  # Opcional, se None usa role com is_default=True do banco
)
```

### Obter Role Padrão (do banco de dados)
```python
from app.permissions import get_default_role

# Busca role com is_default=True do banco
default_role = get_default_role(db)
# Retorna Role com is_default=True (do banco de dados)
```

### Verificar Role por Permissão (do banco)
```python
from app.permissions import get_roles_by_permission

# Busca todas as roles que têm uma permissão específica
roles_with_admin = get_roles_by_permission("view_admin", db)
# Retorna lista de Role objects do banco
```

## Princípios do Sistema

1. **100% Database-Driven**: Nenhum enum ou valor hardcoded
2. **Sem Fallbacks Hardcoded**: Se não houver role padrão, retorna erro (não usa fallback)
3. **Verificação por Permissão**: Funções como `require_licenciador_or_admin` verificam permissões do banco, não role IDs
4. **Flexibilidade Total**: Roles e permissões podem ser modificadas sem alterar código
5. **Escalabilidade**: Fácil adicionar novas roles e permissões
6. **Gerenciamento**: Possibilidade de criar interface administrativa
7. **Auditoria**: Timestamps em roles e permissões
8. **Ativação/Desativação**: Pode desativar roles/permissões sem deletar

## Garantias do Sistema

✅ **Nenhum enum de roles** - Todas as roles vêm do banco  
✅ **Nenhum valor hardcoded de role IDs** - Tudo é consultado do banco  
✅ **Verificação por permissão** - Funções verificam permissões do banco, não role IDs  
✅ **Sem fallbacks hardcoded** - Se não houver role padrão, retorna erro  
✅ **Constantes de Permission IDs** - Apenas para type safety, valores devem existir no banco  

## Próximos Passos (Opcional)

1. Criar endpoints para gerenciar roles e permissões (apenas ADMIN)
2. Criar interface administrativa para gerenciar roles/permissões
3. Implementar cache de permissões para melhor performance
4. Adicionar histórico de mudanças em roles/permissões
5. Remover coluna `role` (enum) antiga após confirmação de migração completa
