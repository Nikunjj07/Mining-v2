import React from 'react';

interface StatusBadgeProps {
    variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'blue' | 'orange' | 'purple';
    children: React.ReactNode;
    className?: string;
}

export default function StatusBadge({ variant, children, className = '' }: StatusBadgeProps) {
    const variantClasses = {
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        danger: 'bg-destructive text-destructive-foreground',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
