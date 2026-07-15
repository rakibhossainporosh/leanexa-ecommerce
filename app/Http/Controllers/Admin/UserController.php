<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->input('search', ''));

        $users = User::query()
            ->with('roles:id,name')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name,
                'created_at' => $user->created_at?->toISOString(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => Role::where('guard_name', 'admin')->orderBy('name')->pluck('name'),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', Rule::exists('roles', 'name')->where('guard_name', 'admin')],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'], // hashed via cast
        ]);

        // Admin-created accounts are trusted; mark verified without mass assignment
        // (email_verified_at is intentionally not in the model's $fillable).
        $user->forceFill(['email_verified_at' => now()])->save();

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'Admin user created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', Rule::exists('roles', 'name')->where('guard_name', 'admin')],
        ]);

        // Never let the only Admin drop their own role — it would lock everyone
        // out of the admin panel with no way back in.
        $isDemotingAnAdmin = $user->hasRole('Admin') && $validated['role'] !== 'Admin';
        if ($isDemotingAnAdmin && User::role('Admin')->count() <= 1) {
            return back()->with('error', 'You cannot demote the last remaining admin.');
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'Admin user updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $adminCount = User::count();
        if ($adminCount <= 1) {
            return back()->with('error', 'You cannot delete the last remaining admin.');
        }

        $user->delete();

        return back()->with('success', 'Admin user deleted successfully.');
    }
}
