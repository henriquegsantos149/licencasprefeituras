"""Convert user preferences from JSON column to separate table

Revision ID: convert_preferences_to_table
Revises: add_user_preferences
Create Date: 2026-01-27 13:00:00.000000

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, text


# revision identifiers, used by Alembic.
revision: str = 'convert_preferences_to_table'
down_revision: Union[str, None] = 'add_user_preferences'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def table_exists(table_name: str) -> bool:
    """Check if a table exists."""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    # Create user_preferences table
    if not table_exists('user_preferences'):
        op.create_table(
            'user_preferences',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('user_id', sa.String(), nullable=False),
            sa.Column('dark_mode', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('notifications', sa.Boolean(), nullable=False, server_default='true'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_user_preferences_id'), 'user_preferences', ['id'], unique=False)
        op.create_index(op.f('ix_user_preferences_user_id'), 'user_preferences', ['user_id'], unique=True)
    
    # Migrate data from JSON column to new table
    if column_exists('users', 'preferences'):
        # Get connection
        conn = op.get_bind()
        
        # Get all users with their preferences
        result = conn.execute(text("""
            SELECT id, preferences 
            FROM users
        """))
        
        users = result.fetchall()
        
        # Insert preferences into new table
        for user_id, preferences_json in users:
            # Parse preferences JSON
            dark_mode = False
            notifications = True
            
            if preferences_json:
                # Extract values from JSON
                if isinstance(preferences_json, dict):
                    dark_mode = preferences_json.get('darkMode', False)
                    notifications = preferences_json.get('notifications', True)
                elif isinstance(preferences_json, str):
                    # Handle string JSON if needed
                    import json
                    try:
                        prefs = json.loads(preferences_json)
                        dark_mode = prefs.get('darkMode', False)
                        notifications = prefs.get('notifications', True)
                    except:
                        pass
            
            # Generate ID for user_preferences
            pref_id = str(uuid.uuid4())
            
            # Insert into user_preferences table
            conn.execute(text("""
                INSERT INTO user_preferences (id, user_id, dark_mode, notifications)
                VALUES (:id, :user_id, :dark_mode, :notifications)
                ON CONFLICT (user_id) DO UPDATE
                SET dark_mode = EXCLUDED.dark_mode,
                    notifications = EXCLUDED.notifications
            """), {
                'id': pref_id,
                'user_id': user_id,
                'dark_mode': dark_mode,
                'notifications': notifications
            })
        
        # Remove the JSON column from users table
        op.drop_column('users', 'preferences')


def downgrade() -> None:
    # Add preferences column back to users table
    if not column_exists('users', 'preferences'):
        op.add_column('users', sa.Column('preferences', sa.JSON(), nullable=True))
    
    # Migrate data back from table to JSON column
    if table_exists('user_preferences'):
        conn = op.get_bind()
        
        # Get all user preferences
        result = conn.execute(text("""
            SELECT user_id, dark_mode, notifications
            FROM user_preferences
        """))
        
        prefs_list = result.fetchall()
        
        # Update users table with JSON preferences
        for user_id, dark_mode, notifications in prefs_list:
            import json
            prefs_json = json.dumps({
                'darkMode': dark_mode,
                'notifications': notifications
            })
            
            conn.execute(text("""
                UPDATE users
                SET preferences = :prefs::jsonb
                WHERE id = :user_id
            """), {
                'prefs': prefs_json,
                'user_id': user_id
            })
        
        # Drop user_preferences table
        op.drop_index(op.f('ix_user_preferences_user_id'), table_name='user_preferences')
        op.drop_index(op.f('ix_user_preferences_id'), table_name='user_preferences')
        op.drop_table('user_preferences')
