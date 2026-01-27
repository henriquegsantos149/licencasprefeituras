import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, formatCNPJ, formatPhone, formatCEP } from '../context/AuthContext';
import { Building2, Mail, Lock, Phone, MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, loading: authLoading } = useAuth();
    
    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);
    
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
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Aplicar formatação automática
        if (name === 'cnpj') {
            setFormData(prev => ({ ...prev, [name]: formatCNPJ(value) }));
        } else if (name === 'telefone') {
            setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
        } else if (name === 'cep') {
            setFormData(prev => ({ ...prev, [name]: formatCEP(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
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
        } else if (!formData.email.includes('@')) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.telefone) {
            newErrors.telefone = 'Telefone é obrigatório';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
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

        if (!formData.uf) {
            newErrors.uf = 'UF é obrigatória';
        } else if (formData.uf.length !== 2) {
            newErrors.uf = 'UF deve ter 2 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 2000);
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-2">Cadastro realizado com sucesso!</h2>
                    <p className="text-slate-600 mb-4">Redirecionando para o dashboard...</p>
                    <Loader className="w-6 h-6 text-cta animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
            <div className="max-w-4xl w-full">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cta to-blue-600 p-6 md:p-8 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-8 h-8" />
                            <h1 className="text-2xl md:text-3xl font-bold">Cadastro de Empreendedor</h1>
                        </div>
                        <p className="text-blue-100">Preencha os dados da sua empresa para começar</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Dados da Empresa */}
                        <div>
                            <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-slate-200">
                                Dados da Empresa
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Razão Social <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="razaoSocial"
                                        value={formData.razaoSocial}
                                        onChange={handleChange}
                                        className={`input ${errors.razaoSocial ? 'border-red-500' : ''}`}
                                        placeholder="Ex: Empresa Exemplo Ltda"
                                    />
                                    {errors.razaoSocial && (
                                        <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nome Fantasia
                                    </label>
                                    <input
                                        type="text"
                                        name="nomeFantasia"
                                        value={formData.nomeFantasia}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Ex: Empresa Exemplo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        CNPJ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cnpj"
                                        value={formData.cnpj}
                                        onChange={handleChange}
                                        maxLength={18}
                                        className={`input ${errors.cnpj ? 'border-red-500' : ''}`}
                                        placeholder="00.000.000/0000-00"
                                    />
                                    {errors.cnpj && (
                                        <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Inscrição Estadual
                                    </label>
                                    <input
                                        type="text"
                                        name="inscricaoEstadual"
                                        value={formData.inscricaoEstadual}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dados de Contato */}
                        <div>
                            <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-slate-200">
                                Dados de Contato
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`input ${errors.email ? 'border-red-500' : ''}`}
                                        placeholder="contato@empresa.com.br"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Telefone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="telefone"
                                        value={formData.telefone}
                                        onChange={handleChange}
                                        maxLength={15}
                                        className={`input ${errors.telefone ? 'border-red-500' : ''}`}
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
                            <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-slate-200">
                                <MapPin className="w-5 h-5 inline mr-2" />
                                Endereço
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        CEP <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cep"
                                        value={formData.cep}
                                        onChange={handleChange}
                                        maxLength={9}
                                        className={`input ${errors.cep ? 'border-red-500' : ''}`}
                                        placeholder="00000-000"
                                    />
                                    {errors.cep && (
                                        <p className="text-red-500 text-xs mt-1">{errors.cep}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Logradouro <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="logradouro"
                                        value={formData.logradouro}
                                        onChange={handleChange}
                                        className={`input ${errors.logradouro ? 'border-red-500' : ''}`}
                                        placeholder="Rua, Avenida, etc."
                                    />
                                    {errors.logradouro && (
                                        <p className="text-red-500 text-xs mt-1">{errors.logradouro}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Número <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="numero"
                                        value={formData.numero}
                                        onChange={handleChange}
                                        className={`input ${errors.numero ? 'border-red-500' : ''}`}
                                        placeholder="123"
                                    />
                                    {errors.numero && (
                                        <p className="text-red-500 text-xs mt-1">{errors.numero}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Complemento
                                    </label>
                                    <input
                                        type="text"
                                        name="complemento"
                                        value={formData.complemento}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Apto, Sala, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Bairro <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="bairro"
                                        value={formData.bairro}
                                        onChange={handleChange}
                                        className={`input ${errors.bairro ? 'border-red-500' : ''}`}
                                        placeholder="Centro"
                                    />
                                    {errors.bairro && (
                                        <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Cidade <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cidade"
                                        value={formData.cidade}
                                        onChange={handleChange}
                                        className={`input ${errors.cidade ? 'border-red-500' : ''}`}
                                        placeholder="João Pessoa"
                                    />
                                    {errors.cidade && (
                                        <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        UF <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="uf"
                                        value={formData.uf}
                                        onChange={handleChange}
                                        maxLength={2}
                                        className={`input uppercase ${errors.uf ? 'border-red-500' : ''}`}
                                        placeholder="PB"
                                    />
                                    {errors.uf && (
                                        <p className="text-red-500 text-xs mt-1">{errors.uf}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-slate-200">
                                <Lock className="w-5 h-5 inline mr-2" />
                                Senha de Acesso
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Senha <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`input ${errors.password ? 'border-red-500' : ''}`}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Confirmar Senha <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                        placeholder="Digite a senha novamente"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Cadastrando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Criar Conta
                                    </>
                                )}
                            </button>
                            <Link
                                to="/"
                                className="btn-secondary flex-1 text-center"
                            >
                                Já tenho uma conta
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
