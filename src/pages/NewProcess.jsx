import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow, ACTIVITIES } from '../context/WorkflowContext';
import { Upload, CheckCircle, AlertCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

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
        const uploadedDocs = Object.keys(uploads).length;
        return (uploadedDocs / totalDocs) * 100;
    };

    const handleSubmit = () => {
        if (calculateProgress() === 100) {
            addProcess({
                applicant: applicantName,
                activity: activityKey,
                docs: uploads,
                data: answers
            });
            navigate('/');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Wizard Header */}
            <div className="mb-4 md:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-primary">Novo Requerimento</h2>
                    <span className="text-xs md:text-sm font-medium text-slate-500">Passo {step} de 3</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
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
                        <h3 className="text-lg md:text-xl font-semibold text-primary">1. Triagem Inicial</h3>

                        <div className="space-y-2 md:space-y-4">
                            <label className="block text-xs md:text-sm font-medium text-slate-700">Nome do Requerente / Razão Social</label>
                            <input
                                type="text"
                                value={applicantName}
                                onChange={(e) => setApplicantName(e.target.value)}
                                className="input text-sm md:text-base"
                            />
                        </div>

                        <div className="space-y-2 md:space-y-4">
                            <label className="block text-xs md:text-sm font-medium text-slate-700">Atividade do Empreendimento</label>
                            <select
                                value={activityKey}
                                onChange={(e) => setActivityKey(e.target.value)}
                                className="input text-sm md:text-base"
                            >
                                <option value="">Selecione uma atividade...</option>
                                {Object.keys(ACTIVITIES).map(key => (
                                    <option key={key} value={key}>{key}</option>
                                ))}
                            </select>
                        </div>

                        {activityKey && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4 mt-4">
                                <h4 className="font-semibold text-sm md:text-base text-blue-800 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                    Documentação Necessária
                                </h4>
                                <p className="text-xs md:text-sm text-blue-600 mt-1 mb-2 md:mb-3">
                                    Para esta atividade ({activityData.category}), você precisará obrigatoriamente dos seguintes documentos:
                                </p>
                                <ul className="list-disc list-inside text-xs md:text-sm text-blue-700 space-y-1">
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
                        <h3 className="text-lg md:text-xl font-semibold text-primary">2. Detalhes Técnicos</h3>

                        {activityData?.questions.length > 0 ? (
                            activityData.questions.map(q => (
                                <div key={q.id} className="space-y-2">
                                    <label className="block text-xs md:text-sm font-medium text-slate-700">{q.label}</label>
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
                            <p className="text-xs md:text-sm text-slate-500 italic">Nenhuma informação técnica adicional necessária para esta etapa.</p>
                        )}
                    </div>
                )}

                {/* STEP 3: Uploads */}
                {step === 3 && (
                    <div className="space-y-4 md:space-y-6 fade-in">
                        <h3 className="text-lg md:text-xl font-semibold text-primary">3. Upload de Documentos</h3>

                        <div className="space-y-2 md:space-y-3">
                            {activityData?.docs.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => !uploads[doc.id] && handleUploadClick(doc.id)}
                                    className={`border-2 border-dashed rounded-lg p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 cursor-pointer transition-all
                    ${uploads[doc.id] ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-cta hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                        {uploads[doc.id] ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" /> : <FileText className="w-4 h-4 md:w-5 md:h-5 text-slate-400 flex-shrink-0" />}
                                        <span className={`text-xs md:text-sm ${uploads[doc.id] ? 'text-green-700 font-medium' : 'text-slate-600'} truncate`}>
                                            {doc.label}
                                        </span>
                                    </div>
                                    {uploads[doc.id] && <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded whitespace-nowrap">Enviado</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-medium text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 && !activityKey}
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
