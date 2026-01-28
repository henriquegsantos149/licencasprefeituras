# Índice de Documentação

Este documento serve como índice para toda a documentação do projeto.

## 📚 Documentação Principal

### Backend

1. **README.md** - Guia principal do backend
   - Instalação e configuração
   - Como executar
   - Endpoints da API
   - Modelos de dados

2. **ROLES_AND_PERMISSIONS.md** - Sistema de Roles e Permissões
   - Descrição completa do sistema
   - Roles disponíveis (empreendedor, licenciador, admin)
   - Permissões e mapeamentos
   - Implementação no backend e frontend
   - Exemplos de uso

3. **DATABASE_ROLES_IMPLEMENTATION.md** - Detalhes Técnicos
   - Mudanças implementadas
   - Estrutura do banco de dados
   - Dados padrão
   - Como usar o sistema

4. **RELATIONSHIPS.md** - Relacionamentos do Banco de Dados
   - User → Companies (1:N)
   - Company → Activities (N:N)
   - Process → (Company + Activity)
   - User → Role (N:1)
   - Role → Permission (N:N)
   - Diagramas e exemplos

5. **MIGRATIONS.md** - Guia de Migrations
   - Como criar migrations
   - Comandos úteis
   - Boas práticas
   - Lista de migrations existentes

6. **AZURE_APP_SERVICE_DEPLOY_CHECKLIST.md** - Checklist de Deploy (Azure)
   - App Service (Linux) para o backend (FastAPI)
   - Azure Database for PostgreSQL (Flexible Server)
   - Secrets, migrations/seed e validação pós-deploy
   - Opções de deploy do frontend (Static Web Apps ou App Service)

### Frontend

7. **README.md** (raiz) - Guia do frontend
   - Tecnologias utilizadas
   - Funcionalidades
   - Rotas da aplicação
   - Sistema de autenticação

## 🔄 Ordem de Migrations

As migrations devem ser aplicadas nesta ordem:

1. `49276bf7c3fa_initial_migration_create_all_tables`
2. `add_user_preferences`
3. `convert_preferences_to_table`
4. `add_company_relationships`
5. `update_roles_to_licenciador`
6. `create_roles_and_permissions`

## 🎯 Tópicos Principais

### Autenticação e Autorização
- **ROLES_AND_PERMISSIONS.md** - Sistema completo
- **DATABASE_ROLES_IMPLEMENTATION.md** - Implementação técnica

### Relacionamentos de Dados
- **RELATIONSHIPS.md** - Todos os relacionamentos

### Migrations
- **MIGRATIONS.md** - Guia completo
- Lista de migrations em **MIGRATIONS.md**

### API e Endpoints
- **backend/README.md** - Seção "Endpoints Principais"

## 📝 Notas Importantes

- Todas as roles e permissões são armazenadas no banco de dados
- O sistema usa relacionamentos: User → Role → Permissions
- Companies são separadas de Users para permitir múltiplas empresas por usuário
- Processes são vinculados a Companies e Activities
