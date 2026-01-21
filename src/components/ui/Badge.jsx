import React from 'react';

const Badge = ({ status }) => {
    const styles = {
        'Aberto': 'bg-blue-100 text-blue-700 border-blue-200',
        'Em Análise': 'bg-purple-100 text-purple-700 border-purple-200',
        'Pendência': 'bg-orange-100 text-orange-700 border-orange-200',
        'Vistoria Agendada': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Emitido': 'bg-green-100 text-green-700 border-green-200',
        'Indeferido': 'bg-red-100 text-red-700 border-red-200',
    };

    const defaultStyle = 'bg-slate-100 text-slate-700 border-slate-200';

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || defaultStyle}`}>
            {status}
        </span>
    );
};

export default Badge;
