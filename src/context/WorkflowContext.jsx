import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkflowContext = createContext();

export const useWorkflow = () => useContext(WorkflowContext);

export const ACTIVITIES = {
    'Laticínio': {
        category: 'Indústria de Transformação',
        risk: 'Médio/Alto',
        docs: [
            { id: 'pgrs', label: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS)', required: true },
            { id: 'effluents', label: 'Projeto de Efluentes Líquidos', required: true },
            { id: 'water', label: 'Outorga de Uso da Água (AESA)', required: true },
            { id: 'manual', label: 'Manual de Boas Práticas', required: true }
        ],
        questions: [
            { id: 'water_source', label: 'Fonte de abastecimento de água', type: 'select', options: ['Poço Tubular', 'Açude', 'Rio/Corpo Hídrico', 'CAGEPA'] }
        ]
    },
    'Posto de Combustível': {
        category: 'Comércio Varejista de Combustíveis',
        risk: 'Alto',
        docs: [
            { id: 'sasc', label: 'Teste de Estanqueidade (SASC)', required: true },
            { id: 'csao', label: 'Caixa Separadora (CSAO) - Projeto/Laudo', required: true },
            { id: 'anp', label: 'Licença da ANP', required: true },
            { id: 'emergency', label: 'Plano de Emergência e Contingência', required: true }
        ],
        questions: []
    },
    'Pequeno Porte (Padaria/Lava-Jato)': {
        category: 'Serviços / Comércio',
        risk: 'Baixo',
        docs: [
            { id: 'alvara', label: 'Alvará da Prefeitura', required: true },
            { id: 'waste_dest', label: 'Comprovante Destinação de Resíduos', required: true },
            { id: 'sewage', label: 'Ligação Esgoto ou Fossa Séptica', required: true }
        ],
        questions: []
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
