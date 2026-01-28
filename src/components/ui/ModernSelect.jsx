import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

/**
 * ModernSelect
 * - Grouped, searchable dropdown aligned with the project's design system.
 *
 * Props:
 * - label?: string
 * - placeholder?: string
 * - value: string
 * - onChange: (value: string) => void
 * - disabled?: boolean
 * - groups: Array<{ label: string; options: Array<{ value: string; label: string }> }>
 */
const ModernSelect = ({ groups, value, onChange, placeholder = 'Selecione...', label, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const flatLabelByValue = useMemo(() => {
        const map = new Map();
        (groups || []).forEach((g) => {
            (g.options || []).forEach((opt) => map.set(opt.value, opt.label));
        });
        return map;
    }, [groups]);

    const selectedLabel = flatLabelByValue.get(value) || '';

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

    // Filter options by search
    const filteredGroups = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return groups || [];

        return (groups || [])
            .map((g) => ({
                ...g,
                options: (g.options || []).filter((opt) => (opt.label || '').toLowerCase().includes(term)),
            }))
            .filter((g) => (g.options || []).length > 0);
    }, [groups, searchTerm]);

    const handleSelect = (nextValue) => {
        onChange(nextValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const toggle = () => {
        if (disabled) return;
        setIsOpen((v) => !v);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && (
                <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={toggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`input text-sm md:text-base flex items-center justify-between gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                    isOpen ? 'ring-2 ring-cta/20 dark:ring-blue-500/20 border-cta dark:border-blue-500' : ''
                }`}
            >
                <span className={`truncate ${selectedLabel ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                className="input text-sm md:text-base pl-10"
                                placeholder="Buscar atividade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto p-2">
                        {filteredGroups.length === 0 ? (
                            <div className="p-4 text-center text-xs md:text-sm text-slate-500 dark:text-slate-400">
                                Nenhuma atividade encontrada.
                            </div>
                        ) : (
                            filteredGroups.map((group) => (
                                <div key={group.label} className="mb-2 last:mb-0">
                                    <div className="px-2 py-1 text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        {group.label}
                                    </div>
                                    <div className="space-y-1">
                                        {group.options.map((opt) => {
                                            const isSelected = value === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => handleSelect(opt.value)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                                                        isSelected
                                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-cta dark:text-blue-300'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                                                    }`}
                                                >
                                                    <span className="truncate text-xs md:text-sm">{opt.label}</span>
                                                    {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
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

