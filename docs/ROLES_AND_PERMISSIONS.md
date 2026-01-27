# Sistema de Roles e Permissões (100% Database-Driven)

Este documento descreve o sistema de roles e permissões implementado no sistema de licenciamento ambiental. 

**⚠️ IMPORTANTE: O sistema é 100% baseado em banco de dados. Não há enums ou valores hardcoded no código. Todas as roles e permissões são armazenadas e consultadas exclusivamente do banco de dados.**

## Roles (Papéis)

O sistema possui três roles principais:

### 1. EMPREENDEDOR (Default)
- **Role ID:** `empreendedor`
- **Descrição:** Role padrão para todos os usuários criados
- **Acesso:**
  - ✅ Dashboard
  - ✅ Criar processos
  - ✅ Visualizar seus próprios processos
  - ✅ Atualizar seus próprios processos
  - ✅ Configurações
  - ❌ Gestão Municipal (não visível, nem acessível)

### 2. LICENCIADOR
- **Role ID:** `licenciador`
- **Descrição:** Usuários que gerenciam processos de licenciamento
- **Acesso:**
  - ✅ Dashboard
  - ✅ Visualizar todos os processos
  - ✅ Gestão Municipal (acesso completo)
  - ✅ Atualizar qualquer processo (status, prazos, etc.)
  - ✅ Configurações
  - ❌ Gerenciar usuários (apenas ADMIN)

### 3. ADMIN
- **Role ID:** `admin`
- **Descrição:** Acesso total ao sistema
- **Acesso:**
  - ✅ Todas as funcionalidades do EMPREENDEDOR
  - ✅ Todas as funcionalidades do LICENCIADOR
  - ✅ Gerenciar usuários
  - ✅ Gerenciar atividades
  - ✅ Acesso total a todas as funcionalidades

## Permissões

O sistema de permissões está definido em `app/permissions.py`:

### Permissões de Processo
- `VIEW_OWN_PROCESSES`: Visualizar processos próprios
- `VIEW_ALL_PROCESSES`: Visualizar todos os processos
- `CREATE_PROCESS`: Criar novos processos
- `UPDATE_OWN_PROCESS`: Atualizar processos próprios
- `UPDATE_ANY_PROCESS`: Atualizar qualquer processo

### Permissões Administrativas
- `VIEW_ADMIN`: Acessar área de gestão municipal
- `MANAGE_PROCESSES`: Gerenciar processos (atualizar status, etc.)
- `MANAGE_USERS`: Gerenciar usuários (apenas ADMIN)
- `MANAGE_ACTIVITIES`: Gerenciar atividades (apenas ADMIN)

## Estrutura no Banco de Dados

### Tabelas

1. **`roles`**: Armazena as roles do sistema
   - `id`: ID da role (e.g., 'empreendedor', 'licenciador', 'admin')
   - `name`: Nome de exibição
   - `description`: Descrição da role
   - `is_default`: Se é a role padrão para novos usuários
   - `is_active`: Se a role está ativa

2. **`permissions`**: Armazena as permissões do sistema
   - `id`: ID da permissão (e.g., 'view_own_processes')
   - `name`: Nome de exibição
   - `description`: Descrição da permissão
   - `category`: Categoria (e.g., 'process', 'admin')
   - `is_active`: Se a permissão está ativa

3. **`role_permissions`**: Tabela intermediária N:N
   - `role_id`: ID da role
   - `permission_id`: ID da permissão

4. **`users`**: Atualizado para usar `role_id` (foreign key)
   - `role_id`: Referência à tabela `roles`

### Permissões Padrão

As seguintes permissões são criadas automaticamente na migration:

- `view_own_processes`: Visualizar processos próprios
- `view_all_processes`: Visualizar todos os processos
- `create_process`: Criar novos processos
- `update_own_process`: Atualizar processos próprios
- `update_any_process`: Atualizar qualquer processo
- `view_admin`: Acessar área de gestão municipal
- `manage_processes`: Gerenciar processos
- `manage_users`: Gerenciar usuários
- `manage_activities`: Gerenciar atividades

### Roles Padrão

As seguintes roles são criadas automaticamente na migration:

1. **empreendedor** (is_default: true)
   - Permissões: `view_own_processes`, `create_process`, `update_own_process`

2. **licenciador**
   - Permissões: `view_all_processes`, `view_admin`, `manage_processes`, `update_any_process`

3. **admin**
   - Permissões: Todas as permissões listadas acima

## Implementação no Backend

### Sistema de Permissões (100% Database-Driven)

O sistema de permissões **busca TODOS os dados do banco de dados**. Não há valores hardcoded:

```python
from app.permissions import (
    has_permission,           # Verifica permissão do banco
    get_user_permissions,     # Obtém permissões do banco
    require_permission,       # Dependency - verifica permissão do banco
    require_role,             # Dependency - verifica role do banco
    require_licenciador_or_admin,  # Verifica permissão VIEW_ADMIN do banco
    require_admin,            # Verifica permissão MANAGE_USERS do banco
    can_view_all_processes,   # Verifica permissão VIEW_ALL_PROCESSES do banco
    can_manage_processes,     # Verifica permissão MANAGE_PROCESSES do banco
    can_access_admin,         # Verifica permissão VIEW_ADMIN do banco
    get_default_role,         # Busca role com is_default=True do banco
    get_role_by_id,           # Busca role por ID do banco
    get_roles_by_permission,  # Busca roles que têm permissão do banco
)
```

### Como Funciona

1. **Verificação de Permissão**: 
   - `has_permission(user, permission_id, db)` busca a role do usuário no banco
   - Carrega as permissões associadas à role através da tabela `role_permissions` (do banco)
   - Retorna `True` se a permissão estiver associada à role do usuário (verificado no banco)

2. **Criação de Usuário**:
   - Se `role` não for especificado no `UserCreate`, usa `get_default_role(db)`
   - Busca a role com `is_default=True` no banco de dados
   - **Não há fallback hardcoded** - se não houver role padrão, retorna erro

3. **Verificação de Roles**:
   - `require_licenciador_or_admin()` verifica permissão `VIEW_ADMIN` do banco (não verifica role IDs)
   - `require_admin()` verifica permissão `MANAGE_USERS` do banco (não verifica role ID)
   - **Nenhuma verificação hardcoded de role IDs**

### Exemplos de Uso

#### Proteger endpoint por permissão (do banco)
```python
@router.get("/admin/processes")
async def get_all_processes(
    current_user: User = Depends(require_licenciador_or_admin)
):
    # Verifica permissão VIEW_ADMIN do banco de dados
    # Qualquer role com essa permissão pode acessar
    ...
```

#### Verificar permissão condicionalmente
```python
@router.get("/processes")
async def get_processes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if can_view_all_processes(current_user, db):
        # Retorna todos os processos
    else:
        # Retorna apenas processos do usuário
```

## Implementação no Frontend

### Componente RoleProtectedRoute

Protege rotas baseado em roles:

```jsx
<Route 
  path="/admin" 
  element={
    <RoleProtectedRoute allowedRoles={['licenciador', 'admin']}>
      <Admin />
    </RoleProtectedRoute>
  } 
/>
```

### Verificação de Permissões no Sidebar

O menu lateral esconde automaticamente itens baseado na role:

```jsx
const canAccessAdmin = () => {
    if (!user) return false;
    return user.role === 'licenciador' || user.role === 'admin';
};

// Menu item só aparece se tiver permissão
{canAccessAdmin() && (
    <NavLink to="/admin">Gestão Municipal</NavLink>
)}
```

## Migrations

### Migration: create_roles_and_permissions
- Cria tabelas `roles`, `permissions` e `role_permissions`
- Insere roles padrão (empreendedor, licenciador, admin)
- Insere permissões padrão
- Associa permissões às roles
- Adiciona coluna `role_id` na tabela `users`
- Migra dados existentes de `role` (enum) para `role_id` (foreign key)

### Migration: update_roles_to_licenciador
- Atualiza role `GESTOR` para `LICENCIADOR` no banco de dados
- Atualiza o enum `userrole` para incluir `LICENCIADOR` e remover `GESTOR`

## Comportamento por Role

### EMPREENDEDOR
- Ao criar um processo, só pode usar suas próprias empresas
- Ao listar processos, vê apenas processos de suas empresas
- Não pode atualizar status de processos (apenas visualizar)
- Não vê link para "Gestão Municipal" no menu

### LICENCIADOR
- Vê todos os processos no sistema
- Pode atualizar status, prazos e dados de qualquer processo
- Tem acesso completo à área de Gestão Municipal
- Não pode gerenciar usuários ou atividades

### ADMIN
- Tem acesso total a todas as funcionalidades
- Pode gerenciar usuários
- Pode gerenciar atividades
- Pode fazer tudo que LICENCIADOR e EMPREENDEDOR podem fazer

## Segurança

1. **Backend First:** Todas as verificações de permissão são feitas no backend
2. **Frontend UX:** O frontend apenas esconde/mostra elementos para melhor UX
3. **Token JWT:** O token JWT contém o user_id, e a role é verificada no backend
4. **Database Constraints:** A foreign key `users.role_id` garante que apenas roles válidas sejam atribuídas

## Exemplos de Endpoints Protegidos

### Processos
- `GET /processes` - Filtra por role (empreendedores veem apenas os seus)
- `GET /processes/{id}` - Verifica se usuário tem acesso ao processo
- `PATCH /processes/{id}` - Apenas LICENCIADOR e ADMIN podem atualizar

### Usuários
- `GET /users` - Apenas ADMIN pode listar usuários
- `GET /users/{id}` - Apenas ADMIN pode ver outros usuários

### Admin/Gestão Municipal
- `GET /admin/*` - Apenas LICENCIADOR e ADMIN podem acessar

## Testando Roles

### Criar usuário EMPREENDEDOR (default)
```json
POST /auth/register
{
  "email": "empreendedor@test.com",
  "password": "123456",
  "razao_social": "Empresa Teste",
  "cnpj": "12345678000190",
  // role não especificado = EMPREENDEDOR
}
```

### Criar usuário LICENCIADOR
```json
POST /auth/register
{
  "email": "licenciador@test.com",
  "password": "123456",
  "razao_social": "Prefeitura Municipal",
  "cnpj": "12345678000190",
  "role": "licenciador"
}
```

### Criar usuário ADMIN
```json
POST /auth/register
{
  "email": "admin@test.com",
  "password": "123456",
  "razao_social": "Administrador",
  "cnpj": "12345678000190",
  "role": "admin"
}
```

## Vantagens do Sistema Database-Driven

1. **Flexibilidade**: Roles e permissões podem ser modificadas sem alterar código
2. **Escalabilidade**: Fácil adicionar novas roles e permissões
3. **Auditoria**: Histórico de mudanças através de timestamps
4. **Gerenciamento**: Possibilidade de criar interface administrativa para gerenciar roles/permissões
5. **Ativação/Desativação**: Roles e permissões podem ser desativadas sem deletar

## Notas Importantes

1. **100% Database-Driven:** Nenhum enum ou valor hardcoded. Tudo vem do banco de dados
2. **Default Role:** Todos os usuários criados têm a role com `is_default=True` do banco de dados
3. **Sem Fallbacks:** Se não houver role padrão configurada, o sistema retorna erro (não usa fallback hardcoded)
4. **Verificação por Permissão:** Funções como `require_licenciador_or_admin` verificam permissões do banco, não role IDs
5. **Performance:** Permissões são carregadas com `joinedload` para evitar N+1 queries
6. **Backward Compatibility:** O modelo `User` mantém propriedade `role` que retorna `role_id` para compatibilidade
7. **Frontend Protection:** O frontend esconde elementos, mas o backend é a fonte da verdade
8. **Token Refresh:** A role do usuário está no token JWT e é verificada a cada requisição
9. **Cache:** Em produção, considere cachear permissões por role para melhor performance
10. **Constantes Permission IDs:** As constantes em `Permission` são apenas para type safety - os valores devem existir no banco
