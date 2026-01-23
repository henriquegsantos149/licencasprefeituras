import React from 'react';

const TrafficLight = ({ status }) => {
    const colors = {
        green: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
        yellow: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
        red: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
    };

    return (
        <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-slate-300'}`} />
    );
};

export default TrafficLight;
