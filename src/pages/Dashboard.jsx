import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import Badge from '../components/ui/Badge';
import { ChevronRight, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { processes } = useWorkflow();
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-primary">Meus Processos</h2>
                <p className="text-slate-500">Acompanhe o status do seu licenciamento ambiental.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Processos Ativos</p>
                            <h3 className="text-2xl font-bold text-primary">{processes.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Pendências</p>
                            <h3 className="text-2xl font-bold text-primary">
                                {processes.filter(p => p.status === 'Pendência').length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-primary">Lista de Processos</h3>
                    <button
                        onClick={() => navigate('/new')}
                        className="text-sm font-semibold text-cta hover:text-cta/80 transition-colors"
                    >
                        + Novo Processo
                    </button>
                </div>

                <div className="divide-y divide-slate-100">
                    {processes.map((process) => (
                        <div
                            key={process.id}
                            onClick={() => navigate(`/process/${process.id}`)}
                            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                    {process.activity.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary">{process.activity}</h4>
                                    <p className="text-sm text-slate-500">Protocolo: {process.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden md:block">
                                    <p className="text-xs text-slate-400">Data de Entrada</p>
                                    <p className="text-sm font-medium text-slate-600">
                                        {new Date(process.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                <Badge status={process.status} />

                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-cta transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
