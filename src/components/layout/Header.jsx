import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const Header = ({ title, onMenuClick }) => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 ml-0 md:ml-64">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                >
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <h1 className="text-lg md:text-xl font-bold text-primary truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                <div className="relative hidden md:block">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar processos..."
                        className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                    />
                </div>

                <button className="md:hidden p-2 text-slate-500 hover:text-primary transition-colors">
                    <Search className="w-5 h-5" />
                </button>

                <button className="relative p-2 text-slate-500 hover:text-primary transition-colors flex-shrink-0">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
