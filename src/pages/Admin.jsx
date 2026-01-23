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
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Gestão Municipal</h2>
                    <p className="text-slate-500">Visão geral dos processos em tramitação.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Atenção (Vencidos)', count: processes.filter(p => getTrafficLight(p) === 'red').length, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Prazo Curto', count: processes.filter(p => getTrafficLight(p) === 'yellow').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Em Dia', count: processes.filter(p => getTrafficLight(p) === 'green').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total', count: processes.length, color: 'text-slate-600', bg: 'bg-slate-50' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium uppercase">{kpi.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.count}</p>
                    </div>
                ))}
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Sinal</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Protocolo / Interessado</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Atividade</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Status Atual</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Prazo Legal</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Ações</th>
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
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <TrafficLight status={trafficColor} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-primary">{process.id}</span>
                                                <span className="text-xs text-slate-500">{process.applicant}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{process.activity}</td>
                                        <td className="px-6 py-4">
                                            <Badge status={process.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {deadlineDate ? new Date(deadlineDate).toLocaleDateString('pt-BR') : '-'}
                                                <span className="text-xs text-slate-400">{deadlineLabel}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/process/${process.id}`)}
                                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-cta"
                                                title="Ver Detalhes"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
