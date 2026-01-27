"""Add user preferences field

Revision ID: add_user_preferences
Revises: 49276bf7c3fa
Create Date: 2026-01-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_user_preferences'
down_revision: Union[str, None] = '49276bf7c3fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add preferences column to users table
    op.add_column('users', sa.Column('preferences', sa.JSON(), nullable=True))
    # Set default preferences for existing users
    op.execute("""
        UPDATE users 
        SET preferences = '{"darkMode": false, "notifications": true}'::jsonb 
        WHERE preferences IS NULL
    """)


def downgrade() -> None:
    # Remove preferences column from users table
    op.drop_column('users', 'preferences')
