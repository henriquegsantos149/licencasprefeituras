import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import Badge from '../components/ui/Badge';
import TrafficLight from '../components/ui/TrafficLight';
import { MoreHorizontal, Filter, AlertTriangle, CheckCircle, Calendar, Eye } from 'lucide-react';

const Admin = () => {
    const navigate = useNavigate();
    const { processes, updateStatus, getTrafficLight } = useWorkflow();

    return (
        <div className="space-y-4 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-primary">Gestão Municipal</h2>
                    <p className="text-sm md:text-base text-slate-500">Visão geral dos processos em tramitação.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-50">
                        <Filter className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Filtros</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: 'Atenção (Vencidos)', count: processes.filter(p => getTrafficLight(p) === 'red').length, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Prazo Curto', count: processes.filter(p => getTrafficLight(p) === 'yellow').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Em Dia', count: processes.filter(p => getTrafficLight(p) === 'green').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total', count: processes.length, color: 'text-slate-600', bg: 'bg-slate-50' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase truncate">{kpi.label}</p>
                        <p className={`text-xl md:text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.count}</p>
                    </div>
                ))}
            </div>

            {/* Main Table - Desktop */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-slate-600">Sinal</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-slate-600">Protocolo / Interessado</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-slate-600">Atividade</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-slate-600">Status Atual</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-slate-600">Prazo Legal</th>
                                <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-slate-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {processes.map((process) => {
                                const trafficColor = getTrafficLight(process);
                                // determine which deadline to show
                                const deadlineDate = process.status === 'Pendência' ? process.deadlineApplicant : process.deadlineAgency;
                                const deadlineLabel = process.status === 'Pendência' ? '(Req)' : '(Org)';

                                return (
                                    <tr key={process.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                                            <div className="flex justify-center">
                                                <TrafficLight status={trafficColor} />
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-primary text-xs lg:text-sm">{process.id}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[200px]">{process.applicant}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-600 text-xs lg:text-sm truncate max-w-[150px]">{process.activity}</td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                                            <Badge status={process.status} />
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                                            <div className="flex items-center gap-2 text-slate-600 text-xs lg:text-sm">
                                                <Calendar className="w-3 h-3 lg:w-4 lg:h-4 text-slate-400 flex-shrink-0" />
                                                <span>{deadlineDate ? new Date(deadlineDate).toLocaleDateString('pt-BR') : '-'}</span>
                                                <span className="text-xs text-slate-400">{deadlineLabel}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                                            <button
                                                onClick={() => navigate(`/process/${process.id}`)}
                                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-cta"
                                                title="Ver Detalhes"
                                            >
                                                <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {processes.map((process) => {
                    const trafficColor = getTrafficLight(process);
                    const deadlineDate = process.status === 'Pendência' ? process.deadlineApplicant : process.deadlineAgency;
                    const deadlineLabel = process.status === 'Pendência' ? '(Req)' : '(Org)';

                    return (
                        <div
                            key={process.id}
                            onClick={() => navigate(`/process/${process.id}`)}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <TrafficLight status={trafficColor} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-primary text-sm truncate">{process.id}</p>
                                        <p className="text-xs text-slate-500 truncate">{process.applicant}</p>
                                    </div>
                                </div>
                                <Badge status={process.status} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-slate-600 font-medium">{process.activity}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>{deadlineDate ? new Date(deadlineDate).toLocaleDateString('pt-BR') : '-'}</span>
                                    <span>{deadlineLabel}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Admin;
