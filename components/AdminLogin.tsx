'use client';

import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLogin({ onLogin }: { onLogin: (pass: string) => void }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        // Simple client-side check for immediate feedback
        // In the layout, we will also verify this against the server-side env
        onLogin(password);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
                    <p className="text-gray-500 text-center mt-2">Please enter your password to manage the collection.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center text-lg tracking-widest"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : "Unlock Dashboard"}
                    </button>

                    {error && (
                        <p className="text-red-500 text-sm text-center">Incorrect password. Please try again.</p>
                    )}
                </form>
            </div>
        </div>
    );
}
