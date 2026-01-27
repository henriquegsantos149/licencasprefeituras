import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const ThemeProvider = ({ children }) => {
    // useAuth pode lançar erro se AuthProvider não estiver disponível
    // Usar verificação segura com try-catch
    let user = null;
    let isAuthenticated = false;
    
    try {
        const authContext = useAuth();
        user = authContext?.user || null;
        isAuthenticated = authContext?.isAuthenticated || false;
    } catch (error) {
        // Se useAuth falhar (contexto não disponível), usar valores padrão
        // Isso não deve acontecer se AuthProvider estiver acima do ThemeProvider
        user = null;
        isAuthenticated = false;
    }
    
    const [darkMode, setDarkMode] = useState(() => {
        // Carregar preferência do localStorage
        // Se não houver nada salvo, usar modo claro como padrão
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            return saved === 'true';
        }
        // Padrão: modo claro (false)
        return false;
    });

    // Carregar preferências do backend quando usuário estiver autenticado
    useEffect(() => {
        if (isAuthenticated && user) {
            loadPreferencesFromBackend();
        } else if (!isAuthenticated) {
            // Se não estiver autenticado, garantir modo claro como padrão
            // a menos que tenha uma preferência salva no localStorage
            const saved = localStorage.getItem('darkMode');
            if (saved === null) {
                setDarkMode(false);
            }
        }
    }, [isAuthenticated, user?.id]);

    const loadPreferencesFromBackend = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/users/me/preferences`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const preferences = await response.json();
                // Se houver preferência definida no backend, usar ela
                // Caso contrário, manter modo claro (false) como padrão
                if (preferences.darkMode !== undefined) {
                    setDarkMode(preferences.darkMode);
                } else {
                    // Se não houver darkMode definido, usar modo claro
                    setDarkMode(false);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar preferências do backend:', error);
        }
    };

    const savePreferencesToBackend = async (darkModeValue) => {
        if (!isAuthenticated || !user) {
            // Se não estiver autenticado, salvar apenas no localStorage
            localStorage.setItem('darkMode', darkModeValue.toString());
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                localStorage.setItem('darkMode', darkModeValue.toString());
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/me/preferences`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ darkMode: darkModeValue })
            });

            if (response.ok) {
                // Preferência salva no backend com sucesso
                localStorage.setItem('darkMode', darkModeValue.toString());
            } else {
                // Se falhar, salvar no localStorage como fallback
                localStorage.setItem('darkMode', darkModeValue.toString());
            }
        } catch (error) {
            console.error('Erro ao salvar preferências no backend:', error);
            // Fallback para localStorage
            localStorage.setItem('darkMode', darkModeValue.toString());
        }
    };

    useEffect(() => {
        // Aplicar ou remover classe 'dark' no elemento raiz
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        // Salvar preferência (no backend se autenticado, senão no localStorage)
        savePreferencesToBackend(darkMode);
    }, [darkMode, isAuthenticated, user?.id]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const setTheme = (isDark) => {
        setDarkMode(isDark);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
