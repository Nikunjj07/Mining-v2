import StatusBadge from './StatusBadge';

interface ShiftLog {
    id: string;
    created_by: string;
    shift: 'morning' | 'evening' | 'night';
    production_summary: string;
    equipment_status: string;
    safety_issues: string | null;
    red_flag: boolean;
    next_shift_instructions: string | null;
    acknowledged: boolean;
    created_at: string;
    supervisor?: {
        id: string;
        full_name: string;
        email: string;
    };
}

interface ShiftCardProps {
    shiftLog: ShiftLog;
    onAcknowledge?: (shiftLogId: string) => void;
    onDownloadPDF?: (shiftLog: ShiftLog) => void;
    showAcknowledgeButton?: boolean;
    showPDFButton?: boolean;
}

export default function ShiftCard({ shiftLog, onAcknowledge, onDownloadPDF, showAcknowledgeButton = true, showPDFButton = true }: ShiftCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getShiftBadgeVariant = (shift: string): 'blue' | 'orange' | 'purple' | 'default' => {
        switch (shift) {
            case 'morning':
                return 'blue';
            case 'evening':
                return 'orange';
            case 'night':
                return 'purple';
            default:
                return 'default';
        }
    };

    return (
        <div
            className={`bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${shiftLog.red_flag ? 'border-destructive border-2' : 'border-border'
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <StatusBadge variant={getShiftBadgeVariant(shiftLog.shift)}>
                        {shiftLog.shift}
                    </StatusBadge>
                    {shiftLog.red_flag && (
                        <StatusBadge variant="danger">
                            Red Flag
                        </StatusBadge>
                    )}
                    {shiftLog.acknowledged && (
                        <StatusBadge variant="success">
                            Acknowledged
                        </StatusBadge>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                        {shiftLog.supervisor?.full_name || 'Unknown Supervisor'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(shiftLog.created_at)}</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Production Summary */}
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Production Summary</h4>
                    <p className="text-sm text-muted-foreground">{shiftLog.production_summary}</p>
                </div>

                {/* Equipment Status */}
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Equipment Status</h4>
                    <p className="text-sm text-muted-foreground">{shiftLog.equipment_status}</p>
                </div>

                {/* Safety Issues */}
                {shiftLog.safety_issues && (
                    <div>
                        <h4 className="text-sm font-semibold text-destructive mb-1">Safety Issues</h4>
                        <p className="text-sm text-muted-foreground">{shiftLog.safety_issues}</p>
                    </div>
                )}

                {/* Next Shift Instructions */}
                {shiftLog.next_shift_instructions && (
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                            Next Shift Instructions
                        </h4>
                        <p className="text-sm text-muted-foreground">{shiftLog.next_shift_instructions}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {(!shiftLog.acknowledged && showAcknowledgeButton && onAcknowledge) || (showPDFButton && onDownloadPDF) ? (
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    {!shiftLog.acknowledged && showAcknowledgeButton && onAcknowledge && (
                        <button
                            onClick={() => onAcknowledge(shiftLog.id)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm"
                        >
                            Acknowledge Shift
                        </button>
                    )}
                    {showPDFButton && onDownloadPDF && (
                        <button
                            onClick={() => onDownloadPDF(shiftLog)}
                            className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
                        >
                            Download PDF
                        </button>
                    )}
                </div>
            ) : null}
        </div>
    );
}
