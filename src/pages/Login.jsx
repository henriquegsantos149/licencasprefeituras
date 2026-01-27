import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader, Building2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    
    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        } else if (formData.email !== 'teste' && !formData.email.includes('@')) {
            // Permite "teste" como email válido para o usuário de teste
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
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
            await login(formData.email, formData.password);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900 p-4 transition-colors duration-200">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 overflow-hidden transition-colors duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cta to-blue-600 p-6 md:p-8 text-white text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Building2 className="w-8 h-8" />
                            <h1 className="text-2xl md:text-3xl font-bold">Bem-vindo de volta</h1>
                        </div>
                        <p className="text-blue-100">Acesse sua conta para continuar</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {errors.submit && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 dark:text-red-300 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                <Mail className="w-4 h-4 inline mr-1" />
                                Email
                            </label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                                placeholder="teste ou seu@email.com.br"
                                autoComplete="username"
                            />
                            {errors.email && (
                                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                <Lock className="w-4 h-4 inline mr-1" />
                                Senha
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`input ${errors.password ? 'border-red-500 dark:border-red-500' : ''}`}
                                placeholder="Digite sua senha"
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-cta border-slate-300 dark:border-slate-600 rounded focus:ring-cta dark:bg-slate-700"
                                />
                                <span className="text-slate-600 dark:text-slate-300">Lembrar-me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-cta hover:text-blue-700 dark:hover:text-blue-400 font-medium"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                Ainda não tem uma conta?
                            </p>
                            <Link
                                to="/register"
                                className="btn-secondary w-full block text-center"
                            >
                                Criar conta de empreendedor
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
