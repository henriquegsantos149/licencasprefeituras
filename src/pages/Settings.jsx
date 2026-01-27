import React, { useState, useEffect } from 'react';
import { Save, Bell, Moon, Shield, User, Building2, Mail, Phone, MapPin, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatCNPJ, formatPhone, formatCEP } from '../context/AuthContext';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const { darkMode, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('dados'); // 'dados' ou 'preferencias'
    
    const [formData, setFormData] = useState({
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        inscricaoEstadual: '',
        email: '',
        telefone: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        notifications: true
    });

    // Carregar dados do usuário ao montar o componente
    useEffect(() => {
        if (user) {
            setFormData({
                razaoSocial: user.razaoSocial || '',
                nomeFantasia: user.nomeFantasia || '',
                cnpj: user.cnpj ? formatCNPJ(user.cnpj) : '',
                inscricaoEstadual: user.inscricaoEstadual || '',
                email: user.email || '',
                telefone: user.telefone ? formatPhone(user.telefone) : '',
                cep: user.endereco?.cep ? formatCEP(user.endereco.cep) : '',
                logradouro: user.endereco?.logradouro || '',
                numero: user.endereco?.numero || '',
                complemento: user.endereco?.complemento || '',
                bairro: user.endereco?.bairro || '',
                cidade: user.endereco?.cidade || '',
                uf: user.endereco?.uf || '',
                notifications: true
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Aplicar formatação automática
        if (name === 'cnpj') {
            setFormData(prev => ({ ...prev, [name]: formatCNPJ(value) }));
        } else if (name === 'telefone') {
            setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
        } else if (name === 'cep') {
            setFormData(prev => ({ ...prev, [name]: formatCEP(value) }));
        } else if (name === 'uf') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 2) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        
        // Limpar mensagem de sucesso ao editar
        if (success) {
            setSuccess(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.razaoSocial.trim()) {
            newErrors.razaoSocial = 'Razão Social é obrigatória';
        }

        if (!formData.cnpj) {
            newErrors.cnpj = 'CNPJ é obrigatório';
        }

        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        } else if (formData.email !== 'teste' && !formData.email.includes('@')) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.telefone) {
            newErrors.telefone = 'Telefone é obrigatório';
        }

        if (!formData.cep) {
            newErrors.cep = 'CEP é obrigatório';
        }

        if (!formData.logradouro) {
            newErrors.logradouro = 'Logradouro é obrigatório';
        }

        if (!formData.numero) {
            newErrors.numero = 'Número é obrigatório';
        }

        if (!formData.bairro) {
            newErrors.bairro = 'Bairro é obrigatório';
        }

        if (!formData.cidade) {
            newErrors.cidade = 'Cidade é obrigatória';
        }

        if (!formData.uf || formData.uf.length !== 2) {
            newErrors.uf = 'UF deve ter 2 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess(false);

        try {
            // Preparar dados para atualização
            const updatedData = {
                razaoSocial: formData.razaoSocial.trim(),
                nomeFantasia: formData.nomeFantasia?.trim() || formData.razaoSocial.trim(),
                cnpj: formData.cnpj.replace(/[^\d]/g, ''),
                inscricaoEstadual: formData.inscricaoEstadual?.replace(/[^\d]/g, '') || null,
                email: formData.email.toLowerCase().trim(),
                telefone: formData.telefone.replace(/[^\d]/g, ''),
                endereco: {
                    cep: formData.cep.replace(/[^\d]/g, ''),
                    logradouro: formData.logradouro.trim(),
                    numero: formData.numero.trim(),
                    complemento: formData.complemento?.trim() || '',
                    bairro: formData.bairro.trim(),
                    cidade: formData.cidade.trim(),
                    uf: formData.uf.trim().toUpperCase()
                }
            };

            updateUser(updatedData);
            
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center transition-colors duration-200">
                    <p className="text-slate-600 dark:text-slate-300">Carregando dados do usuário...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 fade-in">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-slate-100">Configurações</h2>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Gerencie suas preferências e dados da conta.</p>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-200">
                <div className="border-b border-slate-200 dark:border-slate-700 flex">
                    <button
                        onClick={() => setActiveTab('dados')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                            activeTab === 'dados'
                                ? 'text-cta border-b-2 border-cta bg-blue-50/50 dark:bg-blue-900/20'
                                : 'text-slate-600 dark:text-slate-300 hover:text-cta dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Dados Cadastrais
                    </button>
                    <button
                        onClick={() => setActiveTab('preferencias')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                            activeTab === 'preferencias'
                                ? 'text-cta border-b-2 border-cta bg-blue-50/50 dark:bg-blue-900/20'
                                : 'text-slate-600 dark:text-slate-300 hover:text-cta dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Preferências
                    </button>
                </div>

                {/* Mensagens de feedback */}
                {errors.submit && (
                    <div className="mx-6 mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 dark:text-red-300 text-sm">{errors.submit}</p>
                    </div>
                )}

                {success && (
                    <div className="mx-6 mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-green-700 dark:text-green-300 text-sm">Dados atualizados com sucesso!</p>
                    </div>
                )}

                {/* Tab: Dados Cadastrais */}
                {activeTab === 'dados' && (
                    <div className="p-4 md:p-8 space-y-6">
                        {/* Dados da Empresa */}
                        <div>
                            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                                <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/30 text-cta dark:text-blue-400 rounded-lg flex-shrink-0">
                                    <Building2 className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-primary dark:text-slate-100">Dados da Empresa</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Razão Social <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="razaoSocial"
                                        value={formData.razaoSocial}
                                        onChange={handleChange}
                                        className={`input text-sm md:text-base ${errors.razaoSocial ? 'border-red-500' : ''}`}
                                    />
                                    {errors.razaoSocial && (
                                        <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Nome Fantasia
                                    </label>
                                    <input
                                        type="text"
                                        name="nomeFantasia"
                                        value={formData.nomeFantasia}
                                        onChange={handleChange}
                                        className="input text-sm md:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        CNPJ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cnpj"
                                        value={formData.cnpj}
                                        onChange={handleChange}
                                        maxLength={18}
                                        className={`input text-sm md:text-base ${errors.cnpj ? 'border-red-500' : ''}`}
                                        placeholder="00.000.000/0000-00"
                                    />
                                    {errors.cnpj && (
                                        <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Inscrição Estadual
                                    </label>
                                    <input
                                        type="text"
                                        name="inscricaoEstadual"
                                        value={formData.inscricaoEstadual}
                                        onChange={handleChange}
                                        className="input text-sm md:text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dados de Contato */}
                        <div>
                            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                                <div className="p-2 md:p-3 bg-green-50 text-green-600 rounded-lg flex-shrink-0">
                                    <Mail className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-primary dark:text-slate-100">Dados de Contato</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`input text-sm md:text-base ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Telefone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="telefone"
                                        value={formData.telefone}
                                        onChange={handleChange}
                                        maxLength={15}
                                        className={`input text-sm md:text-base ${errors.telefone ? 'border-red-500' : ''}`}
                                        placeholder="(83) 99999-9999"
                                    />
                                    {errors.telefone && (
                                        <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Endereço */}
                        <div>
                            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                                <div className="p-2 md:p-3 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0">
                                    <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-primary dark:text-slate-100">Endereço</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        CEP <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cep"
                                        value={formData.cep}
                                        onChange={handleChange}
                                        maxLength={9}
                                        className={`input text-sm md:text-base ${errors.cep ? 'border-red-500' : ''}`}
                                        placeholder="00000-000"
                                    />
                                    {errors.cep && (
                                        <p className="text-red-500 text-xs mt-1">{errors.cep}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Logradouro <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="logradouro"
                                        value={formData.logradouro}
                                        onChange={handleChange}
                                        className={`input text-sm md:text-base ${errors.logradouro ? 'border-red-500' : ''}`}
                                    />
                                    {errors.logradouro && (
                                        <p className="text-red-500 text-xs mt-1">{errors.logradouro}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Número <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="numero"
                                        value={formData.numero}
                                        onChange={handleChange}
                                        className={`input text-sm md:text-base ${errors.numero ? 'border-red-500' : ''}`}
                                    />
                                    {errors.numero && (
                                        <p className="text-red-500 text-xs mt-1">{errors.numero}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Complemento
                                    </label>
                                    <input
                                        type="text"
                                        name="complemento"
                                        value={formData.complemento}
                                        onChange={handleChange}
                                        className="input text-sm md:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Bairro <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="bairro"
                                        value={formData.bairro}
                                        onChange={handleChange}
                                        className={`input text-sm md:text-base ${errors.bairro ? 'border-red-500' : ''}`}
                                    />
                                    {errors.bairro && (
                                        <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Cidade <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cidade"
                                        value={formData.cidade}
                                        onChange={handleChange}
                                        className={`input text-sm md:text-base ${errors.cidade ? 'border-red-500' : ''}`}
                                    />
                                    {errors.cidade && (
                                        <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        UF <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="uf"
                                        value={formData.uf}
                                        onChange={handleChange}
                                        maxLength={2}
                                        className={`input text-sm md:text-base uppercase ${errors.uf ? 'border-red-500' : ''}`}
                                        placeholder="PB"
                                    />
                                    {errors.uf && (
                                        <p className="text-red-500 text-xs mt-1">{errors.uf}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Preferências */}
                {activeTab === 'preferencias' && (
                    <div className="p-4 md:p-8">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                            <div className="p-2 md:p-3 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0">
                                <Shield className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-primary dark:text-slate-100">Preferências e Segurança</h3>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center justify-between p-3 md:p-4 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-cta/30 dark:hover:border-blue-500/30 transition-colors gap-3">
                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                    <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm md:text-base text-slate-700 dark:text-slate-200">Notificações por E-mail</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Receber atualizações sobre o andamento dos processos.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={formData.notifications}
                                        onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cta"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 md:p-4 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-cta/30 dark:hover:border-blue-500/30 transition-colors gap-3">
                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                    <Moon className="w-4 h-4 md:w-5 md:h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm md:text-base text-slate-700 dark:text-slate-200">Modo Escuro</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Ativar interface escura para ambientes noturnos.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={darkMode}
                                        onChange={(e) => setTheme(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cta"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer com botão de salvar */}
                <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end transition-colors duration-200">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 text-sm md:text-base px-4 md:px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-3 h-3 md:w-4 md:h-4" />
                                <span>Salvar Alterações</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
