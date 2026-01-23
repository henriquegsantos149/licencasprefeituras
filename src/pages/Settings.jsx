import React, { useState } from 'react';
import { Save, Bell, Moon, Shield, User } from 'lucide-react';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: 'Henrique M.',
        email: 'henrique@ambientalpro.com',
        notifications: true,
        darkMode: false,
        publicProfile: true
    });

    const handleSave = () => {
        setLoading(true);
        // Mock API call
        setTimeout(() => {
            setLoading(false);
            alert('Configurações salvas com sucesso!');
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 fade-in">
            <div>
                <h2 className="text-2xl font-bold text-primary">Configurações</h2>
                <p className="text-slate-500">Gerencie suas preferências e dados da conta.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Profile Section */}
                <div className="p-8 border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-50 text-cta rounded-lg">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-primary">Perfil do Usuário</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">E-mail Profissional</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-primary">Preferências e Segurança</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-cta/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-700">Notificações por E-mail</p>
                                    <p className="text-xs text-slate-500">Receber atualizações sobre o andamento dos processos.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.notifications}
                                    onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cta"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-cta/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-700">Modo Escuro (Beta)</p>
                                    <p className="text-xs text-slate-500">Ativar interface escura para ambientes noturnos.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.darkMode}
                                    onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cta"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
