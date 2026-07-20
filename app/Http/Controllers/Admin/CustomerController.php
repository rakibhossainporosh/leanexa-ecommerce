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
        return Inertia::render('admin/customers/index');
    }

    /**
     * Server-side DataTables feed (yajra/laravel-datatables): handles
     * search, ordering and pagination for the customers table.
     */
    public function data(Request $request)
    {
        $query = Customer::query()->select(['id', 'name', 'email', 'created_at']);

        return \Yajra\DataTables\Facades\DataTables::eloquent($query)->toJson();
    }

    public function show(Customer $customer)
    {
        $customer->load(['orders' => fn ($q) => $q->latest()]);

        return Inertia::render('admin/customers/show', [
            'customer' => $customer,
            'stats' => [
                'orders_count' => $customer->orders->count(),
                'total_spent' => (float) $customer->orders->where('payment_status', 'paid')->sum('total_amount'),
            ],
        ]);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('admin.customers.index')->with('success', 'Customer deleted successfully.');
    }
}
