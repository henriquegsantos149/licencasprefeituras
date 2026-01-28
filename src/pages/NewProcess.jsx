import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow, ACTIVITIES } from '../context/WorkflowContext';
import { useAuth } from '../context/AuthContext';
import { Upload, CheckCircle, AlertCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import ModernSelect from '../components/ui/ModernSelect';

const NewProcess = () => {
    const navigate = useNavigate();
    const { addProcess } = useWorkflow();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [applicantName, setApplicantName] = useState('');
    const [answers, setAnswers] = useState({});
    const [uploads, setUploads] = useState({});

    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [activitiesError, setActivitiesError] = useState(null);

    // Preencher nome do requerente com dados do usuário logado
    useEffect(() => {
        if (user) {
            setApplicantName(user.razaoSocial);
        }
    }, [user]);

    useEffect(() => {
        let cancelled = false;

        const loadActivities = async () => {
            setLoadingActivities(true);
            setActivitiesError(null);

            try {
                const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
                const apiBase = rawBase.includes('/api/v1') ? rawBase : `${rawBase}/api/v1`;
                const token = localStorage.getItem('token');

                const response = await fetch(`${apiBase}/activities/`, {
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Falha ao carregar atividades (${response.status})`);
                }

                const data = await response.json();
                if (!cancelled) {
                    setActivities(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!cancelled) {
                    setActivities([]);
                    setActivitiesError(error?.message || 'Erro ao carregar atividades');
                }
            } finally {
                if (!cancelled) {
                    setLoadingActivities(false);
                }
            }
        };

        loadActivities();

        return () => {
            cancelled = true;
        };
    }, []);

    const normalizedActivities = (Array.isArray(activities) && activities.length > 0)
        ? activities
            .map((a) => ({
                id: a.id,
                name: a.name,
                group: a.group || '',
                category: a.category || '',
                sortOrder: typeof a.sort_order === 'number' ? a.sort_order : null,
                risk: a.risk_level || '',
                docs: Array.isArray(a.required_documents) ? a.required_documents : [],
                questions: Array.isArray(a.questions) ? a.questions : []
            }))
        : Object.entries(ACTIVITIES)
            .map(([name, meta], idx) => ({
                id: name,
                name,
                group: meta.group || '',
                category: meta.category || '',
                sortOrder: idx,
                risk: meta.risk || '',
                docs: Array.isArray(meta.docs) ? meta.docs : [],
                questions: Array.isArray(meta.questions) ? meta.questions : []
            }));

    const groupedActivities = normalizedActivities.reduce((acc, a) => {
        const groupLabel = (a.group || a.category || 'Outros').trim() || 'Outros';
        if (!acc[groupLabel]) acc[groupLabel] = [];
        acc[groupLabel].push(a);
        return acc;
    }, {});

    const GROUP_ORDER = ['Agropecuária', 'Indústrias', 'Comércio e Serviços', 'Obras Civis', 'Outros'];
    const groupRank = (label) => {
        const idx = GROUP_ORDER.indexOf(label);
        return idx === -1 ? GROUP_ORDER.length : idx;
    };

    const groupedEntries = Object.entries(groupedActivities)
        .sort(([ga], [gb]) => {
            const ra = groupRank(ga);
            const rb = groupRank(gb);
            if (ra !== rb) return ra - rb;
            return ga.localeCompare(gb, 'pt-BR');
        })
        .map(([groupLabel, items]) => {
            const sortedItems = [...items].sort((a, b) => {
                const ao = a.sortOrder;
                const bo = b.sortOrder;
                if (typeof ao === 'number' && typeof bo === 'number') return ao - bo;
                if (typeof ao === 'number') return -1;
                if (typeof bo === 'number') return 1;
                return (a.name || '').localeCompare(b.name || '', 'pt-BR');
            });
            return [groupLabel, sortedItems];
        });

    const activityData = normalizedActivities.find(a => a.id === selectedActivityId) || null;

    const handleUploadClick = (docId) => {
        setTimeout(() => {
            setUploads(prev => ({ ...prev, [docId]: true }));
        }, 500);
    };

    const calculateProgress = () => {
        if (!activityData) return 0;
        const docs = Array.isArray(activityData.docs) ? activityData.docs : [];
        const requiredDocs = docs.filter(d => d?.required !== false);
        const uploadedDocs = requiredDocs.filter(d => uploads[d.id]).length;
        const totalDocs = requiredDocs.length;
        if (totalDocs === 0) return 100;
        return (uploadedDocs / totalDocs) * 100;
    };

    const handleSubmit = () => {
        if (calculateProgress() === 100) {
            addProcess({
                applicant: applicantName,
                activity: activityData?.name || selectedActivityId,
                docs: uploads,
                data: answers
            });
            navigate('/dashboard');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Wizard Header */}
            <div className="mb-4 md:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-slate-100">Novo Requerimento</h2>
                    <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">Passo {step} de 3</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div
                        className="bg-cta h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <div className="card min-h-[300px] md:min-h-[400px]">
                {/* STEP 1: Triagem & Basic Info */}
                {step === 1 && (
                    <div className="space-y-4 md:space-y-6 fade-in">
                        <h3 className="text-lg md:text-xl font-semibold text-primary dark:text-slate-100">1. Triagem Inicial</h3>

                        <div className="space-y-2 md:space-y-4">
                            <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">Nome do Requerente / Razão Social</label>
                            <input
                                type="text"
                                value={applicantName}
                                onChange={(e) => setApplicantName(e.target.value)}
                                className="input text-sm md:text-base"
                            />
                        </div>

                        <div className="space-y-2 md:space-y-4">
                            <ModernSelect
                                label="Atividade do Empreendimento"
                                placeholder={loadingActivities ? 'Carregando atividades...' : 'Selecione ou busque a atividade...'}
                                value={selectedActivityId}
                                onChange={setSelectedActivityId}
                                disabled={loadingActivities}
                                groups={groupedEntries.map(([groupLabel, items]) => ({
                                    label: groupLabel,
                                    options: items.map((a) => ({ value: a.id, label: a.name })),
                                }))}
                            />
                            {activitiesError && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    {activitiesError}. Usando lista local.
                                </p>
                            )}
                        </div>

                        {selectedActivityId && activityData && (
                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-3 md:p-4 mt-4">
                                <h4 className="font-semibold text-sm md:text-base text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                    Documentação Necessária
                                </h4>
                                <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 mt-1 mb-2 md:mb-3">
                                    Para esta atividade ({activityData.category || 'categoria não informada'}), você precisará obrigatoriamente dos seguintes documentos:
                                </p>
                                <ul className="list-disc list-inside text-xs md:text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    {activityData.docs.map(doc => (
                                        <li key={doc.id}>{doc.label}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: Specific Questions */}
                {step === 2 && (
                    <div className="space-y-4 md:space-y-6 fade-in">
                        <h3 className="text-lg md:text-xl font-semibold text-primary dark:text-slate-100">2. Detalhes Técnicos</h3>

                        {activityData?.questions?.length > 0 ? (
                            activityData.questions.map(q => (
                                <div key={q.id} className="space-y-2">
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">{q.label}</label>
                                    {q.type === 'select' && (
                                        <select
                                            className="input text-sm md:text-base"
                                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                        >
                                            <option value="">Selecione...</option>
                                            {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 italic">Nenhuma informação técnica adicional necessária para esta etapa.</p>
                        )}
                    </div>
                )}

                {/* STEP 3: Uploads */}
                {step === 3 && (
                    <div className="space-y-4 md:space-y-6 fade-in">
                        <h3 className="text-lg md:text-xl font-semibold text-primary dark:text-slate-100">3. Upload de Documentos</h3>

                        <div className="space-y-2 md:space-y-3">
                            {activityData?.docs.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => !uploads[doc.id] && handleUploadClick(doc.id)}
                                    className={`border-2 border-dashed rounded-lg p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 cursor-pointer transition-all
                    ${uploads[doc.id] ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-cta dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                        {uploads[doc.id] ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0" /> : <FileText className="w-4 h-4 md:w-5 md:h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />}
                                        <span className={`text-xs md:text-sm ${uploads[doc.id] ? 'text-green-700 dark:text-green-300 font-medium' : 'text-slate-600 dark:text-slate-300'} truncate`}>
                                            {doc.label}
                                        </span>
                                    </div>
                                    {uploads[doc.id] && <span className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800 px-2 py-1 rounded whitespace-nowrap">Enviado</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 && !selectedActivityId}
                            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base px-4 md:px-6"
                        >
                            Próximo <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={calculateProgress() < 100}
                            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-sm md:text-base px-4 md:px-6"
                        >
                            <CheckCircle className="w-4 h-4" /> Protocolar Pedido
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewProcess;
