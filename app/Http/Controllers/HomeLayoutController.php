<?php

namespace App\Http\Controllers;

use App\Services\HomeLayoutService;

class HomeLayoutController extends Controller
{
    public function __construct(
        protected HomeLayoutService $homeLayoutService
    ) {}

    /**
     * Public, read-only homepage layout (active sections + resolved products).
     */
    public function index()
    {
        return response()->json([
            'sections' => $this->homeLayoutService->resolve(),
        ]);
    }
}
