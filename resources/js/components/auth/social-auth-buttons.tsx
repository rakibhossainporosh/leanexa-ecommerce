import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/**
 * Social sign-in placeholders. These are intentionally non-functional
 * (no OAuth backend wired yet) — they present the UI and surface a friendly
 * toast so nothing silently does nothing. Swap the onClick for a real
 * redirect when an OAuth provider is added.
 */
function GoogleIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.67 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
        </svg>
    );
}

function AppleIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.37 12.72c.03 3.1 2.72 4.13 2.75 4.14-.02.08-.43 1.47-1.42 2.9-.85 1.24-1.74 2.47-3.13 2.5-1.37.02-1.81-.81-3.37-.81-1.56 0-2.05.79-3.35.83-1.34.05-2.37-1.34-3.23-2.58-1.76-2.54-3.1-7.18-1.3-10.31.9-1.55 2.5-2.53 4.24-2.56 1.32-.02 2.56.89 3.37.89.8 0 2.31-1.1 3.9-.94.66.03 2.52.27 3.72 2.02-.1.06-2.22 1.3-2.19 3.87M13.9 4.02c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.08 3.17 1.15.09 2.32-.58 3.03-1.45" />
        </svg>
    );
}

export default function SocialAuthButtons({ action = 'sign in' }: { action?: string }) {
    const notify = (provider: string) => toast.info(`${provider} ${action} is coming soon.`);

    return (
        <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="h-11" onClick={() => notify('Google')}>
                <GoogleIcon />
                <span className="ml-2">Google</span>
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => notify('Apple')}>
                <AppleIcon />
                <span className="ml-2">Apple</span>
            </Button>
        </div>
    );
}
