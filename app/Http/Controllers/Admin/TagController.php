<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TagService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagController extends Controller
{
    public function __construct(
        protected TagService $tagService
    ) {}

    public function index()
    {
        $tags = $this->tagService->getAllTags();
        return Inertia::render('admin/tags/index', [
            'tags' => $tags
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $this->tagService->createTag($validated);

        return redirect()->back()->with('success', 'Tag created successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $this->tagService->updateTag($id, $validated);

        return redirect()->back()->with('success', 'Tag updated successfully.');
    }

    public function destroy($id)
    {
        $this->tagService->deleteTag($id);
        
        return redirect()->back()->with('success', 'Tag deleted successfully.');
    }
}
