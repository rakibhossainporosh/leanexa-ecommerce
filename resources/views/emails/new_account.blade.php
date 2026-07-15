<!DOCTYPE html>
<html>
<head>
    <title>Welcome to our shop!</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Hello, {{ $customer->name }}!</h2>
        <p>Thank you for placing your order with us. We have created an account for you so you can easily track your orders and shop faster next time.</p>
        
        <p>Your login credentials are:</p>
        <ul>
            <li><strong>Email:</strong> {{ $customer->email }}</li>
            <li><strong>Password:</strong> {{ $password }}</li>
        </ul>
        
        <p>We highly recommend changing this password after you log in.</p>
        
        <p>
            <a href="{{ route('login') }}" class="btn">Login to your account</a>
        </p>

        <p>If you have any questions, please feel free to reply to this email.</p>

        <p>Thanks,<br>
        {{ config('app.name') }}</p>
    </div>
</body>
</html>
