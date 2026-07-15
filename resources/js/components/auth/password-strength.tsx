import { useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Lightweight, dependency-free password strength meter.
 * Purely presentational — it never blocks submission; the backend
 * password rules remain the source of truth.
 */
export function scorePassword(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
}

const LEVELS = [
    { label: 'Too weak', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
    { label: 'Weak', bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
    { label: 'Fair', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Good', bar: 'bg-lime-500', text: 'text-lime-600 dark:text-lime-500' },
    { label: 'Strong', bar: 'bg-green-500', text: 'text-green-600 dark:text-green-500' },
];

export default function PasswordStrength({ password }: { password: string }) {
    const score = useMemo(() => scorePassword(password), [password]);
    const level = LEVELS[score];

    if (!password) return null;

    return (
        <div className="mt-1 space-y-1.5">
            <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            'h-1.5 flex-1 rounded-full transition-colors duration-300',
                            i < score ? level.bar : 'bg-muted',
                        )}
                    />
                ))}
            </div>
            <p className={cn('text-xs font-medium', level.text)}>Password strength: {level.label}</p>
        </div>
    );
}
