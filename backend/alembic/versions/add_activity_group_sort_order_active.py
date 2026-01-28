"""Add activity group/sort_order/is_active

Revision ID: act_group_sort_active
Revises: create_roles_and_permissions
Create Date: 2026-01-28

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "act_group_sort_active"
down_revision: Union[str, None] = "create_roles_and_permissions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("activities", sa.Column("group_name", sa.String(), nullable=True))
    op.add_column("activities", sa.Column("sort_order", sa.Integer(), nullable=True))
    op.add_column(
        "activities",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index(op.f("ix_activities_sort_order"), "activities", ["sort_order"], unique=False)

    # Data migration: ensure the activities catalog matches the original hardcoded list
    # (groups + ordering + docs/questions).
    activities = [
        # Agropecuária
        {
            "id": "avicultura",
            "name": "Avicultura",
            "group_name": "Agropecuária",
            "category": "Agropecuária",
            "risk_level": "Médio",
            "sort_order": 0,
            "is_active": True,
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
            "id": "suinocultura",
            "name": "Suinocultura",
            "group_name": "Agropecuária",
            "category": "Agropecuária",
            "risk_level": "Alto",
            "sort_order": 1,
            "is_active": True,
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
            "id": "bovinocultura",
            "name": "Bovinocultura",
            "group_name": "Agropecuária",
            "category": "Agropecuária",
            "risk_level": "Médio",
            "sort_order": 2,
            "is_active": True,
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
            "id": "piscicultura",
            "name": "Piscicultura",
            "group_name": "Agropecuária",
            "category": "Agropecuária",
            "risk_level": "Médio",
            "sort_order": 3,
            "is_active": True,
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
            "id": "padaria",
            "name": "Padaria",
            "group_name": "Indústrias",
            "category": "Indústria de Produtos Alimentares",
            "risk_level": "Baixo",
            "sort_order": 4,
            "is_active": True,
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
            "id": "serralharia",
            "name": "Serralharia",
            "group_name": "Indústrias",
            "category": "Indústria Metalúrgica",
            "risk_level": "Médio",
            "sort_order": 5,
            "is_active": True,
            "required_documents": [
                {"id": "ruido", "label": "Laudo de Ruído", "required": False},
                {"id": "residuos", "label": "Destinação de Resíduos Metálicos", "required": True},
            ],
            "questions": [
                {"id": "area_coberta", "label": "Área coberta (m²)", "type": "number"},
                {"id": "pintura", "label": "Possui cabine de pintura?", "type": "select", "options": ["Sim", "Não"]},
            ],
        },
        {
            "id": "laticinio",
            "name": "Laticínio",
            "group_name": "Indústrias",
            "category": "Indústria de Transformação",
            "risk_level": "Médio/Alto",
            "sort_order": 6,
            "is_active": True,
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
            "id": "casa-de-farinha",
            "name": "Casa de Farinha",
            "group_name": "Indústrias",
            "category": "Indústria de Produtos Alimentares",
            "risk_level": "Baixo",
            "sort_order": 7,
            "is_active": True,
            "required_documents": [{"id": "manipueira", "label": "Solução para Manipueira", "required": True}],
            "questions": [{"id": "capacidade", "label": "Capacidade de produção (kg/dia)", "type": "number"}],
        },
        {
            "id": "beneficiamento-de-frutas",
            "name": "Beneficiamento de Frutas",
            "group_name": "Indústrias",
            "category": "Indústria de Produtos Alimentares",
            "risk_level": "Baixo/Médio",
            "sort_order": 8,
            "is_active": True,
            "required_documents": [{"id": "pgrs", "label": "PGRS", "required": True}],
            "questions": [{"id": "processo", "label": "Tipo de processamento (polpa, doce, suco)", "type": "text"}],
        },
        {
            "id": "fabrica-de-gelo",
            "name": "Fábrica de Gelo",
            "group_name": "Indústrias",
            "category": "Indústria Diversa",
            "risk_level": "Baixo",
            "sort_order": 9,
            "is_active": True,
            "required_documents": [
                {"id": "water_analise", "label": "Análise de Potabilidade da Água", "required": True},
                {"id": "water_outorga", "label": "Outorga (AESA)", "required": True},
            ],
            "questions": [{"id": "amonia", "label": "Utiliza amônia no resfriamento?", "type": "select", "options": ["Sim", "Não"]}],
        },

        # Comércio e Serviços
        {
            "id": "oficina-mecanica",
            "name": "Oficina Mecânica",
            "group_name": "Comércio e Serviços",
            "category": "Serviços de Manutenção",
            "risk_level": "Médio",
            "sort_order": 10,
            "is_active": True,
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
            "group_name": "Comércio e Serviços",
            "category": "Comércio Varejista de Combustíveis",
            "risk_level": "Alto",
            "sort_order": 11,
            "is_active": True,
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
            "id": "hotel-pousada",
            "name": "Hotel/Pousada",
            "group_name": "Comércio e Serviços",
            "category": "Turismo e Hotelaria",
            "risk_level": "Baixo",
            "sort_order": 12,
            "is_active": True,
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
            "id": "clinica-medica-odontologica",
            "name": "Clínica Médica/Odontológica",
            "group_name": "Comércio e Serviços",
            "category": "Saúde",
            "risk_level": "Médio",
            "sort_order": 13,
            "is_active": True,
            "required_documents": [
                {"id": "pgrss", "label": "Plano de Ger. Resíduos de Saúde (PGRSS)", "required": True},
                {"id": "contrato_lixo", "label": "Contrato com empresa de coleta (Infectante)", "required": True},
            ],
            "questions": [{"id": "raiox", "label": "Possui aparelho de Raio-X?", "type": "select", "options": ["Sim", "Não"]}],
        },
        {
            "id": "laboratorio",
            "name": "Laboratório",
            "group_name": "Comércio e Serviços",
            "category": "Saúde",
            "risk_level": "Médio",
            "sort_order": 14,
            "is_active": True,
            "required_documents": [{"id": "pgrss", "label": "PGRSS", "required": True}],
            "questions": [],
        },
        {
            "id": "centro-educacional",
            "name": "Centro Educacional",
            "group_name": "Comércio e Serviços",
            "category": "Educação",
            "risk_level": "Baixo",
            "sort_order": 15,
            "is_active": True,
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
            "id": "cemiterio",
            "name": "Cemitério",
            "group_name": "Comércio e Serviços",
            "category": "Serviços Funerários",
            "risk_level": "Alto",
            "sort_order": 16,
            "is_active": True,
            "required_documents": [
                {"id": "geo", "label": "Estudo Geológico/Hidrogeológico", "required": True},
                {"id": "plano_cemiterio", "label": "Plano Diretor do Cemitério", "required": True},
            ],
            "questions": [{"id": "profundidade", "label": "Profundidade do lençol freático (m)", "type": "number"}],
        },

        # Obras Civis
        {
            "id": "pavimentacao",
            "name": "Pavimentação",
            "group_name": "Obras Civis",
            "category": "Infraestrutura",
            "risk_level": "Médio",
            "sort_order": 17,
            "is_active": True,
            "required_documents": [
                {"id": "projeto_viario", "label": "Projeto Geométrico/Viário", "required": True},
                {"id": "drenagem", "label": "Projeto de Drenagem", "required": True},
            ],
            "questions": [{"id": "extensao", "label": "Extensão da obra (km)", "type": "number"}],
        },
        {
            "id": "drenagem",
            "name": "Drenagem",
            "group_name": "Obras Civis",
            "category": "Infraestrutura",
            "risk_level": "Médio",
            "sort_order": 18,
            "is_active": True,
            "required_documents": [{"id": "projeto_hidro", "label": "Projeto Hidráulico", "required": True}],
            "questions": [{"id": "corpo_receptor", "label": "Corpo hídrico receptor", "type": "text"}],
        },
        {
            "id": "loteamento",
            "name": "Loteamento",
            "group_name": "Obras Civis",
            "category": "Parcelamento do Solo",
            "risk_level": "Alto",
            "sort_order": 19,
            "is_active": True,
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
            "id": "condominio",
            "name": "Condomínio",
            "group_name": "Obras Civis",
            "category": "Parcelamento do Solo",
            "risk_level": "Alto",
            "sort_order": 20,
            "is_active": True,
            "required_documents": [
                {"id": "projeto_arq", "label": "Projeto Arquitetônico", "required": True},
                {"id": "esgoto_cond", "label": "Projeto da ETE do Condomínio", "required": True},
            ],
            "questions": [{"id": "unidades", "label": "Número de unidades habitacionais", "type": "number"}],
        },
        {
            "id": "reforma-de-predio-publico",
            "name": "Reforma de Prédio Público",
            "group_name": "Obras Civis",
            "category": "Obras Civis",
            "risk_level": "Baixo",
            "sort_order": 21,
            "is_active": True,
            "required_documents": [
                {"id": "memorial_obra", "label": "Memorial Descritivo da Obra", "required": True},
                {"id": "residuos_const", "label": "PGRCC (Resíduos da Construção)", "required": True},
            ],
            "questions": [{"id": "area_const", "label": "Área a ser reformada (m²)", "type": "number"}],
        },
    ]

    seed_ids = {a["id"] for a in activities}
    activities_table = sa.table(
        "activities",
        sa.column("id", sa.String()),
        sa.column("name", sa.String()),
        sa.column("group_name", sa.String()),
        sa.column("category", sa.String()),
        sa.column("risk_level", sa.String()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_active", sa.Boolean()),
        sa.column("required_documents", sa.JSON()),
        sa.column("questions", sa.JSON()),
    )

    bind = op.get_bind()

    for row in activities:
        stmt = postgresql.insert(activities_table).values(**row)
        stmt = stmt.on_conflict_do_update(
            index_elements=["id"],
            set_={
                "name": stmt.excluded.name,
                "group_name": stmt.excluded.group_name,
                "category": stmt.excluded.category,
                "risk_level": stmt.excluded.risk_level,
                "sort_order": stmt.excluded.sort_order,
                "is_active": stmt.excluded.is_active,
                "required_documents": stmt.excluded.required_documents,
                "questions": stmt.excluded.questions,
            },
        )
        bind.execute(stmt)

    # Deactivate any legacy activities not in the canonical catalog
    bind.execute(
        sa.text('UPDATE activities SET is_active = FALSE WHERE id NOT IN :ids').bindparams(
            sa.bindparam("ids", expanding=True, value=sorted(seed_ids))
        )
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_activities_sort_order"), table_name="activities")
    op.drop_column("activities", "is_active")
    op.drop_column("activities", "sort_order")
    op.drop_column("activities", "group_name")

