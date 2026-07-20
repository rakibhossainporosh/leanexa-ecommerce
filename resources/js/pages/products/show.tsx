import { Head, router, usePage, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { Heart, Ruler } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// [US, UK, EU, CM]
const SIZE_CHART: Record<'male' | 'female', string[][]> = {
    male: [
        ['7', '6.5', '40', '25'],
        ['7.5', '7', '40 2/3', '25.5'],
        ['8', '7.5', '41 1/3', '26'],
        ['8.5', '8', '42', '26.5'],
        ['9', '8.5', '42 2/3', '27'],
        ['9.5', '9', '43 1/3', '27.5'],
        ['10', '9.5', '44', '28'],
        ['10.5', '10', '44 2/3', '28.5'],
        ['11', '10.5', '45 1/3', '29'],
    ],
    female: [
        ['5', '3.5', '36', '22'],
        ['5.5', '4', '36 2/3', '22.5'],
        ['6', '4.5', '37 1/3', '23'],
        ['6.5', '5', '38', '23.5'],
        ['7', '5.5', '38 2/3', '24'],
        ['7.5', '6', '39 1/3', '24.5'],
        ['8', '6.5', '40', '25'],
        ['8.5', '7', '40 2/3', '25.5'],
        ['9', '7.5', '41 1/3', '26'],
    ],
};

export default function ProductShow({ product }: { product: any }) {
    const { formatPrice } = useCurrency();
    const sizeVariants = product.variants?.filter((v: any) => v.type === 'size' || v.name.toLowerCase().startsWith('size')) || [];
    const colorVariants = product.variants?.filter((v: any) => !sizeVariants.includes(v)) || [];
    const { general_settings } = usePage<any>().props;

    const [selectedColorId, setSelectedColorId] = useState<number | null>(
        colorVariants.length > 0 ? colorVariants[0].id : null
    );
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(
        sizeVariants.length > 0 ? sizeVariants[0].id : null
    );
    const [sizeChartGender, setSizeChartGender] = useState<'male' | 'female'>('male');
    const [activeTab, setActiveTab] = useState<'description' | 'shipping'>('description');
    const [descExpanded, setDescExpanded] = useState(false);
    const [descOverflows, setDescOverflows] = useState(false);
    const descRef = useRef<HTMLDivElement>(null);

    // Only show "See more" when the description is actually taller than the
    // collapsed height (160px) — short descriptions stay as-is.
    useEffect(() => {
        if (descRef.current) {
            setDescOverflows(descRef.current.scrollHeight > 170);
        }
    }, [product.description, activeTab]);
    const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null);

    const selectedColor = colorVariants.find((v: any) => v.id === selectedColorId);
    const selectedSize = sizeVariants.find((v: any) => v.id === selectedSizeId);
    
    const displayPrice = selectedSize?.price ? selectedSize.price : (selectedColor?.price ? selectedColor.price : product.price);
    
    let displayStock = product.stock;
    if (selectedColor && selectedSize) {
        displayStock = Math.min(selectedColor.stock, selectedSize.stock);
    } else if (selectedColor) {
        displayStock = selectedColor.stock;
    } else if (selectedSize) {
        displayStock = selectedSize.stock;
    }

    const defaultImage = selectedColor?.image_path || (product.images?.length > 0 ? product.images[0].image_path : null);
    
    const displayImage = userSelectedImage || defaultImage;

    const addToCart = () => {
        router.post('/cart/add', {
            product_id: product.id,
            color_variant_id: selectedColorId,
            size_variant_id: selectedSizeId,
            quantity: 1,
        }, { 
            preserveScroll: true,
            onSuccess: () => toast.success('Added to cart')
        });
    };

    const buyNow = () => {
        router.post('/cart/add', {
            product_id: product.id,
            color_variant_id: selectedColorId,
            size_variant_id: selectedSizeId,
            quantity: 1,
        }, { 
            onSuccess: () => router.visit('/checkout')
        });
    };

    const toggleWishlist = () => {
        const actionWord = isWishlisted ? 'Removed from' : 'Added to';
        router.post(`/wishlist/${product.id}`, {}, { 
            preserveScroll: true,
            onSuccess: () => toast.success(`${actionWord} wishlist`)
        });
    };

    const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        
        setZoomStyle({
            transformOrigin: `${x}% ${y}%`,
            transform: 'scale(2)'
        });
    };

    const handleMouseLeave = () => {
        setZoomStyle({
            transformOrigin: 'center center',
            transform: 'scale(1)'
        });
    };

    const { wishlistItems = [] } = usePage().props as any;
    const isWishlisted = (wishlistItems as number[]).includes(product.id);
    return (
        <CustomerLayout>
            <Head title={product.name} />
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild><Link href="/products">Products</Link></BreadcrumbLink>
                        </BreadcrumbItem>
                        {product.category && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild><Link href={`/products?category=${product.category.slug}`}>{product.category.name}</Link></BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{product.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                
                <div className="grid md:grid-cols-2 gap-10">
                    {/* Images Section */}
                    <div className="space-y-4">
                        <div 
                            className="aspect-square bg-muted rounded-xl overflow-hidden border flex items-center justify-center cursor-zoom-in"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            {displayImage ? (
                                <img 
                                    src={displayImage} 
                                    alt={selectedColor?.name || product.name}
                                    className="object-cover w-full h-full transition-transform duration-150 ease-out"
                                    style={zoomStyle}
                                />
                            ) : (
                                <span className="text-muted-foreground text-lg">No Image Available</span>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {product.variants?.some((v: any) => v.image_path) && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images?.length > 0 && (
                                    <button
                                        onClick={() => setUserSelectedImage(product.images[0].image_path)}
                                        className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                            displayImage === product.images[0].image_path ? 'border-primary' : 'border-transparent hover:border-primary/50'
                                        }`}
                                    >
                                        <img src={product.images[0].image_path} className="object-cover w-full h-full" alt="Main" />
                                    </button>
                                )}
                                {product.variants.filter((v: any) => v.image_path).map((variant: any) => (
                                    <button
                                        key={variant.id}
                                        onClick={() => {
                                            if (variant.type === 'size') {
                                                setSelectedSizeId(variant.id);
                                            } else {
                                                setSelectedColorId(variant.id);
                                                setUserSelectedImage(variant.image_path);
                                            }
                                        }}
                                        className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                            displayImage === variant.image_path ? 'border-primary' : 'border-transparent hover:border-primary/50'
                                        }`}
                                        title={variant.name}
                                    >
                                        <img src={variant.image_path} className="object-cover w-full h-full" alt={variant.name} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Details Section */}
                    <div className="flex flex-col">
                        <div className="mb-2">
                            {product.category && (
                                <span className="text-sm text-primary font-medium">{product.category.name}</span>
                            )}
                        </div>
                        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
                        <div className="flex items-center gap-3 mb-6">
                            {product.discount_price && product.discount_price > 0 && product.discount_price < displayPrice ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#00704A]">{formatPrice(product.discount_price)}</span>
                                    <span className="text-lg text-muted-foreground line-through">{formatPrice(displayPrice)}</span>
                                </div>
                            ) : (
                                <span className="text-2xl font-bold text-[#00704A]">{formatPrice(displayPrice)}</span>
                            )}
                            
                            {displayStock > 0 ? (
                                <Badge className="ml-2 bg-[#00704A] text-white hover:bg-[#00704A]/90 border-transparent">In Stock</Badge>
                            ) : (
                                <Badge variant="destructive" className="ml-2">Out of Stock</Badge>
                            )}
                        </div>

                        {product.short_description && (
                            <div
                                className="prose prose-sm max-w-none text-muted-foreground mb-6 -mt-2 dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: product.short_description }}
                            />
                        )}

                        {colorVariants.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium mb-3">Select Color</h3>
                                <div className="flex flex-wrap gap-2">
                                    {colorVariants.map((variant: any) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => {
                                                setSelectedColorId(variant.id);
                                                if (variant.image_path) {
                                                    setUserSelectedImage(variant.image_path);
                                                }
                                            }}
                                            className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                                                selectedColorId === variant.id 
                                                ? 'border-[#00704A] bg-[#00704A]/5 text-[#00704A] font-medium' 
                                                : 'border-border hover:border-[#00704A]/50'
                                            } ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={variant.stock <= 0}
                                        >
                                            {variant.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sizeVariants.length > 0 && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-medium">Select Size</h3>
                                    
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="text-sm text-muted-foreground underline hover:text-[#00704A] flex items-center gap-1 transition-colors">
                                                <Ruler className="w-3 h-3" /> Size Chart
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="grid max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl">
                                            <DialogHeader className="border-b bg-muted/30 px-4 py-4 pr-12 sm:px-6 sm:py-5">
                                                <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
                                                    <Ruler className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                                                    International Size Guide
                                                </DialogTitle>
                                                <p className="mt-1 text-left text-xs text-muted-foreground sm:text-sm">Find your perfect fit. Our sizes run true to standard international sizing.</p>
                                            </DialogHeader>

                                            <div className="overflow-y-auto p-4 sm:p-6">
                                                <div className="mb-4 flex justify-center sm:mb-6">
                                                    <div className="flex w-full rounded-lg bg-muted p-1 sm:inline-flex sm:w-auto">
                                                        <button
                                                            onClick={() => setSizeChartGender('male')}
                                                            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 sm:flex-none sm:px-8 ${sizeChartGender === 'male' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                                                        >
                                                            Men's Sizes
                                                        </button>
                                                        <button
                                                            onClick={() => setSizeChartGender('female')}
                                                            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 sm:flex-none sm:px-8 ${sizeChartGender === 'female' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                                                        >
                                                            Women's Sizes
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
                                                    <table className="w-full text-center text-xs sm:text-sm">
                                                        <thead className="border-b border-border/50 bg-muted/50">
                                                            <tr>
                                                                <th className="bg-muted/80 p-2.5 font-semibold text-foreground sm:p-4">US</th>
                                                                <th className="p-2.5 font-semibold text-muted-foreground sm:p-4">UK</th>
                                                                <th className="p-2.5 font-semibold text-muted-foreground sm:p-4">EU</th>
                                                                <th className="p-2.5 font-semibold text-muted-foreground sm:p-4">CM</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/50">
                                                            {SIZE_CHART[sizeChartGender].map(([us, uk, eu, cm], i) => (
                                                                <tr key={us} className={`transition-colors hover:bg-muted/30 ${i % 2 === 1 ? 'bg-muted/5' : ''}`}>
                                                                    <td className={`border-r border-border/20 p-2.5 font-bold text-foreground sm:p-3.5 ${i % 2 === 1 ? 'bg-muted/20' : 'bg-muted/10'}`}>{us}</td>
                                                                    <td className="p-2.5 sm:p-3.5">{uk}</td>
                                                                    <td className="p-2.5 whitespace-nowrap sm:p-3.5">{eu}</td>
                                                                    <td className="p-2.5 text-muted-foreground sm:p-3.5">{cm}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="mt-4 flex items-start gap-3 rounded-lg bg-primary/5 p-3 text-sm text-primary sm:mt-5 sm:p-4">
                                                    <div className="mt-0.5 shrink-0 rounded-full bg-primary/20 p-1.5">
                                                        <Ruler className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <span className="mb-1 block font-semibold">How to Measure</span>
                                                        <span className="text-xs leading-relaxed text-muted-foreground sm:text-sm">For the best fit, measure your foot from the heel to the tip of your longest toe (CM). Compare your measurement to our size guide above.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {sizeVariants.map((variant: any) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => {
                                                setSelectedSizeId(variant.id);
                                            }}
                                            className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                                                selectedSizeId === variant.id 
                                                ? 'border-[#00704A] bg-[#00704A]/5 text-[#00704A] font-medium' 
                                                : 'border-border hover:border-[#00704A]/50'
                                            } ${variant.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={variant.stock <= 0}
                                        >
                                            {variant.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-6 mb-8">
                            <div className="flex border-b border-border">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                                        activeTab === 'description' 
                                            ? 'text-[#00704A]' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Product Description
                                    {activeTab === 'description' && (
                                        <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#00704A] rounded-t" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('shipping')}
                                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                                        activeTab === 'shipping' 
                                            ? 'text-[#00704A]' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Shipping Details
                                    {activeTab === 'shipping' && (
                                        <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#00704A] rounded-t" />
                                    )}
                                </button>
                            </div>
                            
                            <div className="pt-5 min-h-[100px]">
                                {activeTab === 'description' ? (
                                    product.description ? (
                                        <div>
                                            <div className="relative">
                                                <div
                                                    ref={descRef}
                                                    className={`prose prose-sm sm:prose-base max-w-none text-muted-foreground dark:prose-invert overflow-hidden transition-[max-height] duration-300 ${
                                                        !descExpanded && descOverflows ? 'max-h-[160px]' : 'max-h-none'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                                />
                                                {!descExpanded && descOverflows && (
                                                    <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-background to-transparent" />
                                                )}
                                            </div>
                                            {descOverflows && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDescExpanded((v) => !v)}
                                                    className="mt-2 text-sm font-semibold text-[#00704A] hover:underline"
                                                >
                                                    {descExpanded ? 'See less' : 'See more'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground text-base/relaxed">No description provided.</div>
                                    )
                                ) : (
                                    <div className="text-muted-foreground text-base/relaxed whitespace-pre-wrap">
                                        {general_settings?.shipping_details || 'Shipping details will be updated soon.'}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                            <Separator />
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button size="lg" className="w-full sm:w-auto px-8 bg-[#00704A] text-white hover:bg-[#00704A]/90" disabled={displayStock <= 0} onClick={buyNow}>
                                    Buy Now
                                </Button>
                                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-shop text-shop hover:bg-shop hover:text-white" disabled={displayStock <= 0} onClick={addToCart}>
                                    Add to Cart
                                </Button>
                                <Button size="lg" variant="outline" className={`px-4 ${isWishlisted ? 'text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600' : ''}`} onClick={toggleWishlist}>
                                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </Button>
                            </div>
                        </div>
                        
                        {product.tags?.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-2">
                                {product.tags.map((tag: any) => (
                                    <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
