'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const session = localStorage.getItem('admin_session');
        if (session === 'true') {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    }, []);

    const handleLogin = (password: string) => {
        // We'll use a simple fetch to an API to verify the password
        // to keep it secure and not expose the password in client code.
        verifyPassword(password);
    };

    async function verifyPassword(password: string) {
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                body: JSON.stringify({ password }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('admin_session', 'true');
                setIsAuthorized(true);
            } else {
                alert("Incorrect password");
            }
        } catch (err) {
            console.error(err);
        }
    }

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return <>{children}</>;
}
