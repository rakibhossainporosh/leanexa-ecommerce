<?php

namespace App\Console\Commands;

use App\Models\Media;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ImportMedia extends Command
{
    protected $signature = 'media:import';

    protected $description = 'Import existing files from the public disk into the media table';

    private const ALLOWED = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp'];

    public function handle(): int
    {
        $disk = Storage::disk('public');
        $imported = 0;

        foreach ($disk->allFiles() as $path) {
            if (str_starts_with(basename($path), '.')) {
                continue;
            }

            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            if (! in_array($extension, self::ALLOWED)) {
                continue;
            }

            if (Media::where('path', $path)->exists()) {
                continue;
            }

            Media::create([
                'name' => basename($path),
                'file_name' => basename($path),
                'path' => $path,
                'mime_type' => rescue(fn () => $disk->mimeType($path), null, false),
                'extension' => $extension,
                'size' => rescue(fn () => $disk->size($path), 0, false),
            ]);

            $imported++;
        }

        $this->info("Imported {$imported} media file(s).");

        return self::SUCCESS;
    }
}
