import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkflowContext = createContext();

export const useWorkflow = () => useContext(WorkflowContext);

export const ACTIVITIES = {
    // Grupo: Agropecuária
    'Avicultura': {
        group: 'Agropecuária',
        category: 'Agropecuária',
        risk: 'Médio',
        docs: [
            { id: 'car', label: 'Cadastro Ambiental Rural (CAR)', required: true },
            { id: 'water', label: 'Outorga de Uso da Água (AESA)', required: true },
            { id: 'manejo', label: 'Plano de Manejo', required: true }
        ],
        questions: [
            { id: 'num_animais', label: 'Número de animais/cabeças', type: 'number' },
            { id: 'app_reserva', label: 'Possui Área de Preservação Permanente (APP) ou Reserva Legal?', type: 'select', options: ['Sim', 'Não'] },
            { id: 'water_source', label: 'Fonte de abastecimento', type: 'select', options: ['Poço', 'Açude', 'Rio', 'CAGEPA'] }
        ]
    },
    'Suinocultura': {
        group: 'Agropecuária',
        category: 'Agropecuária',
        risk: 'Alto',
        docs: [
            { id: 'car', label: 'Cadastro Ambiental Rural (CAR)', required: true },
            { id: 'water', label: 'Outorga de Uso da Água (AESA)', required: true },
            { id: 'dejetos', label: 'Projeto de Tratamento de Dejetos', required: true }
        ],
        questions: [
            { id: 'num_animais', label: 'Número de animais/cabeças', type: 'number' },
            { id: 'dist_moradias', label: 'Distância de moradias (metros)', type: 'number' }
        ]
    },
    'Bovinocultura': {
        group: 'Agropecuária',
        category: 'Agropecuária',
        risk: 'Médio',
        docs: [
            { id: 'car', label: 'Cadastro Ambiental Rural (CAR)', required: true },
            { id: 'sanitario', label: 'Atestado Sanitário do Rebanho', required: true }
        ],
        questions: [
            { id: 'area_pastagem', label: 'Área de pastagem (hectares)', type: 'number' },
            { id: 'sis_confinamento', label: 'Sistema de confinamento?', type: 'select', options: ['Sim', 'Não'] }
        ]
    },
    'Piscicultura': {
        group: 'Agropecuária',
        category: 'Agropecuária',
        risk: 'Médio',
        docs: [
            { id: 'car', label: 'Cadastro Ambiental Rural (CAR)', required: true },
            { id: 'water', label: 'Outorga de Uso da Água (AESA)', required: true },
            { id: 'projeto_tanque', label: 'Projeto dos Tanques/Viveiros', required: true }
        ],
        questions: [
            { id: 'lamina_agua', label: 'Lâmina d\'água total (hectares)', type: 'number' },
            { id: 'especie', label: 'Espécie cultivada', type: 'text' }
        ]
    },

    // Grupo: Indústrias
    'Padaria': {
        group: 'Indústrias',
        category: 'Indústria de Produtos Alimentares',
        risk: 'Baixo',
        docs: [
            { id: 'alvara', label: 'Alvará de Funcionamento', required: true },
            { id: 'dedetizacao', label: 'Comprovante de Dedetização', required: true }
        ],
        questions: [
            { id: 'combustivel_forno', label: 'Combustível do forno', type: 'select', options: ['Elétrico', 'Gás', 'Lenha'] },
            { id: 'lenha_origem', label: 'Origem da lenha (se aplicável)', type: 'text' }
        ]
    },
    'Serralharia': {
        group: 'Indústrias',
        category: 'Indústria Metalúrgica',
        risk: 'Médio',
        docs: [
            { id: 'ruido', label: 'Laudo de Ruído', required: false },
            { id: 'residuos', label: 'Destinação de Resíduos Metálicos', required: true }
        ],
        questions: [
            { id: 'area_coberta', label: 'Área coberta (m²)', type: 'number' },
            { id: 'pintura', label: 'Possui cabine de pintura?', type: 'select', options: ['Sim', 'Não'] }
        ]
    },
    'Laticínio': {
        group: 'Indústrias',
        category: 'Indústria de Transformação',
        risk: 'Médio/Alto',
        docs: [
            { id: 'pgrs', label: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS)', required: true },
            { id: 'effluents', label: 'Projeto de Efluentes Líquidos', required: true },
            { id: 'water', label: 'Outorga de Uso da Água (AESA)', required: true },
            { id: 'manual', label: 'Manual de Boas Práticas', required: true },
            { id: 'memorial', label: 'Memorial Descritivo do Processo', required: true }
        ],
        questions: [
            { id: 'water_source', label: 'Fonte de abastecimento de água', type: 'select', options: ['Poço Tubular', 'Açude', 'Rio/Corpo Hídrico', 'CAGEPA'] },
            { id: 'vol_leite', label: 'Volume de leite processado (litros/dia)', type: 'number' }
        ]
    },
    'Casa de Farinha': {
        group: 'Indústrias',
        category: 'Indústria de Produtos Alimentares',
        risk: 'Baixo',
        docs: [
            { id: 'manipueira', label: 'Solução para Manipueira', required: true }
        ],
        questions: [
            { id: 'capacidade', label: 'Capacidade de produção (kg/dia)', type: 'number' }
        ]
    },
    'Beneficiamento de Frutas': {
        group: 'Indústrias',
        category: 'Indústria de Produtos Alimentares',
        risk: 'Baixo/Médio',
        docs: [
            { id: 'pgrs', label: 'PGRS', required: true }
        ],
        questions: [
            { id: 'processo', label: 'Tipo de processamento (polpa, doce, suco)', type: 'text' }
        ]
    },
    'Fábrica de Gelo': {
        group: 'Indústrias',
        category: 'Indústria Diversa',
        risk: 'Baixo',
        docs: [
            { id: 'water_analise', label: 'Análise de Potabilidade da Água', required: true },
            { id: 'water_outorga', label: 'Outorga (AESA)', required: true }
        ],
        questions: [
            { id: 'amonia', label: 'Utiliza amônia no resfriamento?', type: 'select', options: ['Sim', 'Não'] }
        ]
    },

    // Grupo: Comércio e Serviços
    'Oficina Mecânica': {
        group: 'Comércio e Serviços',
        category: 'Serviços de Manutenção',
        risk: 'Médio',
        docs: [
            { id: 'csao', label: 'Caixa Separadora de Água e Óleo (CSAO)', required: true },
            { id: 'oleo', label: 'Contrato de recolhimento de óleo usado', required: true },
            { id: 'pgrs', label: 'PGRS', required: true }
        ],
        questions: [
            { id: 'num_elevadores', label: 'Número de elevadores/box', type: 'number' },
            { id: 'lavagem', label: 'Realiza lavagem de peças/veículos?', type: 'select', options: ['Sim', 'Não'] }
        ]
    },
    'Posto de Combustível': {
        group: 'Comércio e Serviços',
        category: 'Comércio Varejista de Combustíveis',
        risk: 'Alto',
        docs: [
            { id: 'sasc', label: 'Teste de Estanqueidade (SASC)', required: true },
            { id: 'csao', label: 'Caixa Separadora (CSAO) - Projeto/Laudo', required: true },
            { id: 'anp', label: 'Licença da ANP', required: true },
            { id: 'emergency', label: 'Plano de Emergência e Contingência', required: true }
        ],
        questions: [
            { id: 'tanques', label: 'Quantidade de tanques', type: 'number' },
            { id: 'monitoramento', label: 'Possui poços de monitoramento?', type: 'select', options: ['Sim', 'Não'] }
        ]
    },
    'Hotel/Pousada': {
        group: 'Comércio e Serviços',
        category: 'Turismo e Hotelaria',
        risk: 'Baixo',
        docs: [
            { id: 'esgoto', label: 'Ligação de Esgoto ou Fossa Séptica', required: true },
            { id: 'dedetizacao', label: 'Comprovante de Dedetização', required: true }
        ],
        questions: [
            { id: 'num_leitos', label: 'Número de leitos', type: 'number' },
            { id: 'piscina', label: 'Possui piscina?', type: 'select', options: ['Sim', 'Não'] }
        ]
    },
    'Clínica Médica/Odontológica': {
        group: 'Comércio e Serviços',
        category: 'Saúde',
        risk: 'Médio',
        docs: [
            { id: 'pgrss', label: 'Plano de Ger. Resíduos de Saúde (PGRSS)', required: true },
            { id: 'contrato_lixo', label: 'Contrato com empresa de coleta (Infectante)', required: true }
        ],
        questions: [
            { id: 'raiox', label: 'Possui aparelho de Raio-X?', type: 'select', options: ['Sim', 'Não'] }
        ]
    },
    'Laboratório': {
        group: 'Comércio e Serviços',
        category: 'Saúde',
        risk: 'Médio',
        docs: [
            { id: 'pgrss', label: 'PGRSS', required: true }
        ],
        questions: []
    },
    'Centro Educacional': {
        group: 'Comércio e Serviços',
        category: 'Educação',
        risk: 'Baixo',
        docs: [
            { id: 'alvara', label: 'Alvará', required: true },
            { id: 'bombeiros', label: 'AVCB (Bombeiros)', required: true }
        ],
        questions: [
            { id: 'alunos', label: 'Número de alunos', type: 'number' },
            { id: 'area_total', label: 'Área total (m²)', type: 'number' }
        ]
    },
    'Cemitério': {
        group: 'Comércio e Serviços',
        category: 'Serviços Funerários',
        risk: 'Alto',
        docs: [
            { id: 'geo', label: 'Estudo Geológico/Hidrogeológico', required: true },
            { id: 'plano_cemiterio', label: 'Plano Diretor do Cemitério', required: true }
        ],
        questions: [
            { id: 'profundidade', label: 'Profundidade do lençol freático (m)', type: 'number' }
        ]
    },

    // Grupo: Obras Civis
    'Pavimentação': {
        group: 'Obras Civis',
        category: 'Infraestrutura',
        risk: 'Médio',
        docs: [
            { id: 'projeto_viario', label: 'Projeto Geométrico/Viário', required: true },
            { id: 'drenagem', label: 'Projeto de Drenagem', required: true }
        ],
        questions: [
            { id: 'extensao', label: 'Extensão da obra (km)', type: 'number' }
        ]
    },
    'Drenagem': {
        group: 'Obras Civis',
        category: 'Infraestrutura',
        risk: 'Médio',
        docs: [
            { id: 'projeto_hidro', label: 'Projeto Hidráulico', required: true }
        ],
        questions: [
            { id: 'corpo_receptor', label: 'Corpo hídrico receptor', type: 'text' }
        ]
    },
    'Loteamento': {
        group: 'Obras Civis',
        category: 'Parcelamento do Solo',
        risk: 'Alto',
        docs: [
            { id: 'urbanistico', label: 'Projeto Urbanístico Aprovado', required: true },
            { id: 'agua_esgoto', label: 'Carta de Viabilidade (Água/Esgoto e Energia)', required: true },
            { id: 'lap', label: 'Licença Prévia (LP) anterior', required: false }
        ],
        questions: [
            { id: 'num_lotes', label: 'Número de lotes', type: 'number' },
            { id: 'area_total_lot', label: 'Área total da gleba (hectares)', type: 'number' }
        ]
    },
    'Condomínio': {
        group: 'Obras Civis',
        category: 'Parcelamento do Solo',
        risk: 'Alto',
        docs: [
            { id: 'projeto_arq', label: 'Projeto Arquitetônico', required: true },
            { id: 'esgoto_cond', label: 'Projeto da ETE do Condomínio', required: true }
        ],
        questions: [
            { id: 'unidades', label: 'Número de unidades habitacionais', type: 'number' }
        ]
    },
    'Reforma de Prédio Público': {
        group: 'Obras Civis',
        category: 'Obras Civis',
        risk: 'Baixo',
        docs: [
            { id: 'memorial_obra', label: 'Memorial Descritivo da Obra', required: true },
            { id: 'residuos_const', label: 'PGRCC (Resíduos da Construção)', required: true }
        ],
        questions: [
            { id: 'area_const', label: 'Área a ser reformada (m²)', type: 'number' }
        ]
    }
};

const INITIAL_PROCESSES = [
    {
        id: 'PROC-2026-001',
        applicant: 'Laticínios Vale do Sol',
        activity: 'Laticínio',
        status: 'Em Análise',
        createdAt: '2026-01-15',
        deadlineAgency: '2026-02-15', // Prazo do órgão
        deadlineApplicant: null, // Prazo do empreendedor (pausado)
        history: [
            { date: '2026-01-15', action: 'Protocolo Aberto', user: 'Sistema' },
            { date: '2026-01-16', action: 'Início da Análise Técnica', user: 'Henrique M.' }
        ],
        docs: { 'pgrs': true, 'effluents': true, 'water': true, 'manual': true },
        data: { 'water_source': 'Poço Tubular' }
    },
    {
        id: 'PROC-2026-002',
        applicant: 'Posto Estrela do Norte',
        activity: 'Posto de Combustível',
        status: 'Pendência',
        createdAt: '2026-01-10',
        deadlineAgency: '2026-02-10', // Congelado
        deadlineApplicant: '2026-01-30', // Correndo
        history: [
            { date: '2026-01-10', action: 'Protocolo Aberto', user: 'Sistema' },
            { date: '2026-01-12', action: 'Solicitação de Ajuste (Mapa de Risco)', user: 'Henrique M.' }
        ],
        docs: { 'sasc': true, 'anp': true }, // Missing CSAO
        data: {}
    }
];

export const WorkflowProvider = ({ children }) => {
    const [processes, setProcesses] = useState(INITIAL_PROCESSES);

    const addProcess = (processData) => {
        const newProcess = {
            id: `PROC-2026-${String(processes.length + 1).padStart(3, '0')}`,
            status: 'Aberto',
            createdAt: new Date().toISOString().split('T')[0],
            deadlineAgency: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            deadlineApplicant: null,
            history: [{ date: new Date().toISOString().split('T')[0], action: 'Protocolo Gerado', user: processData.applicant }],
            ...processData
        };
        setProcesses([newProcess, ...processes]);
    };

    const updateStatus = (id, newStatus, observation = '', additionalData = {}) => {
        setProcesses(processes.map(p => {
            if (p.id !== id) return p;

            const now = new Date().toISOString().split('T')[0];
            let updates = { status: newStatus, ...additionalData };
            let historyEntry = { date: now, action: `Mudança para ${newStatus}`, user: 'Gestor', obs: observation };

            // SLA Logic Mock
            if (newStatus === 'Pendência') {
                updates.deadlineApplicant = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +15 dias para responder
                // In real app, we would store "pausedAt" timestamp for agency deadline
            } else if (newStatus === 'Em Análise' && p.status === 'Pendência') {
                updates.deadlineApplicant = null; // Resume agency timer
            } else if (newStatus === 'Emitido') {
                updates.qrCode = `LIC-${id}-${Math.floor(Math.random() * 10000)}`;
            }

            return {
                ...p,
                ...updates,
                history: [historyEntry, ...p.history]
            };
        }));
    };

    const getTrafficLight = (process) => {
        if (process.status === 'Emitido' || process.status === 'Indeferido') return 'gray';

        // Se está em pendência, o "farol" é do requerente
        const targetDate = process.status === 'Pendência' ? process.deadlineApplicant : process.deadlineAgency;
        if (!targetDate) return 'green';

        const today = new Date();
        const deadline = new Date(targetDate);
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'red';
        if (diffDays <= 5) return 'yellow';
        return 'green';
    };

    return (
        <WorkflowContext.Provider value={{ processes, addProcess, updateStatus, getTrafficLight, ACTIVITIES }}>
            {children}
        </WorkflowContext.Provider>
    );
};
