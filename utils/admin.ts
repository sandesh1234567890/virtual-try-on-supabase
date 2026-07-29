import { User } from '@supabase/supabase-js';

export const isAdmin = (user: User | null) => {
    if (!user || !user.email) return false;

    // Get emails from env, split by comma, trim whitespace
    const envEmails = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
    const adminEmails = envEmails.split(',').map(e => e.trim().toLowerCase());

    return adminEmails.includes(user.email.toLowerCase());
};
