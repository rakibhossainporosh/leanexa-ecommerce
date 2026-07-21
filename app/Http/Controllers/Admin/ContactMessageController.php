<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactMessageController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/messages/index', [
            'messages' => ContactMessage::latest()->paginate(20),
            'unreadCount' => ContactMessage::where('is_read', false)->count(),
        ]);
    }

    public function update(ContactMessage $message)
    {
        $message->update(['is_read' => ! $message->is_read]);

        return redirect()->back();
    }

    public function destroy(ContactMessage $message)
    {
        $message->delete();

        return redirect()->back()->with('success', 'Message deleted.');
    }
}
