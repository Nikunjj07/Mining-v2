import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types/database.types';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<User['role']>('worker');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await signUp(email, password, fullName, role);

            if (!user) {
                throw new Error('Failed to create user');
            }

            // Redirect based on role
            switch (user.role) {
                case 'admin':
                    navigate('/dashboard/admin');
                    break;
                case 'supervisor':
                    navigate('/dashboard/supervisor');
                    break;
                case 'worker':
                    navigate('/dashboard/supervisor');
                    break;
                case 'rescue':
                    navigate('/dashboard/rescue');
                    break;
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Failed to create account';
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
                    Create Account
                </h1>
                <p className="text-center text-muted-foreground mb-8">
                    Join the disaster management team
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Email */}
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
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password */}
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
                            minLength={8}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            placeholder="••••••••"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Minimum 8 characters with 1 uppercase, 1 lowercase, and 1 number
                        </p>
                    </div>

                    {/* Role Selection - Admin option removed for security */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as User['role'])}
                            className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        >
                            <option value="worker">Worker</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="rescue">Rescue Team</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Select your role in the organization
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}
