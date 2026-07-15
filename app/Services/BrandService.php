<?php

namespace App\Services;

use App\Repositories\Interfaces\BrandRepositoryInterface;
use Illuminate\Support\Str;

class BrandService
{
    public function __construct(
        protected BrandRepositoryInterface $brandRepository
    ) {}

    public function getAllBrands()
    {
        return $this->brandRepository->all();
    }

    public function createBrand(array $data)
    {
        $data['slug'] = Str::slug($data['name']);
        return $this->brandRepository->create($data);
    }

    public function updateBrand(int $id, array $data)
    {
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        return $this->brandRepository->update($id, $data);
    }

    public function deleteBrand(int $id)
    {
        return $this->brandRepository->delete($id);
    }
}
