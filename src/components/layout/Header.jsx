import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, LogOut, Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 ml-0 md:ml-64 transition-colors duration-200">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                >
                    <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                <h1 className="text-lg md:text-xl font-bold text-primary dark:text-slate-100 truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                <div className="relative hidden md:block">
                    <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar processos..."
                        className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 dark:text-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 w-64 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>

                <button className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors">
                    <Search className="w-5 h-5" />
                </button>

                <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors flex-shrink-0">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                </button>

                {/* User Menu */}
                {user && (
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <div className="w-8 h-8 bg-cta text-white rounded-full flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-semibold text-primary dark:text-slate-100 truncate max-w-[120px]">
                                    {user.nomeFantasia || user.razaoSocial}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                                    {user.email}
                                </p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 hidden md:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                    <p className="text-sm font-semibold text-primary dark:text-slate-100 truncate">
                                        {user.razaoSocial}
                                    </p>
                                    {user.nomeFantasia && user.nomeFantasia !== user.razaoSocial && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                                            {user.nomeFantasia}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        CNPJ: {user.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        navigate('/settings');
                                        setUserMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Configurações
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
