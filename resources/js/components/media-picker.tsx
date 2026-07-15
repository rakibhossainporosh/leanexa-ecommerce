import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, ImageOff, Upload, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export type PickedMedia = {
    id: number;
    name: string;
    url: string;
    path: string;
    size_human: string;
    extension: string;
};

export default function MediaPicker({
    open,
    onOpenChange,
    onSelect,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (media: PickedMedia) => void;
}) {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<PickedMedia[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        const t = setTimeout(() => {
            fetch(`/admin/media-list?q=${encodeURIComponent(query)}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            })
                .then((r) => r.json())
                .then((d: PickedMedia[]) => setItems(d))
                .catch(() => setItems([]))
                .finally(() => setLoading(false));
        }, 250);
        return () => clearTimeout(t);
    }, [query, open, refreshTick]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setUploading(true);
        router.post('/admin/media', {
            files: Array.from(e.target.files)
        }, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setQuery('');
                setRefreshTick(r => r + 1);
            },
            onFinish: () => {
                setUploading(false);
                e.target.value = '';
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Select from Media Library</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search media..." className="pl-9" />
                    </div>
                    <div className="relative shrink-0">
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
                            title="Upload new image — JPG, PNG, GIF, WebP, AVIF or BMP. Max 20MB per image."
                            disabled={uploading}
                            onChange={handleUpload}
                        />
                        <Button type="button" variant="outline" disabled={uploading} className="pointer-events-none w-full sm:w-auto">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Upload New
                        </Button>
                    </div>
                </div>

                <p className="text-muted-foreground text-xs">
                    JPG, PNG, GIF, WebP, AVIF or BMP. Max 20MB per image. Recommended: 800x800px (1:1) for products, 1920x800px (12:5) for banners.
                </p>

                {loading && <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>}

                {!loading && items.length === 0 && (
                    <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
                        <ImageOff className="h-8 w-8" />
                        No media found.
                    </div>
                )}

                {!loading && items.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                        {items.map((m) => (
                            <button
                                type="button"
                                key={m.id}
                                onClick={() => {
                                    onSelect(m);
                                    onOpenChange(false);
                                }}
                                className="hover:ring-primary group overflow-hidden rounded-md border text-left transition-all hover:ring-2"
                                title={m.name}
                            >
                                <div className="bg-muted/40 aspect-square overflow-hidden">
                                    <img src={m.url} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                                </div>
                                <div className="p-1.5">
                                    <p className="truncate text-[11px] font-medium">{m.name}</p>
                                    <p className="text-muted-foreground text-[10px]">{m.size_human}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
