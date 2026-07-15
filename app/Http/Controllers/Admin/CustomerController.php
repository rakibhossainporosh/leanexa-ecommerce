<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::latest()->paginate(15);

        return Inertia::render('admin/customers/index', [
            'customers' => $customers
        ]);
    }
}
