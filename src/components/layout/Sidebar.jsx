import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FilePlus, label: 'Novo Processo', path: '/new' },
        { icon: Users, label: 'Gestão Municipal', path: '/admin' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-white text-slate-700 h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-slate-100 shadow-sm">
            <div className="p-6 flex items-center justify-center border-b border-slate-50">
                <img src="/logo.png" alt="EnviroAsset" className="h-8 object-contain" />
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-blue-50 text-cta font-semibold shadow-sm shadow-blue-100'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-cta'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-50">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                    <div className="w-8 h-8 rounded-full bg-cta text-white flex items-center justify-center text-xs font-bold">
                        HM
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">Henrique M.</span>
                        <span className="text-xs text-slate-400">Consultor</span>
                    </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors py-2">
                    <LogOut className="w-3 h-3" /> Sair do Sistema
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
