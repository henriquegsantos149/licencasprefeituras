"""Update user roles: GESTOR to LICENCIADOR

Revision ID: update_roles_to_licenciador
Revises: add_company_relationships
Create Date: 2026-01-27 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'update_roles_to_licenciador'
down_revision: Union[str, None] = 'add_company_relationships'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First, update the enum type to include 'licenciador' and convert to lowercase
    # PostgreSQL requires creating a new enum and migrating
    op.execute(text("""
        -- Create new enum with updated values (lowercase)
        CREATE TYPE userrole_new AS ENUM ('empreendedor', 'licenciador', 'admin');
        
        -- Update column to use new enum, converting from old uppercase values
        ALTER TABLE users 
        ALTER COLUMN role TYPE userrole_new 
        USING CASE 
            WHEN role::text = 'EMPREENDEDOR' OR LOWER(role::text) = 'empreendedor' THEN 'empreendedor'::userrole_new
            WHEN role::text = 'GESTOR' OR LOWER(role::text) = 'gestor' THEN 'licenciador'::userrole_new
            WHEN role::text = 'ADMIN' OR LOWER(role::text) = 'admin' THEN 'admin'::userrole_new
            ELSE 'empreendedor'::userrole_new
        END;
        
        -- Drop old enum and rename new one
        DROP TYPE userrole;
        ALTER TYPE userrole_new RENAME TO userrole;
    """))


def downgrade() -> None:
    # Revert enum type: convert 'licenciador' back to 'gestor'
    op.execute(text("""
        -- Create old enum with 'gestor' instead of 'licenciador'
        CREATE TYPE userrole_old AS ENUM ('empreendedor', 'gestor', 'admin');
        
        -- Update column to use old enum, converting 'licenciador' back to 'gestor'
        ALTER TABLE users 
        ALTER COLUMN role TYPE userrole_old 
        USING CASE 
            WHEN role::text = 'empreendedor' THEN 'empreendedor'::userrole_old
            WHEN role::text = 'licenciador' THEN 'gestor'::userrole_old
            WHEN role::text = 'admin' THEN 'admin'::userrole_old
            ELSE 'empreendedor'::userrole_old
        END;
        
        -- Drop new enum and rename old one
        DROP TYPE userrole;
        ALTER TYPE userrole_old RENAME TO userrole;
    """))
