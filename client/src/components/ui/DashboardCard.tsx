interface DashboardCardProps {
    title: string;
    value: string | number;
    icon?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

export default function DashboardCard({
    title,
    value,
    icon,
    trend,
    variant = 'default',
    className = '',
}: DashboardCardProps) {
    const variantClasses = {
        default: 'border-border',
        primary: 'border-primary bg-primary/5',
        success: 'border-green-500 bg-green-500/5',
        warning: 'border-yellow-500 bg-yellow-500/5',
        danger: 'border-destructive bg-destructive/5',
    };

    return (
        <div
            className={`bg-card border-2 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${variantClasses[variant]} ${className}`}
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {title}
                </h3>
                {icon && <span className="text-2xl">{icon}</span>}
            </div>

            <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-foreground">{value}</p>

                {trend && (
                    <div
                        className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? 'text-green-500' : 'text-destructive'
                            }`}
                    >
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
