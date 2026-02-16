import { Link, useLocation } from 'react-router-dom';
import type { User } from '../../types/database.types';

interface SidebarProps {
    user: User | null;
}

interface NavItem {
    name: string;
    path: string;
    icon: JSX.Element;
    roles: Array<'admin' | 'supervisor' | 'worker' | 'rescue'>;
}

export default function Sidebar({ user }: SidebarProps) {
    const location = useLocation();

    const navItems: NavItem[] = [
        {
            name: 'Dashboard',
            path: user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'rescue' ? '/dashboard/rescue' : '/dashboard/supervisor',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            roles: ['admin', 'supervisor', 'worker', 'rescue'],
        },
        {
            name: 'Shift Logs',
            path: '/shifts',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            roles: ['admin', 'supervisor', 'worker'],
        },
        {
            name: 'Emergencies',
            path: '/emergencies',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            roles: ['admin', 'supervisor', 'worker', 'rescue'],
        },
        {
            name: 'Hazards',
            path: '/hazards',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            roles: ['admin'],
        },
    ];

    const filteredNavItems = navItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen">
            <div className="p-4 space-y-2">
                {filteredNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
