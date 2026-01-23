import React from 'react';
import { Bell, Search } from 'lucide-react';

const Header = ({ title }) => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 ml-64">
            <div>
                <h1 className="text-xl font-bold text-primary">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar processos..."
                        className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                    />
                </div>

                <button className="relative p-2 text-slate-500 hover:text-primary transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
