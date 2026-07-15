<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index()
    {
        $media = Media::latest()->get();

        return Inertia::render('admin/media/index', [
            'media' => $media,
            'stats' => [
                'count' => $media->count(),
                'total_size' => $this->humanSize((int) $media->sum('size')),
            ],
        ]);
    }

    /**
     * JSON list used by the media picker (e.g. inside the product form).
     */
    public function list(Request $request)
    {
        $query = trim((string) $request->input('q', ''));

        $media = Media::query()
            ->when($query !== '', fn ($q) => $q->where('name', 'like', "%{$query}%"))
            ->latest()
            ->limit(60)
            ->get();

        return response()->json($media);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            // SVG is intentionally excluded: it can carry embedded scripts and,
            // served from our own domain, becomes a stored-XSS vector.
            // Oversized files are compressed down to ~2 MB automatically.
            'files.*' => 'image|mimes:jpg,jpeg,png,gif,webp,avif,bmp|max:20480',
        ]);

        $imageService = app(\App\Services\ImageService::class);

        foreach ($request->file('files') as $file) {
            $path = $imageService->compressAndStore($file, 'media');

            Media::create([
                'name' => $file->getClientOriginalName(),
                'file_name' => basename($path),
                'path' => $path,
                'mime_type' => Storage::disk('public')->mimeType($path) ?: $file->getClientMimeType(),
                'extension' => strtolower(pathinfo($path, PATHINFO_EXTENSION)),
                'size' => Storage::disk('public')->size($path),
            ]);
        }

        return redirect()->back()->with('success', 'Media uploaded successfully.');
    }

    public function update(Request $request, Media $medium)
    {
        $validated = $request->validate([
            'alt' => 'nullable|string|max:255',
        ]);

        $medium->update($validated);

        return redirect()->back()->with('success', 'Media updated successfully.');
    }

    public function destroy(Media $medium)
    {
        Storage::disk('public')->delete($medium->path);
        $medium->delete();

        return redirect()->back()->with('success', 'Media deleted successfully.');
    }

    private function humanSize(int $bytes): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $power = min((int) floor(log($bytes, 1024)), count($units) - 1);

        return round($bytes / (1024 ** $power), 2) . ' ' . $units[$power];
    }
}
