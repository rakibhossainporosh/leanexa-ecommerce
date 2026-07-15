<?php

namespace App\Services;

use App\Repositories\Interfaces\TagRepositoryInterface;
use Illuminate\Support\Str;

class TagService
{
    public function __construct(
        protected TagRepositoryInterface $tagRepository
    ) {}

    public function getAllTags()
    {
        return $this->tagRepository->all();
    }

    public function createTag(array $data)
    {
        $data['slug'] = Str::slug($data['name']);
        return $this->tagRepository->create($data);
    }

    public function updateTag(int $id, array $data)
    {
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        return $this->tagRepository->update($id, $data);
    }

    public function deleteTag(int $id)
    {
        return $this->tagRepository->delete($id);
    }
}
