import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRef, useState } from 'react';
import { UploadCloud, Copy, Trash2, CheckCircle2, ImageOff, Search, Images, HardDrive, X } from 'lucide-react';

type MediaItem = {
    id: number;
    path: string;
    name: string;
    url: string;
    extension: string;
    size: number;
    size_human: string;
    alt: string | null;
    created_at: string;
};

export default function MediaIndex({ media, stats }: { media: MediaItem[]; stats: { count: number; total_size: string } }) {
    const [query, setQuery] = useState('');
    const [copied, setCopied] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, progress, reset } = useForm<{ files: File[] }>({ files: [] });

    const upload = () => {
        if (data.files.length === 0) return;
        post('/admin/media', {
            forceFormData: true,
            onSuccess: () => {
                reset('files');
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    // Append newly picked files to the pending list (instead of replacing it)
    // so users can gather images from several picks/drops and upload once.
    const onFiles = (files: FileList | null) => {
        if (!files || !files.length) return;
        const incoming = Array.from(files).filter(
            (f) => !data.files.some((e) => e.name === f.name && e.size === f.size),
        );
        setData('files', [...data.files, ...incoming]);
    };

    const removeFile = (index: number) => {
        setData('files', data.files.filter((_, i) => i !== index));
    };

    const copyUrl = (item: MediaItem) => {
        const absolute = `${window.location.origin}${item.url}`;
        navigator.clipboard.writeText(absolute).then(() => {
            setCopied(item.id);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const remove = (item: MediaItem) => {
        if (confirm(`Delete "${item.name}"? This cannot be undone.`)) {
            router.delete(`/admin/media/${item.id}`, { preserveScroll: true });
        }
    };

    const filtered = media.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

    return (
        <AdminLayout title="Media Library">
            <Head title="Media Library" />

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:max-w-md">
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md">
                            <Images className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">{stats.count}</div>
                            <div className="text-muted-foreground text-xs">Total files</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md">
                            <HardDrive className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">{stats.total_size}</div>
                            <div className="text-muted-foreground text-xs">Storage used</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Uploader */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    onFiles(e.dataTransfer.files);
                }}
                className={`mb-6 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-border'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        onFiles(e.target.files);
                        // Allow re-picking the same file names on the next open.
                        e.target.value = '';
                    }}
                />
                <UploadCloud className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                <p className="text-sm font-medium">Drag &amp; drop multiple images here, or click to browse</p>
                <p className="text-muted-foreground mt-1 text-xs">
                    PNG, JPG, GIF, WEBP, AVIF, BMP — select as many as you like; large images are compressed automatically
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                    Max 20MB per image. Recommended: 800x800px (1:1) for products, 1920x800px (12:5) for banners.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        {data.files.length > 0 ? 'Add More Files' : 'Choose Files'}
                    </Button>
                    {data.files.length > 0 && (
                        <>
                            <Button type="button" onClick={upload} disabled={processing}>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {processing ? 'Uploading…' : `Upload ${data.files.length} file${data.files.length > 1 ? 's' : ''}`}
                            </Button>
                            <Button type="button" variant="ghost" disabled={processing} onClick={() => setData('files', [])}>
                                Clear
                            </Button>
                        </>
                    )}
                </div>

                {data.files.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        {data.files.map((f, i) => (
                            <div key={`${f.name}-${f.size}`} className="relative w-20">
                                <img
                                    src={URL.createObjectURL(f)}
                                    alt={f.name}
                                    className="h-20 w-20 rounded-md border object-cover"
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    disabled={processing}
                                    className="bg-background absolute -right-2 -top-2 rounded-full border p-0.5 shadow"
                                    aria-label={`Remove ${f.name}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                                <p className="text-muted-foreground mt-1 truncate text-[10px]">{f.name}</p>
                            </div>
                        ))}
                    </div>
                )}

                {progress && (
                    <div className="bg-muted mx-auto mt-4 h-1.5 max-w-sm overflow-hidden rounded-full">
                        <div className="bg-primary h-full transition-all" style={{ width: `${progress.percentage}%` }} />
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="relative w-full max-w-xs">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search media..." className="pl-9" />
                </div>
                <span className="text-muted-foreground shrink-0 text-sm">{filtered.length} shown</span>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                    {filtered.map((item) => (
                        <div key={item.id} className="group bg-card overflow-hidden rounded-lg border">
                            <div className="bg-muted/40 relative flex aspect-square items-center justify-center overflow-hidden">
                                <img src={item.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                                <Badge variant="secondary" className="absolute left-2 top-2 uppercase">
                                    {item.extension}
                                </Badge>
                                {/* Hover actions */}
                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className="h-9 w-9"
                                        title="Copy URL"
                                        onClick={() => copyUrl(item)}
                                    >
                                        {copied === item.id ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="h-9 w-9"
                                        title="Delete"
                                        onClick={() => remove(item)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-2">
                                <p className="truncate text-xs font-medium" title={item.name}>
                                    {item.name}
                                </p>
                                <p className="text-muted-foreground text-[11px]">{item.size_human}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
                    <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        {query ? <X className="text-muted-foreground h-8 w-8" /> : <ImageOff className="text-muted-foreground h-8 w-8" />}
                    </div>
                    <p className="font-medium">{query ? 'No media matches your search' : 'No media yet'}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {query ? 'Try a different keyword.' : 'Upload your first image to get started.'}
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
