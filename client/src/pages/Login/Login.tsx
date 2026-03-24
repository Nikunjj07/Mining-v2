import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await signIn(email, password);
            // Redirect based on user role
            if (user?.role === 'admin') {
                navigate('/dashboard/admin');
            } else if (user?.role === 'rescue') {
                navigate('/dashboard/rescue');
            } else {
                navigate('/dashboard/supervisor');
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Invalid email or password';
            setError(message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
                    Disaster Management
                </h1>
                <p className="text-center text-muted-foreground mb-8">
                    Sign in to your account
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            placeholder="admin@mine.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p className="mt-4">
                        Don't have an account?{' '}
                        <a href="/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
