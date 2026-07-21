import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, MailOpen, MailCheck, Inbox } from 'lucide-react';

type Message = {
    id: number;
    name: string;
    email: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

export default function MessagesIndex({
    messages,
    unreadCount = 0,
}: {
    messages: { data: Message[]; links: { url: string | null; label: string; active: boolean }[] };
    unreadCount?: number;
}) {
    const toggleRead = (m: Message) => {
        router.put(`/admin/messages/${m.id}`, {}, { preserveScroll: true });
    };

    const remove = (m: Message) => {
        if (confirm(`Delete the message from ${m.name}? This cannot be undone.`)) {
            router.delete(`/admin/messages/${m.id}`, { preserveScroll: true });
        }
    };

    const rows = messages?.data ?? [];

    return (
        <AdminLayout title="Messages">
            <Head title="Contact Messages" />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    Messages sent from the Contact Us page.
                    {unreadCount > 0 && <span className="text-shop font-medium"> {unreadCount} unread.</span>}
                </p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {rows.map((m) => (
                            <div key={m.id} className={`flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:justify-between ${m.is_read ? '' : 'bg-shop-primary/5'}`}>
                                <div className="min-w-0 flex-1 space-y-2">
                                    {!m.is_read && <span className="inline-block rounded-full bg-shop-primary/10 px-2 py-0.5 text-[11px] font-medium text-shop">New</span>}
                                    <div>
                                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Name</span>
                                        <p className="font-semibold">{m.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Email</span>
                                        <p className="text-sm">{m.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Message</span>
                                        <p className="whitespace-pre-line text-sm text-foreground">{m.message}</p>
                                    </div>
                                    <p className="text-muted-foreground text-xs">{new Date(m.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <Button variant="ghost" size="icon" title={m.is_read ? 'Mark as unread' : 'Mark as read'} onClick={() => toggleRead(m)}>
                                        {m.is_read ? <MailOpen className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete" onClick={() => remove(m)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {rows.length === 0 && (
                            <div className="flex flex-col items-center py-16 text-center">
                                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                    <Inbox className="text-muted-foreground h-8 w-8" />
                                </div>
                                <p className="font-medium">No messages yet</p>
                                <p className="text-muted-foreground mt-1 text-sm">Messages from the Contact Us form will appear here.</p>
                            </div>
                        )}
                    </div>

                    {messages?.links?.length > 3 && (
                        <div className="flex flex-wrap gap-1 border-t p-4">
                            {messages.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-shop-primary text-white' : 'text-muted-foreground hover:bg-muted'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
