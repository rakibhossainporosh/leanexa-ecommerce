<?php

namespace App\Repositories;

use App\Repositories\Interfaces\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

abstract class BaseRepository implements BaseRepositoryInterface
{
    /**
     * @var Model
     */
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->model->with($relations)->get($columns);
    }

    public function find(int $id, array $columns = ['*'], array $relations = []): ?Model
    {
        return $this->model->with($relations)->find($id, $columns);
    }

    public function create(array $payload): Model
    {
        return $this->model->create($payload);
    }

    public function update(int $id, array $payload): bool
    {
        $model = $this->find($id);
        
        if (!$model) {
            return false;
        }

        return $model->update($payload);
    }

    public function delete(int $id): bool
    {
        $model = $this->find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }
}
