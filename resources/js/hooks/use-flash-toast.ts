import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    useEffect(() => {
        const handleFlash = (flash: any) => {
            if (!flash) return;

            const data = flash.toast as FlashToast | undefined;
            if (data) {
                toast[data.type](data.message);
            }

            if (flash.success) {
                toast.success(flash.success);
            }

            if (flash.error) {
                toast.error(flash.error);
            }
        };

        // Initial page load
        if (router.page?.props?.flash) {
            handleFlash(router.page.props.flash);
        }

        // On subsequent navigations or form submissions
        const removeNavigateListener = router.on('navigate', (event: any) => {
            handleFlash(event.detail.page.props.flash);
        });
        
        return () => {
            removeNavigateListener();
        };
    }, []);
}
