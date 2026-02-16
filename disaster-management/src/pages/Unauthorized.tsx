export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Unauthorized Access</h2>
                <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </div>
        </div>
    );
}
