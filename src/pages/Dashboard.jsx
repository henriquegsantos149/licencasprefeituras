import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import Badge from '../components/ui/Badge';
import { ChevronRight, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { processes } = useWorkflow();
    const navigate = useNavigate();

    return (
        <div className="space-y-4 md:space-y-8">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-primary">Meus Processos</h2>
                <p className="text-sm md:text-base text-slate-500">Acompanhe o status do seu licenciamento ambiental.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm text-slate-500 font-medium">Processos Ativos</p>
                            <h3 className="text-xl md:text-2xl font-bold text-primary">{processes.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-orange-50 text-orange-600 rounded-lg flex-shrink-0">
                            <Clock className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm text-slate-500 font-medium">Pendências</p>
                            <h3 className="text-xl md:text-2xl font-bold text-primary">
                                {processes.filter(p => p.status === 'Pendência').length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <h3 className="font-bold text-base md:text-lg text-primary">Lista de Processos</h3>
                    <button
                        onClick={() => navigate('/new')}
                        className="text-xs md:text-sm font-semibold text-cta hover:text-cta/80 transition-colors whitespace-nowrap"
                    >
                        + Novo Processo
                    </button>
                </div>

                <div className="divide-y divide-slate-100">
                    {processes.map((process) => (
                        <div
                            key={process.id}
                            onClick={() => navigate(`/process/${process.id}`)}
                            className="p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
                                    {process.activity.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-sm md:text-base text-primary truncate">{process.activity}</h4>
                                    <p className="text-xs md:text-sm text-slate-500 truncate">Protocolo: {process.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 md:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-400">Data de Entrada</p>
                                    <p className="text-sm font-medium text-slate-600">
                                        {new Date(process.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="text-right sm:hidden text-xs text-slate-500">
                                    {new Date(process.createdAt).toLocaleDateString('pt-BR')}
                                </div>

                                <Badge status={process.status} />

                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-cta transition-colors flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
