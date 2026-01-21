import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ title = "Dashboard" }) => {
    return (
        <div className="min-h-screen bg-background font-sans">
            <Sidebar />
            <Header title={title} />
            <main className="ml-64 p-8 fade-in">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
