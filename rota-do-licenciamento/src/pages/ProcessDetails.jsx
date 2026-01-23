import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import Badge from '../components/ui/Badge';
import TrafficLight from '../components/ui/TrafficLight';
import { Clock, FileText, CheckCircle, AlertTriangle, Calendar, Download, Building, User } from 'lucide-react';

const ProcessDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { processes, updateStatus, getTrafficLight } = useWorkflow();
    const process = processes.find(p => p.id === id);

    const [activeTab, setActiveTab] = useState('status');

    if (!process) return <div className="text-center p-10">Processo não encontrado.</div>;

    const trafficColor = getTrafficLight(process);

    const handleAction = (action) => {
        if (action === 'Analyze') updateStatus(process.id, 'Em Análise');
        if (action === 'Pending') updateStatus(process.id, 'Pendência');
        if (action === 'Schedule') updateStatus(process.id, 'Vistoria Agendada');
        if (action === 'Approve') updateStatus(process.id, 'Emitido');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-500">
                        {process.activity.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-primary">{process.applicant}</h1>
                            <Badge status={process.status} />
                        </div>
                        <p className="text-slate-500 flex items-center gap-2">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{process.id}</span>
                            • {process.activity}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    {process.qrCode && (
                        <div className="bg-white p-2 border border-slate-200 rounded-lg shadow-sm text-center">
                            <div className="w-16 h-16 bg-slate-900 mx-auto mb-1"></div>
                            <span className="text-[10px] text-slate-400 font-mono">Original</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <TrafficLight status={trafficColor} />
                        {process.status === 'Pendência' ? (
                            <span className="text-orange-600">Aguardando Requerente (Prazo Pausado)</span>
                        ) : (
                            <span>Prazo Legal: {new Date(process.deadlineAgency).toLocaleDateString('pt-BR')}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {['status', 'docs', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 
              ${activeTab === tab
                                ? 'border-cta text-cta'
                                : 'border-transparent text-slate-500 hover:text-primary hover:bg-slate-50'}`}
                    >
                        {tab === 'status' && 'Visão Geral'}
                        {tab === 'docs' && 'Documentação'}
                        {tab === 'history' && 'Histórico'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Info */}
                <div className="lg:col-span-2 space-y-6">

                    {activeTab === 'status' && (
                        <div className="space-y-6 fade-in">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-slate-400" /> SLA & Prazos
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-lg border ${process.deadlineApplicant ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                        <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Prazo do Requerente</p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {process.deadlineApplicant ? new Date(process.deadlineApplicant).toLocaleDateString('pt-BR') : 'Sem pendência'}
                                        </p>
                                    </div>
                                    <div className={`p-4 rounded-lg border ${!process.deadlineApplicant ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                        <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Prazo do Órgão</p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {new Date(process.deadlineAgency).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {process.data && Object.keys(process.data).length > 0 && (
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-slate-400" /> Dados Técnicos
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(process.data).map(([key, value]) => (
                                            <div key={key}>
                                                <p className="text-xs text-slate-500 uppercase">{key.replace('_', ' ')}</p>
                                                <p className="font-medium text-slate-800">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'docs' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden fade-in">
                            <div className="divide-y divide-slate-100">
                                {Object.entries(process.docs).map(([docId, status]) => (
                                    <div key={docId} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-50 text-red-600 rounded">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-700 capitalize">{docId}</p>
                                                <p className="text-xs text-slate-400">PDF • 2.4 MB</p>
                                            </div>
                                        </div>
                                        <button className="text-cta hover:underline text-sm font-medium flex items-center gap-1">
                                            <Download className="w-4 h-4" /> Baixar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm fade-in">
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
                                {process.history.map((event, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[39px] w-4 h-4 rounded-full bg-cta border-4 border-white shadow-sm"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-primary">{event.action}</p>
                                                <p className="text-sm text-slate-600 mt-1">{event.obs || 'Sem observações adicionais.'}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium flex items-center gap-1">
                                                        <User className="w-3 h-3" /> {event.user}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400">{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide mb-4">Ações do Gestor</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleAction('Analyze')}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 border border-slate-200"
                            >
                                <Clock className="w-4 h-4 text-slate-400" /> Iniciar Análise
                            </button>
                            <button
                                onClick={() => handleAction('Pending')}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 text-sm font-medium text-orange-700 flex items-center gap-2 border border-orange-200 bg-orange-50/50"
                            >
                                <AlertTriangle className="w-4 h-4" /> Solicitar Ajuste (Pausa Prazo)
                            </button>
                            <button
                                onClick={() => handleAction('Schedule')}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-indigo-50 text-sm font-medium text-indigo-700 flex items-center gap-2 border border-indigo-200 bg-indigo-50/50"
                            >
                                <Calendar className="w-4 h-4" /> Agendar Vistoria
                            </button>
                            <div className="h-px bg-slate-100 my-2"></div>
                            <button
                                onClick={() => handleAction('Approve')}
                                className="w-full justify-center px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold text-sm flex items-center gap-2 transition-all"
                            >
                                <CheckCircle className="w-4 h-4" /> Emitir Licença
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessDetails;
