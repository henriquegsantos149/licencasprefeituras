#!/usr/bin/env python3
"""
Script to seed the database with initial data (activities).
This should be run after migrations are applied.
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.activity import Activity

def seed_data():
    """Seed database with initial activities."""
    print("Seeding database with initial data...")
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if activities already exist
        existing_count = db.query(Activity).count()
        if existing_count > 0:
            print(f"✓ Database already has {existing_count} activities. Skipping seed data.")
            return
        
        print("Populating initial activities...")
        
        # Define initial activities based on frontend data
        activities_data = [
            {
                "id": "laticinio",
                "name": "Laticínio",
                "category": "Indústria de Transformação",
                "risk_level": "Médio/Alto",
                "required_documents": [
                    {"id": "pgrs", "label": "Plano de Gerenciamento de Resíduos Sólidos (PGRS)", "required": True},
                    {"id": "effluents", "label": "Projeto de Efluentes Líquidos", "required": True},
                    {"id": "water", "label": "Outorga de Uso da Água (AESA)", "required": True},
                    {"id": "manual", "label": "Manual de Boas Práticas", "required": True}
                ],
                "questions": [
                    {"id": "water_source", "label": "Fonte de abastecimento de água", "type": "select", "options": ["Poço Tubular", "Açude", "Rio/Corpo Hídrico", "CAGEPA"]}
                ]
            },
            {
                "id": "posto-combustivel",
                "name": "Posto de Combustível",
                "category": "Comércio Varejista de Combustíveis",
                "risk_level": "Alto",
                "required_documents": [
                    {"id": "sasc", "label": "Teste de Estanqueidade (SASC)", "required": True},
                    {"id": "csao", "label": "Caixa Separadora (CSAO) - Projeto/Laudo", "required": True},
                    {"id": "anp", "label": "Licença da ANP", "required": True},
                    {"id": "emergency", "label": "Plano de Emergência e Contingência", "required": True}
                ],
                "questions": []
            },
            {
                "id": "pequeno-porte",
                "name": "Pequeno Porte (Padaria/Lava-Jato)",
                "category": "Serviços / Comércio",
                "risk_level": "Baixo",
                "required_documents": [
                    {"id": "alvara", "label": "Alvará da Prefeitura", "required": True},
                    {"id": "waste_dest", "label": "Comprovante Destinação de Resíduos", "required": True},
                    {"id": "sewage", "label": "Ligação Esgoto ou Fossa Séptica", "required": True}
                ],
                "questions": []
            }
        ]
        
        # Insert activities
        for activity_data in activities_data:
            activity = Activity(**activity_data)
            db.add(activity)
        
        db.commit()
        print(f"✓ Successfully inserted {len(activities_data)} activities")
        
    except Exception as e:
        print(f"✗ Error populating database: {e}")
        db.rollback()
        raise
    finally:
        db.close()
    
    print("\n✓ Database seeding completed successfully!")


if __name__ == "__main__":
    seed_data()
