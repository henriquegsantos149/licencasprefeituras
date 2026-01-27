"""Create roles and permissions tables

Revision ID: create_roles_and_permissions
Revises: update_roles_to_licenciador
Create Date: 2026-01-27 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'create_roles_and_permissions'
down_revision: Union[str, None] = 'update_roles_to_licenciador'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create permissions table
    op.create_table(
        'permissions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_permissions_id'), 'permissions', ['id'], unique=False)
    op.create_index(op.f('ix_permissions_name'), 'permissions', ['name'], unique=True)

    # 2. Create roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_default', sa.Boolean(), default=False, nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roles_id'), 'roles', ['id'], unique=False)
    op.create_index(op.f('ix_roles_name'), 'roles', ['name'], unique=True)

    # 3. Create role_permissions junction table
    op.create_table(
        'role_permissions',
        sa.Column('role_id', sa.String(), nullable=False),
        sa.Column('permission_id', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('role_id', 'permission_id')
    )

    # 4. Insert default permissions
    permissions = [
        ('view_own_processes', 'Visualizar processos próprios', 'process'),
        ('view_all_processes', 'Visualizar todos os processos', 'process'),
        ('create_process', 'Criar novos processos', 'process'),
        ('update_own_process', 'Atualizar processos próprios', 'process'),
        ('update_any_process', 'Atualizar qualquer processo', 'process'),
        ('view_admin', 'Acessar área de gestão municipal', 'admin'),
        ('manage_processes', 'Gerenciar processos', 'admin'),
        ('manage_users', 'Gerenciar usuários', 'admin'),
        ('manage_activities', 'Gerenciar atividades', 'admin'),
    ]
    
    for perm_id, perm_name, category in permissions:
        op.execute(text("""
            INSERT INTO permissions (id, name, description, category, is_active, created_at)
            VALUES (:id, :name, :description, :category, true, now())
        """), {
            'id': perm_id,
            'name': perm_name,
            'description': perm_name,
            'category': category
        })

    # 5. Insert default roles
    roles = [
        ('empreendedor', 'Empreendedor', 'Role padrão - acesso a tudo exceto gestão municipal', True),
        ('licenciador', 'Licenciador', 'Acesso à gestão municipal', False),
        ('admin', 'Administrador', 'Acesso total a todas as funcionalidades', False),
    ]
    
    for role_id, role_name, description, is_default in roles:
        op.execute(text("""
            INSERT INTO roles (id, name, description, is_default, is_active, created_at)
            VALUES (:id, :name, :description, :is_default, true, now())
        """), {
            'id': role_id,
            'name': role_name,
            'description': description,
            'is_default': is_default
        })

    # 6. Associate permissions to roles
    role_permissions_map = {
        'empreendedor': [
            'view_own_processes',
            'create_process',
            'update_own_process',
        ],
        'licenciador': [
            'view_all_processes',
            'view_admin',
            'manage_processes',
            'update_any_process',
        ],
        'admin': [
            'view_own_processes',
            'view_all_processes',
            'create_process',
            'update_own_process',
            'update_any_process',
            'view_admin',
            'manage_processes',
            'manage_users',
            'manage_activities',
        ],
    }
    
    for role_id, permission_ids in role_permissions_map.items():
        for perm_id in permission_ids:
            op.execute(text("""
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES (:role_id, :permission_id)
            """), {
                'role_id': role_id,
                'permission_id': perm_id
            })

    # 7. Add role_id column to users table
    op.add_column('users', sa.Column('role_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_users_role_id'), 'users', ['role_id'], unique=False)
    
    # 8. Migrate existing users: set role_id based on current role enum
    op.execute(text("""
        UPDATE users 
        SET role_id = role::text
    """))
    
    # 9. Make role_id NOT NULL and add foreign key
    op.alter_column('users', 'role_id', nullable=False)
    op.create_foreign_key('fk_users_role_id', 'users', 'roles', ['role_id'], ['id'], ondelete='RESTRICT')
    
    # 10. Drop old role enum column (keep for now for backward compatibility, can be removed later)
    # op.drop_column('users', 'role')


def downgrade() -> None:
    # Remove foreign key and role_id column
    op.drop_constraint('fk_users_role_id', 'users', type_='foreignkey')
    op.drop_index(op.f('ix_users_role_id'), table_name='users')
    op.drop_column('users', 'role_id')
    
    # Drop junction table
    op.drop_table('role_permissions')
    
    # Drop roles table
    op.drop_index(op.f('ix_roles_name'), table_name='roles')
    op.drop_index(op.f('ix_roles_id'), table_name='roles')
    op.drop_table('roles')
    
    # Drop permissions table
    op.drop_index(op.f('ix_permissions_name'), table_name='permissions')
    op.drop_index(op.f('ix_permissions_id'), table_name='permissions')
    op.drop_table('permissions')
