<?php

namespace App\Repositories\Interfaces;

interface ProductRepositoryInterface extends BaseRepositoryInterface
{
    public function getPaginatedWithRelations(int $perPage = 15, array $relations = []);
}
