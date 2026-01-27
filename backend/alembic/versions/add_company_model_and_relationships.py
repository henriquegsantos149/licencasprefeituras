"""Add company model and relationships

Revision ID: add_company_model_and_relationships
Revises: convert_preferences_to_table
Create Date: 2026-01-27 14:00:00.000000

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, text


# revision identifiers, used by Alembic.
revision: str = 'add_company_model_and_relationships'
down_revision: Union[str, None] = 'convert_preferences_to_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def table_exists(table_name: str) -> bool:
    """Check if a table exists."""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    # 1. Create companies table
    op.create_table(
        'companies',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('razao_social', sa.String(), nullable=False),
        sa.Column('nome_fantasia', sa.String(), nullable=True),
        sa.Column('cnpj', sa.String(length=14), nullable=False),
        sa.Column('inscricao_estadual', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('telefone', sa.String(), nullable=True),
        sa.Column('endereco', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_companies_id'), 'companies', ['id'], unique=False)
    op.create_index(op.f('ix_companies_user_id'), 'companies', ['user_id'], unique=False)
    op.create_index(op.f('ix_companies_cnpj'), 'companies', ['cnpj'], unique=True)
    op.create_index(op.f('ix_companies_razao_social'), 'companies', ['razao_social'], unique=False)

    # 2. Create company_activities junction table (N:N relationship)
    op.create_table(
        'company_activities',
        sa.Column('company_id', sa.String(), nullable=False),
        sa.Column('activity_id', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['activity_id'], ['activities.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('company_id', 'activity_id')
    )

    # 3. Migrate existing user data to companies (if users table has company data)
    # This creates a company for each user that has company-related fields
    if table_exists('users'):
        conn = op.get_bind()
        
        # Check if users have company data (razao_social, cnpj)
        result = conn.execute(text("""
            SELECT id, razao_social, nome_fantasia, cnpj, inscricao_estadual, 
                   email, telefone, endereco
            FROM users
            WHERE razao_social IS NOT NULL AND cnpj IS NOT NULL
        """))
        
        users_with_company_data = result.fetchall()
        
        for user_row in users_with_company_data:
            user_id = user_row[0]
            company_id = str(uuid.uuid4())
            
            # Insert company from user data
            conn.execute(text("""
                INSERT INTO companies (id, user_id, razao_social, nome_fantasia, cnpj, 
                                      inscricao_estadual, email, telefone, endereco, created_at)
                VALUES (:id, :user_id, :razao_social, :nome_fantasia, :cnpj, 
                        :inscricao_estadual, :email, :telefone, :endereco, now())
            """), {
                'id': company_id,
                'user_id': user_id,
                'razao_social': user_row[1],
                'nome_fantasia': user_row[2],
                'cnpj': user_row[3],
                'inscricao_estadual': user_row[4],
                'email': user_row[5],
                'telefone': user_row[6],
                'endereco': user_row[7] if user_row[7] else None
            })

    # 4. Add company_id column to processes table
    if table_exists('processes'):
        op.add_column('processes', sa.Column('company_id', sa.String(), nullable=True))
        op.create_index(op.f('ix_processes_company_id'), 'processes', ['company_id'], unique=False)
        
        # Migrate existing processes: link to company based on applicant_id
        conn = op.get_bind()
        
        # For each process, find the company that belongs to the applicant user
        # First, get all processes with their applicant users
        result = conn.execute(text("""
            SELECT p.id, p.applicant_id, c.id as company_id
            FROM processes p
            LEFT JOIN companies c ON c.user_id = p.applicant_id
        """))
        
        processes_to_update = result.fetchall()
        
        for process_row in processes_to_update:
            process_id = process_row[0]
            applicant_id = process_row[1]
            company_id = process_row[2]
            
            if not company_id:
                # If no company exists for this user, create one
                # Get user data
                user_result = conn.execute(text("""
                    SELECT razao_social, nome_fantasia, cnpj, inscricao_estadual, 
                           email, telefone, endereco
                    FROM users
                    WHERE id = :user_id
                """), {'user_id': applicant_id})
                
                user_data = user_result.fetchone()
                
                if user_data:
                    company_id = str(uuid.uuid4())
                    conn.execute(text("""
                        INSERT INTO companies (id, user_id, razao_social, nome_fantasia, cnpj, 
                                              inscricao_estadual, email, telefone, endereco, created_at)
                        VALUES (:id, :user_id, :razao_social, :nome_fantasia, :cnpj, 
                                :inscricao_estadual, :email, :telefone, :endereco, now())
                    """), {
                        'id': company_id,
                        'user_id': applicant_id,
                        'razao_social': user_data[0],
                        'nome_fantasia': user_data[1],
                        'cnpj': user_data[2],
                        'inscricao_estadual': user_data[3],
                        'email': user_data[4],
                        'telefone': user_data[5],
                        'endereco': user_data[6] if user_data[6] else None
                    })
            
            # Update process with company_id
            conn.execute(text("""
                UPDATE processes 
                SET company_id = :company_id 
                WHERE id = :process_id
            """), {
                'company_id': company_id,
                'process_id': process_id
            })

    # 5. Make company_id NOT NULL and add foreign key constraint
    if table_exists('processes'):
        conn = op.get_bind()
        
        # Verify all processes have company_id (they should after step 4)
        null_company_processes = conn.execute(text("""
            SELECT COUNT(*) FROM processes WHERE company_id IS NULL
        """)).scalar()
        
        if null_company_processes > 0:
            raise Exception(f"Found {null_company_processes} processes without company_id. Cannot proceed.")
        
        # Now make company_id NOT NULL and add foreign key constraint
        op.alter_column('processes', 'company_id', nullable=False)
        op.create_foreign_key('fk_processes_company_id', 'processes', 'companies', ['company_id'], ['id'], ondelete='CASCADE')
        
        # Update foreign key constraint for activity_id to include ondelete
        op.drop_constraint('processes_activity_id_fkey', 'processes', type_='foreignkey')
        op.create_foreign_key('processes_activity_id_fkey', 'processes', 'activities', ['activity_id'], ['id'], ondelete='CASCADE')
        
        # Remove old applicant_id column (optional - we can keep it for reference or remove it)
        # For now, we'll keep it but it's no longer used in the relationship
        # op.drop_column('processes', 'applicant_id')


def downgrade() -> None:
    # Remove foreign key constraints
    if table_exists('processes'):
        op.drop_constraint('fk_processes_company_id', 'processes', type_='foreignkey')
        op.drop_index(op.f('ix_processes_company_id'), table_name='processes')
        op.drop_column('processes', 'company_id')
    
    # Drop junction table
    if table_exists('company_activities'):
        op.drop_table('company_activities')
    
    # Drop companies table
    if table_exists('companies'):
        op.drop_index(op.f('ix_companies_razao_social'), table_name='companies')
        op.drop_index(op.f('ix_companies_cnpj'), table_name='companies')
        op.drop_index(op.f('ix_companies_user_id'), table_name='companies')
        op.drop_index(op.f('ix_companies_id'), table_name='companies')
        op.drop_table('companies')
