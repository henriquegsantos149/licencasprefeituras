# Relacionamentos do Banco de Dados

Este documento descreve os relacionamentos implementados no sistema de licenciamento ambiental.

## Estrutura de Relacionamentos

### 0. User → Role (N:1)
**Um usuário tem uma role, uma role pode ter múltiplos usuários**

- **Tabela:** `users` (N) → `roles` (1)
- **Foreign Key:** `users.role_id` → `roles.id`
- **Cascade:** `ON DELETE RESTRICT` (não permite deletar role se houver usuários)
- **Uso:** Sistema de permissões baseado em roles armazenadas no banco de dados

**Modelo:**
```python
class User(Base):
    role_id = Column(String, ForeignKey("roles.id", ondelete='RESTRICT'))
    role_obj = relationship("Role", back_populates="users")

class Role(Base):
    users = relationship("User", back_populates="role_obj")
    permissions = relationship("Permission", secondary=role_permissions, ...)
```

### 1. User → Companies (1:N)
**Um usuário pode ter múltiplas empresas**

- **Tabela:** `users` (1) → `companies` (N)
- **Foreign Key:** `companies.user_id` → `users.id`
- **Cascade:** `ON DELETE CASCADE` (se um usuário for deletado, suas empresas também são deletadas)
- **Uso:** Um empreendedor pode gerenciar múltiplas empresas (pessoas jurídicas)

**Modelo:**
```python
class User(Base):
    companies = relationship("Company", back_populates="user", cascade="all, delete-orphan")

class Company(Base):
    user_id = Column(String, ForeignKey("users.id", ondelete='CASCADE'))
    user = relationship("User", back_populates="companies")
```

### 2. Company → Activities (N:N)
**Uma empresa pode ter múltiplas atividades, e uma atividade pode ser associada a múltiplas empresas**

- **Tabela intermediária:** `company_activities`
- **Foreign Keys:**
  - `company_activities.company_id` → `companies.id`
  - `company_activities.activity_id` → `activities.id`
- **Cascade:** `ON DELETE CASCADE` em ambos os lados
- **Uso:** Uma empresa pode estar licenciada para diferentes atividades (ex: Laticínio, Posto de Combustível, etc.)

**Modelo:**
```python
company_activities = Table(
    'company_activities',
    Base.metadata,
    Column('company_id', String, ForeignKey('companies.id', ondelete='CASCADE'), primary_key=True),
    Column('activity_id', String, ForeignKey('activities.id', ondelete='CASCADE'), primary_key=True)
)

class Company(Base):
    activities = relationship("Activity", secondary=company_activities, back_populates="companies")

class Activity(Base):
    companies = relationship("Company", secondary="company_activities", back_populates="activities")
```

### 3. Process → (Company + Activity) (1:1:1)
**Um processo é específico para uma empresa em uma atividade**

- **Tabela:** `processes`
- **Foreign Keys:**
  - `processes.company_id` → `companies.id`
  - `processes.activity_id` → `activities.id`
- **Cascade:** `ON DELETE CASCADE` em ambos os lados
- **Uso:** Cada processo de licenciamento é criado para uma empresa específica em uma atividade específica

**Modelo:**
```python
class Process(Base):
    company_id = Column(String, ForeignKey("companies.id", ondelete='CASCADE'))
    activity_id = Column(String, ForeignKey("activities.id", ondelete='CASCADE'))
    company = relationship("Company", back_populates="processes")
    activity = relationship("Activity", back_populates="processes")

class Company(Base):
    processes = relationship("Process", back_populates="company")

class Activity(Base):
    processes = relationship("Process", back_populates="activity")
```

## Diagrama de Relacionamentos

```
┌─────────┐
│  Role   │
└────┬────┘
     │ 1
     │
     │ N
┌────▼─────────┐
│  User        │
└────┬─────────┘
     │ 1
     │
     │ N
┌────▼─────────┐
│   Company     │
└───┬───────┬───┘
    │ 1     │ N
    │       │
    │       │ N
    │   ┌───▼──────────┐
    │   │company_      │
    │   │activities    │
    │   └───┬──────────┘
    │       │ N
    │       │
    │   ┌───▼──────────┐
    │   │  Activity    │
    │   └───┬──────────┘
    │       │ 1
    │       │
    │       │ N
┌───▼───────▼──────────┐
│      Process         │
│  (company_id +       │
│   activity_id)       │
└──────────────────────┘
```

## Relacionamento Role → Permission (N:N)

**Uma role pode ter múltiplas permissões, uma permissão pode estar em múltiplas roles**

- **Tabela intermediária:** `role_permissions`
- **Foreign Keys:**
  - `role_permissions.role_id` → `roles.id`
  - `role_permissions.permission_id` → `permissions.id`
- **Cascade:** `ON DELETE CASCADE` em ambos os lados
- **Uso:** Sistema de permissões flexível onde roles têm permissões associadas

**Modelo:**
```python
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', String, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', String, ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
)

class Role(Base):
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(Base):
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")
```

## Migrations

### Migration: create_roles_and_permissions_tables
- Cria tabelas `roles`, `permissions` e `role_permissions`
- Insere roles padrão (empreendedor, licenciador, admin)
- Insere permissões padrão
- Associa permissões às roles
- Adiciona coluna `role_id` em `users`
- Migra dados existentes de `role` (enum) para `role_id`

### Migration: add_company_relationships
A migration `add_company_relationships.py` implementa:

1. **Criação da tabela `companies`**
   - Campos: id, user_id, razao_social, nome_fantasia, cnpj, etc.
   - Índices: user_id, cnpj (único), razao_social

2. **Criação da tabela `company_activities`**
   - Tabela intermediária para relacionamento N:N
   - Chave primária composta: (company_id, activity_id)

3. **Migração de dados existentes**
   - Cria empresas a partir dos dados dos usuários existentes
   - Atualiza processos para usar `company_id` ao invés de `applicant_id`

4. **Atualização da tabela `processes`**
   - Adiciona coluna `company_id`
   - Remove dependência direta de `applicant_id` (mantém coluna para referência histórica)
   - Adiciona foreign key constraint com CASCADE

## Schemas Pydantic

### Company Schemas
- `CompanyCreate`: Para criar uma nova empresa
- `CompanyUpdate`: Para atualizar dados da empresa
- `CompanyResponse`: Resposta com dados da empresa e atividades associadas
- `CompanyActivityAssociation`: Para associar/desassociar atividades

### Process Schemas (Atualizados)
- `ProcessCreate`: Agora requer `company_id` ao invés de `applicant_id`
- `ProcessResponse`: Inclui `company_id` e `company_name`

## Exemplos de Uso

### Criar uma empresa para um usuário
```python
company = Company(
    id=str(uuid.uuid4()),
    user_id=user.id,
    razao_social="Empresa Exemplo Ltda",
    cnpj="12345678000190",
    ...
)
```

### Associar atividades a uma empresa
```python
company.activities.append(activity1)
company.activities.append(activity2)
```

### Criar um processo para uma empresa em uma atividade
```python
process = Process(
    id=str(uuid.uuid4()),
    company_id=company.id,
    activity_id=activity.id,
    applicant_name=company.razao_social,
    ...
)
```

## Notas Importantes

1. **Migração de Dados:** A migration cria automaticamente empresas a partir dos dados dos usuários existentes, garantindo que nenhum dado seja perdido.

2. **Backward Compatibility:** A coluna `applicant_id` na tabela `processes` é mantida para referência histórica, mas não é mais usada nos relacionamentos.

3. **Cascade Deletes:** 
   - Se um usuário for deletado → suas empresas são deletadas
   - Se uma empresa for deletada → seus processos são deletados
   - Se uma atividade for deletada → processos relacionados são deletados

4. **Validações:** 
   - CNPJ deve ser único por empresa
   - Uma empresa deve pertencer a um usuário
   - Um processo deve ter uma empresa e uma atividade válidas
