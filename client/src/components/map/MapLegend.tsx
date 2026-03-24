// Map legend component
export default function MapLegend() {
    return (
        <div className="absolute bottom-4 left-4 bg-card border border-border p-4 rounded-lg shadow-lg z-[1000] max-w-xs">
            <h3 className="font-semibold text-foreground mb-3">Map Legend</h3>

            <div className="space-y-2 text-sm">
                {/* Emergency Markers */}
                <div className="border-b border-border pb-2 mb-2">
                    <p className="text-xs text-muted-foreground font-medium mb-1">EMERGENCIES</p>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs">🚨</div>
                        <span className="text-foreground">High Severity</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs">🚨</div>
                        <span className="text-foreground">Medium Severity</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs">🚨</div>
                        <span className="text-foreground">Low Severity</span>
                    </div>
                </div>

                {/* User Markers */}
                <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">ACTIVE USERS</p>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">👷</div>
                        <span className="text-foreground">Rescue Team</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">👨‍💼</div>
                        <span className="text-foreground">Admin</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-xs">👤</div>
                        <span className="text-foreground">Supervisor</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">🔧</div>
                        <span className="text-foreground">Worker</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
