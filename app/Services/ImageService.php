<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageService
{
    /**
     * Target ceiling for stored images.
     */
    public const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

    /**
     * Store an uploaded image on the public disk, automatically re-encoding
     * and downscaling anything larger than $maxBytes until it fits.
     *
     * @return string The stored path relative to the public disk.
     */
    public function compressAndStore(UploadedFile $file, string $directory, int $maxBytes = self::MAX_BYTES): string
    {
        // Already small enough (and not worth re-encoding): store as-is.
        if ($file->getSize() <= $maxBytes) {
            $path = $file->store($directory, 'public');
            if ($path === false) {
                throw new \RuntimeException('Failed to store the uploaded image.');
            }

            return $path;
        }

        $manager = new ImageManager(new Driver());
        $image = $manager->decodePath($file->getPathname());

        // Cap the longest side first — dimensions dominate file size.
        $image->scaleDown(1920, 1920);

        $encoded = $this->encode($image, 85);

        // Step the quality down until the image fits.
        $quality = 75;
        while (strlen((string) $encoded) > $maxBytes && $quality >= 35) {
            $encoded = $this->encode($image, $quality);
            $quality -= 10;
        }

        // Still too big (extreme cases): shrink dimensions harder.
        while (strlen((string) $encoded) > $maxBytes && $image->width() > 640) {
            $image->scaleDown((int) ($image->width() * 0.75));
            $encoded = $this->encode($image, 60);
        }

        $path = trim($directory, '/') . '/' . Str::random(40) . '.' . $this->extension();
        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }

    /**
     * WebP keeps transparency and compresses well; fall back to JPEG when
     * the local GD build lacks WebP support.
     */
    private function encode(\Intervention\Image\Interfaces\ImageInterface $image, int $quality): \Intervention\Image\Interfaces\EncodedImageInterface
    {
        if (function_exists('imagewebp')) {
            return $image->encode(new \Intervention\Image\Encoders\WebpEncoder(quality: $quality));
        }

        return $image->encode(new \Intervention\Image\Encoders\JpegEncoder(quality: $quality));
    }

    private function extension(): string
    {
        return function_exists('imagewebp') ? 'webp' : 'jpg';
    }
}
