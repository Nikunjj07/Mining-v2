import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <Navbar title={title} />
            <div className="flex">
                <Sidebar user={user} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
