import ProductForm from './product-form';

export default function ProductCreate(props: { categories: any[]; brands: any[]; tags: any[] }) {
    return <ProductForm {...props} />;
}
