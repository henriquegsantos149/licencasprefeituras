import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente para logar mudanças de rota no console e no terminal do servidor
 * Exibe mensagens formatadas quando o usuário navega entre páginas
 * Formato: [NAV] - NAV - rota - 0ms (seguindo padrão das rotas HTTP)
 */
const RouteLogger = () => {
    const location = useLocation();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const isDevelopment = import.meta.env.DEV;

    useEffect(() => {
        // Formato padronizado: [NAV] - NAV - rota - 0ms (seguindo padrão das rotas HTTP)
        const logMessage = `[NAV] - NAV   - ${location.pathname.padEnd(40)} -    0.00ms`;

        // Criar mensagem formatada com cores para console do navegador
        const styledMessage = `%c[NAV]%c - NAV   - %c${location.pathname}%c -    0.00ms`;
        
        // Estilos para o console (cores similares ao backend)
        const styles = [
            'color: #00bcd4; font-weight: bold;', // [NAV] - ciano (igual ao backend)
            'color: #6b7280;', // Separador
            'color: #10b981; font-weight: bold;', // Path - verde
            'color: #6b7280;', // Separador
            'color: #9ca3af; font-size: 0.9em;' // Tempo - cinza claro
        ];

        // Log formatado com cores (console do navegador)
        console.log(styledMessage, ...styles);
        
        // Log simples para compatibilidade e fácil leitura
        console.log(logMessage);

        // Enviar log para o backend (apenas em desenvolvimento)
        if (isDevelopment) {
            // Usar fetch sem await para não bloquear a navegação
            fetch(`${API_BASE_URL}/dev/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'NAV',
                    route: location.pathname
                })
            }).catch(error => {
                // Silenciosamente falhar se o backend não estiver disponível
                // Não queremos quebrar a aplicação por causa de logs
                console.debug('Não foi possível enviar log para o servidor:', error);
            });
        }
    }, [location, API_BASE_URL, isDevelopment]);

    return null; // Componente não renderiza nada
};

export default RouteLogger;
