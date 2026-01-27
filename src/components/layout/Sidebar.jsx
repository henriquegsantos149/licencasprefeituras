import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Users, Settings, LogOut, X, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Helper function to check if user can access admin
    const canAccessAdmin = () => {
        if (!user) return false;
        return user.role === 'licenciador' || user.role === 'admin';
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: FilePlus, label: 'Novo Processo', path: '/new' },
        // Only show Gestão Municipal for licenciadores and admins
        ...(canAccessAdmin() ? [{ icon: Users, label: 'Gestão Municipal', path: '/admin' }] : []),
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    const handleNavClick = () => {
        // Fechar sidebar em mobile ao navegar
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
        onClose();
    };

    return (
        <>
            <aside className={`
                w-64 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-slate-100 dark:border-slate-700 shadow-sm
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-700">
                    <div className="flex items-center justify-center flex-1">
                        <img src="/logo.png" alt="EnviroAsset" className="h-8 object-contain" />
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-cta dark:text-blue-400 font-semibold shadow-sm shadow-blue-100 dark:shadow-blue-900/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-cta dark:hover:text-blue-400'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="whitespace-nowrap">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {user && (
                    <div className="p-4 border-t border-slate-50 dark:border-slate-700">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 mb-2">
                            <div className="w-8 h-8 rounded-full bg-cta text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                                    {user.nomeFantasia || user.razaoSocial}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-400 truncate">{user.email}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors py-2"
                        >
                            <LogOut className="w-3 h-3" /> Sair do Sistema
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
