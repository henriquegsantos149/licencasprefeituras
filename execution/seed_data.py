#!/usr/bin/env python3
"""
Script to seed the database with initial data (activities).
This should be run after migrations are applied.
"""
import sys
import os
from pathlib import Path
import unicodedata
import re

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.activity import Activity

def slugify(text: str) -> str:
    """
    Create a stable ASCII slug for Activity.id.
    """
    text = (text or "").strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.replace("/", " ")
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return text

def get_activities_seed_data():
    """
    Seed dataset based on the richer catalog that exists in code
    (`rota-do-licenciamento/src/context/WorkflowContext.jsx`).
    """
    activities = [
        # Agropecuária
        {
            "name": "Avicultura",
            "category": "Agropecuária",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "car", "label": "Cadastro Ambiental Rural (CAR)", "required": True},
                {"id": "water", "label": "Outorga de Uso da Água (AESA)", "required": True},
                {"id": "manejo", "label": "Plano de Manejo", "required": True},
            ],
            "questions": [
                {"id": "num_animais", "label": "Número de animais/cabeças", "type": "number"},
                {"id": "app_reserva", "label": "Possui Área de Preservação Permanente (APP) ou Reserva Legal?", "type": "select", "options": ["Sim", "Não"]},
                {"id": "water_source", "label": "Fonte de abastecimento", "type": "select", "options": ["Poço", "Açude", "Rio", "CAGEPA"]},
            ],
        },
        {
            "name": "Suinocultura",
            "category": "Agropecuária",
            "risk_level": "Alto",
            "required_documents": [
                {"id": "car", "label": "Cadastro Ambiental Rural (CAR)", "required": True},
                {"id": "water", "label": "Outorga de Uso da Água (AESA)", "required": True},
                {"id": "dejetos", "label": "Projeto de Tratamento de Dejetos", "required": True},
            ],
            "questions": [
                {"id": "num_animais", "label": "Número de animais/cabeças", "type": "number"},
                {"id": "dist_moradias", "label": "Distância de moradias (metros)", "type": "number"},
            ],
        },
        {
            "name": "Bovinocultura",
            "category": "Agropecuária",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "car", "label": "Cadastro Ambiental Rural (CAR)", "required": True},
                {"id": "sanitario", "label": "Atestado Sanitário do Rebanho", "required": True},
            ],
            "questions": [
                {"id": "area_pastagem", "label": "Área de pastagem (hectares)", "type": "number"},
                {"id": "sis_confinamento", "label": "Sistema de confinamento?", "type": "select", "options": ["Sim", "Não"]},
            ],
        },
        {
            "name": "Piscicultura",
            "category": "Agropecuária",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "car", "label": "Cadastro Ambiental Rural (CAR)", "required": True},
                {"id": "water", "label": "Outorga de Uso da Água (AESA)", "required": True},
                {"id": "projeto_tanque", "label": "Projeto dos Tanques/Viveiros", "required": True},
            ],
            "questions": [
                {"id": "lamina_agua", "label": "Lâmina d'água total (hectares)", "type": "number"},
                {"id": "especie", "label": "Espécie cultivada", "type": "text"},
            ],
        },

        # Indústrias
        {
            "name": "Padaria",
            "category": "Indústria de Produtos Alimentares",
            "risk_level": "Baixo",
            "required_documents": [
                {"id": "alvara", "label": "Alvará de Funcionamento", "required": True},
                {"id": "dedetizacao", "label": "Comprovante de Dedetização", "required": True},
            ],
            "questions": [
                {"id": "combustivel_forno", "label": "Combustível do forno", "type": "select", "options": ["Elétrico", "Gás", "Lenha"]},
                {"id": "lenha_origem", "label": "Origem da lenha (se aplicável)", "type": "text"},
            ],
        },
        {
            "name": "Serralharia",
            "category": "Indústria Metalúrgica",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "ruido", "label": "Laudo de Ruído", "required": False},
                {"id": "residuos", "label": "Destinação de Resíduos Metálicos", "required": True},
            ],
            "questions": [
                {"id": "area_coberta", "label": "Área coberta (m²)", "type": "number"},
                {"id": "pintura", "label": "Possui cabine de pintura?", "type": "select", "options": ["Sim", "Não"]},
            ],
        },
        # Existing IDs in DB are "laticinio" and "posto-combustivel", keep them stable
        {
            "id": "laticinio",
            "name": "Laticínio",
            "category": "Indústria de Transformação",
            "risk_level": "Médio/Alto",
            "required_documents": [
                {"id": "pgrs", "label": "Plano de Gerenciamento de Resíduos Sólidos (PGRS)", "required": True},
                {"id": "effluents", "label": "Projeto de Efluentes Líquidos", "required": True},
                {"id": "water", "label": "Outorga de Uso da Água (AESA)", "required": True},
                {"id": "manual", "label": "Manual de Boas Práticas", "required": True},
                {"id": "memorial", "label": "Memorial Descritivo do Processo", "required": True},
            ],
            "questions": [
                {"id": "water_source", "label": "Fonte de abastecimento de água", "type": "select", "options": ["Poço Tubular", "Açude", "Rio/Corpo Hídrico", "CAGEPA"]},
                {"id": "vol_leite", "label": "Volume de leite processado (litros/dia)", "type": "number"},
            ],
        },
        {
            "name": "Casa de Farinha",
            "category": "Indústria de Produtos Alimentares",
            "risk_level": "Baixo",
            "required_documents": [
                {"id": "manipueira", "label": "Solução para Manipueira", "required": True},
            ],
            "questions": [
                {"id": "capacidade", "label": "Capacidade de produção (kg/dia)", "type": "number"},
            ],
        },
        {
            "name": "Beneficiamento de Frutas",
            "category": "Indústria de Produtos Alimentares",
            "risk_level": "Baixo/Médio",
            "required_documents": [
                {"id": "pgrs", "label": "PGRS", "required": True},
            ],
            "questions": [
                {"id": "processo", "label": "Tipo de processamento (polpa, doce, suco)", "type": "text"},
            ],
        },
        {
            "name": "Fábrica de Gelo",
            "category": "Indústria Diversa",
            "risk_level": "Baixo",
            "required_documents": [
                {"id": "water_analise", "label": "Análise de Potabilidade da Água", "required": True},
                {"id": "water_outorga", "label": "Outorga (AESA)", "required": True},
            ],
            "questions": [
                {"id": "amonia", "label": "Utiliza amônia no resfriamento?", "type": "select", "options": ["Sim", "Não"]},
            ],
        },

        # Comércio e Serviços
        {
            "name": "Oficina Mecânica",
            "category": "Serviços de Manutenção",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "csao", "label": "Caixa Separadora de Água e Óleo (CSAO)", "required": True},
                {"id": "oleo", "label": "Contrato de recolhimento de óleo usado", "required": True},
                {"id": "pgrs", "label": "PGRS", "required": True},
            ],
            "questions": [
                {"id": "num_elevadores", "label": "Número de elevadores/box", "type": "number"},
                {"id": "lavagem", "label": "Realiza lavagem de peças/veículos?", "type": "select", "options": ["Sim", "Não"]},
            ],
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
                {"id": "emergency", "label": "Plano de Emergência e Contingência", "required": True},
            ],
            "questions": [
                {"id": "tanques", "label": "Quantidade de tanques", "type": "number"},
                {"id": "monitoramento", "label": "Possui poços de monitoramento?", "type": "select", "options": ["Sim", "Não"]},
            ],
        },
        {
            "name": "Hotel/Pousada",
            "category": "Turismo e Hotelaria",
            "risk_level": "Baixo",
            "required_documents": [
                {"id": "esgoto", "label": "Ligação de Esgoto ou Fossa Séptica", "required": True},
                {"id": "dedetizacao", "label": "Comprovante de Dedetização", "required": True},
            ],
            "questions": [
                {"id": "num_leitos", "label": "Número de leitos", "type": "number"},
                {"id": "piscina", "label": "Possui piscina?", "type": "select", "options": ["Sim", "Não"]},
            ],
        },
        {
            "name": "Clínica Médica/Odontológica",
            "category": "Saúde",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "pgrss", "label": "Plano de Ger. Resíduos de Saúde (PGRSS)", "required": True},
                {"id": "contrato_lixo", "label": "Contrato com empresa de coleta (Infectante)", "required": True},
            ],
            "questions": [
                {"id": "raiox", "label": "Possui aparelho de Raio-X?", "type": "select", "options": ["Sim", "Não"]},
            ],
        },
        {
            "name": "Laboratório",
            "category": "Saúde",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "pgrss", "label": "PGRSS", "required": True},
            ],
            "questions": [],
        },
        {
            "name": "Centro Educacional",
            "category": "Educação",
            "risk_level": "Baixo",
            "required_documents": [
                {"id": "alvara", "label": "Alvará", "required": True},
                {"id": "bombeiros", "label": "AVCB (Bombeiros)", "required": True},
            ],
            "questions": [
                {"id": "alunos", "label": "Número de alunos", "type": "number"},
                {"id": "area_total", "label": "Área total (m²)", "type": "number"},
            ],
        },
        {
            "name": "Cemitério",
            "category": "Serviços Funerários",
            "risk_level": "Alto",
            "required_documents": [
                {"id": "geo", "label": "Estudo Geológico/Hidrogeológico", "required": True},
                {"id": "plano_cemiterio", "label": "Plano Diretor do Cemitério", "required": True},
            ],
            "questions": [
                {"id": "profundidade", "label": "Profundidade do lençol freático (m)", "type": "number"},
            ],
        },

        # Obras Civis
        {
            "name": "Pavimentação",
            "category": "Infraestrutura",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "projeto_viario", "label": "Projeto Geométrico/Viário", "required": True},
                {"id": "drenagem", "label": "Projeto de Drenagem", "required": True},
            ],
            "questions": [
                {"id": "extensao", "label": "Extensão da obra (km)", "type": "number"},
            ],
        },
        {
            "name": "Drenagem",
            "category": "Infraestrutura",
            "risk_level": "Médio",
            "required_documents": [
                {"id": "projeto_hidro", "label": "Projeto Hidráulico", "required": True},
            ],
            "questions": [
                {"id": "corpo_receptor", "label": "Corpo hídrico receptor", "type": "text"},
            ],
        },
        {
            "name": "Loteamento",
            "category": "Parcelamento do Solo",
            "risk_level": "Alto",
            "required_documents": [
                {"id": "urbanistico", "label": "Projeto Urbanístico Aprovado", "required": True},
                {"id": "agua_esgoto", "label": "Carta de Viabilidade (Água/Esgoto e Energia)", "required": True},
                {"id": "lap", "label": "Licença Prévia (LP) anterior", "required": False},
            ],
            "questions": [
                {"id": "num_lotes", "label": "Número de lotes", "type": "number"},
                {"id": "area_total_lot", "label": "Área total da gleba (hectares)", "type": "number"},
            ],
        },
        {
            "name": "Condomínio",
            "category": "Parcelamento do Solo",
            "risk_level": "Alto",
            "required_documents": [
                {"id": "projeto_arq", "label": "Projeto Arquitetônico", "required": True},
                {"id": "esgoto_cond", "label": "Projeto da ETE do Condomínio", "required": True},
            ],
            "questions": [
                {"id": "unidades", "label": "Número de unidades habitacionais", "type": "number"},
            ],
        },
        {
            "name": "Reforma de Prédio Público",
            "category": "Obras Civis",
            "risk_level": "Baixo",
            "required_documents": [
                {"id": "memorial_obra", "label": "Memorial Descritivo da Obra", "required": True},
                {"id": "residuos_const", "label": "PGRCC (Resíduos da Construção)", "required": True},
            ],
            "questions": [
                {"id": "area_const", "label": "Área a ser reformada (m²)", "type": "number"},
            ],
        },
    ]

    # Fill missing IDs deterministically
    normalized = []
    for a in activities:
        item = dict(a)
        item["id"] = item.get("id") or slugify(item["name"])
        item.setdefault("required_documents", [])
        item.setdefault("questions", [])
        normalized.append(item)

    return normalized

def seed_data():
    """Seed database with activities (insert missing + update existing)."""
    print("Seeding database with initial data...")
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if activities already exist
        existing_count = db.query(Activity).count()
        seed_activities = get_activities_seed_data()

        if existing_count > 0:
            print(f"ℹ️  Database already has {existing_count} activities. Upserting seed catalog...")
        else:
            print("Populating initial activities...")

        inserted = 0
        updated = 0
        for activity_data in seed_activities:
            activity = db.query(Activity).filter(Activity.id == activity_data["id"]).first()
            if activity:
                for k, v in activity_data.items():
                    setattr(activity, k, v)
                updated += 1
            else:
                db.add(Activity(**activity_data))
                inserted += 1

        db.commit()
        print(f"✓ Upsert completed: inserted={inserted}, updated={updated}, total_seed={len(seed_activities)}")
        
    except Exception as e:
        print(f"✗ Error populating database: {e}")
        db.rollback()
        raise
    finally:
        db.close()
    
    print("\n✓ Database seeding completed successfully!")


if __name__ == "__main__":
    seed_data()
