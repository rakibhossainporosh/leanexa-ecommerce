import { Head, Link, router } from '@inertiajs/react';
import { toast } from "sonner";
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    discount_price: string | null;
    images: { id: number; image_path: string; is_primary: boolean }[];
}

interface WishlistIndexProps {
    wishlistItems: Product[];
}

export default function WishlistIndex({ wishlistItems }: WishlistIndexProps) {
    const { formatPrice } = useCurrency();
    const removeFromWishlist = (productId: number) => {
        router.post(`/wishlist/${productId}`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Removed from wishlist')
        });
    };

    const addToCart = (productId: number) => {
        router.post('/cart/add', {
            product_id: productId,
            quantity: 1,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Added to cart')
        });
    };

    return (
        <CustomerLayout>
            <Head title="My Wishlist" />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">My Wishlist</h1>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="h-12 w-12 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Looks like you haven't added any products to your wishlist yet. Explore our shop to find your favorite items.
                        </p>
                        <Link href={'/products'}>
                            <Button size="lg" className="px-8">
                                Explore Products
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((product) => {
                            const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
                            const imageUrl = primaryImage ? `/storage/${primaryImage.image_path}` : 'https://placehold.co/400x400?text=No+Image';

                            return (
                                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="relative aspect-square">
                                        <img
                                            src={imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="absolute top-4 right-4 bg-white/90 hover:bg-red-50 dark:bg-gray-800/90 dark:hover:bg-red-900/20 p-2 rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <Link href={`/products/${product.slug}`}>
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        
                                        <div className="flex items-center gap-2 mb-4">
                                            {product.discount_price ? (
                                                <>
                                                    <span className="text-xl font-bold text-red-600">{formatPrice(product.discount_price)}</span>
                                                    <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                                                </>
                                            ) : (
                                                <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                                            )}
                                        </div>

                                        <Button 
                                            onClick={() => addToCart(product.id)}
                                            className="w-full flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
