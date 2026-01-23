import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const ModernSelect = ({ options, value, onChange, placeholder = "Selecione...", label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search
    const filteredGroups = Object.keys(options).reduce((acc, group) => {
        const filteredItems = options[group].filter(item =>
            item.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredItems.length > 0) {
            acc[group] = filteredItems;
        }
        return acc;
    }, {});

    const handleSelect = (item) => {
        onChange(item);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 text-left flex items-center justify-between shadow-sm hover:border-blue-400 transition-colors ${isOpen ? 'ring-2 ring-blue-100 border-blue-500' : ''}`}
            >
                <span className={!value ? 'text-slate-400' : 'font-medium'}>
                    {value || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 max-h-[300px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Buscar atividade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-1">
                        {Object.keys(filteredGroups).length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                                Nenhuma atividade encontrada.
                            </div>
                        ) : (
                            Object.entries(filteredGroups).map(([group, items]) => (
                                <div key={group} className="mb-2">
                                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                        {group}
                                    </div>
                                    <div className="space-y-0.5">
                                        {items.map(item => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => handleSelect(item)}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between group transition-colors
                                                    ${value === item
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-slate-700 hover:bg-slate-100'}`}
                                            >
                                                {item}
                                                {value === item && <Check className="w-4 h-4 text-blue-600" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernSelect;
