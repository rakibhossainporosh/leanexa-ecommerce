@extends('emails.layout')

@section('title', 'Welcome')
@section('preheader', 'Your account is ready — here are your login details.')

@section('content')
    <h2>Welcome, {{ $customer->name }}! 🎉</h2>
    <p>Thank you for your order. We've created an account for you so you can track your orders and check out faster next time.</p>

    <div class="panel">
        <table class="data-table">
            <tr>
                <td class="label">Email</td>
                <td class="value">{{ $customer->email }}</td>
            </tr>
            <tr>
                <td class="label">Temporary password</td>
                <td class="value">{{ $password }}</td>
            </tr>
        </table>
    </div>

    <p>For your security, please <strong>change this password</strong> after you log in.</p>

    <div class="btn-wrap">
        <a href="{{ route('login') }}" class="btn">Log in to your account</a>
    </div>

    <p class="muted">If you have any questions, just reply to this email — we're happy to help.</p>
@endsection
