import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow, ACTIVITIES } from '../context/WorkflowContext';
import { Upload, CheckCircle, AlertCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import ModernSelect from '../components/ui/ModernSelect';

const NewProcess = () => {
    const navigate = useNavigate();
    const { addProcess } = useWorkflow();

    const [step, setStep] = useState(1);
    const [activityKey, setActivityKey] = useState('');
    const [applicantName, setApplicantName] = useState('Empresa Modelo Ltda');
    const [answers, setAnswers] = useState({});
    const [uploads, setUploads] = useState({});

    const activityData = ACTIVITIES[activityKey];

    const handleUploadClick = (docId) => {
        setTimeout(() => {
            setUploads(prev => ({ ...prev, [docId]: true }));
        }, 500);
    };

    const calculateProgress = () => {
        if (!activityData) return 0;
        const totalDocs = activityData.docs.filter(d => d.required).length;
        if (totalDocs === 0) return 100; // If no required docs, considered complete
        const uploadedDocs = Object.keys(uploads).length;
        const progress = (uploadedDocs / totalDocs) * 100;
        return Math.min(progress, 100); // Ensure it doesn't exceed 100
    };

    const handleSubmit = () => {
        if (calculateProgress() >= 100) {
            addProcess({
                applicant: applicantName,
                activity: activityKey,
                docs: uploads,
                data: answers
            });
            navigate('/');
        }
    };

    // Prepare options for ModernSelect
    const groupedOptions = Object.entries(ACTIVITIES).reduce((acc, [key, value]) => {
        const group = value.group || 'Outros';
        if (!acc[group]) acc[group] = [];
        acc[group].push(key);
        return acc;
    }, {});

    return (
        <div className="max-w-4xl mx-auto">
            {/* Wizard Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-primary">Novo Requerimento</h2>
                    <span className="text-sm font-medium text-slate-500">Passo {step} de 3</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                        className="bg-cta h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <div className="card min-h-[400px]">
                {/* STEP 1: Triagem & Basic Info */}
                {step === 1 && (
                    <div className="space-y-6 fade-in">
                        <h3 className="text-xl font-semibold text-primary">1. Triagem Inicial</h3>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Nome do Requerente / Razão Social</label>
                            <input
                                type="text"
                                value={applicantName}
                                onChange={(e) => setApplicantName(e.target.value)}
                                className="input"
                            />
                        </div>

                        <div className="space-y-4">
                            <ModernSelect
                                label="Atividade do Empreendimento"
                                options={groupedOptions}
                                value={activityKey}
                                onChange={setActivityKey}
                                placeholder="Selecione ou busque a atividade..."
                            />
                        </div>

                        {activityKey && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Documentação Necessária
                                </h4>
                                <p className="text-sm text-blue-600 mt-1 mb-3">
                                    Para esta atividade ({activityData.category}), você precisará obrigatoriamente dos seguintes documentos:
                                </p>
                                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
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
                    <div className="space-y-6 fade-in">
                        <h3 className="text-xl font-semibold text-primary">2. Detalhes Técnicos</h3>

                        {activityData?.questions.length > 0 ? (
                            activityData.questions.map(q => (
                                <div key={q.id} className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">{q.label}</label>
                                    {q.type === 'select' && (
                                        <select
                                            className="input"
                                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                        >
                                            <option value="">Selecione...</option>
                                            {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}
                                    {(q.type === 'text' || q.type === 'number') && (
                                        <input
                                            type={q.type}
                                            className="input"
                                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                            placeholder={q.label}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 italic">Nenhuma informação técnica adicional necessária para esta etapa.</p>
                        )}
                    </div>
                )}

                {/* STEP 3: Uploads */}
                {step === 3 && (
                    <div className="space-y-6 fade-in">
                        <h3 className="text-xl font-semibold text-primary">3. Upload de Documentos</h3>

                        <div className="space-y-3">
                            {activityData?.docs.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => !uploads[doc.id] && handleUploadClick(doc.id)}
                                    className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all
                    ${uploads[doc.id] ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-cta hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {uploads[doc.id] ? <CheckCircle className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-slate-400" />}
                                        <span className={uploads[doc.id] ? 'text-green-700 font-medium' : 'text-slate-600'}>
                                            {doc.label}
                                        </span>
                                    </div>
                                    {uploads[doc.id] && <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">Enviado</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 && !activityKey}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={calculateProgress() < 100}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
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
