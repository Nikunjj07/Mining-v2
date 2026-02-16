import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | string;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
    className?: string;
}

export default function DataTable<T extends Record<string, any>>({
    columns,
    data,
    emptyMessage = 'No data available',
    className = '',
}: DataTableProps<T>) {
    const getCellValue = (item: T, accessor: keyof T | string): any => {
        if (typeof accessor === 'string' && accessor.includes('.')) {
            // Handle nested properties like 'user.name'
            return accessor.split('.').reduce((obj, key) => obj?.[key], item);
        }
        return item[accessor as keyof T];
    };

    if (data.length === 0) {
        return (
            <div className={`bg-card border border-border rounded-lg p-12 text-center ${className}`}>
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full bg-card border border-border rounded-lg">
                <thead className="bg-accent">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {data.map((item, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-accent/50 transition-colors">
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className="px-6 py-4 text-sm text-foreground">
                                    {column.render
                                        ? column.render(item)
                                        : getCellValue(item, column.accessor)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
