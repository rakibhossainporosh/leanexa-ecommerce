<?php

namespace App\DTOs;

class CartItemDTO extends BaseDTO
{
    public int $product_id;
    public int $quantity;
    public ?string $product_name = null;
    public ?float $price = null;
    public ?string $image_url = null;
}
