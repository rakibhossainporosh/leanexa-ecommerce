<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CustomPage extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'is_active',
        'show_in_footer',
        'footer_section',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_in_footer' => 'boolean',
    ];

    /**
     * Generate a unique slug from the title when one isn't supplied.
     */
    public static function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source) ?: 'page';
        $slug = $base;
        $i = 1;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }
}
