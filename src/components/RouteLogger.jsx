import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente para logar mudanças de rota no console
 * Exibe mensagens formatadas quando o usuário navega entre páginas
 * Formato: [NAV] Nome da Rota - /path @ timestamp
 */
const RouteLogger = () => {
    const location = useLocation();

    useEffect(() => {
        // Obter nome da rota baseado no pathname
        const getRouteName = (pathname) => {
            const routeMap = {
                '/': 'Login',
                '/login': 'Login',
                '/register': 'Registro',
                '/dashboard': 'Dashboard',
                '/new': 'Novo Processo',
                '/settings': 'Configurações',
                '/admin': 'Gestão Municipal',
            };

            // Verificar se é uma rota dinâmica (ex: /process/:id)
            if (pathname.startsWith('/process/')) {
                const processId = pathname.split('/process/')[1];
                return `Detalhes do Processo (ID: ${processId})`;
            }

            return routeMap[pathname] || pathname;
        };

        const routeName = getRouteName(location.pathname);
        const timestamp = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });

        // Formato padronizado similar ao backend: [NAV] Nome - path @ timestamp
        const logMessage = `[NAV] ${routeName.padEnd(30)} - ${location.pathname.padEnd(25)} @ ${timestamp}`;

        // Criar mensagem formatada com cores para console do navegador
        const styledMessage = `%c[NAV]%c ${routeName} %c- ${location.pathname} %c@ ${timestamp}`;
        
        // Estilos para o console (cores similares ao backend)
        const styles = [
            'color: #6366f1; font-weight: bold;', // [NAV] - azul
            'color: #10b981; font-weight: bold;', // Nome da rota - verde
            'color: #6b7280;', // Path - cinza
            'color: #9ca3af; font-size: 0.9em;' // Timestamp - cinza claro
        ];

        // Log formatado com cores (console do navegador)
        console.log(styledMessage, ...styles);
        
        // Log simples para compatibilidade e fácil leitura
        console.log(logMessage);
    }, [location]);

    return null; // Componente não renderiza nada
};

export default RouteLogger;
