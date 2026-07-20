import ProductForm from './product-form';

export default function ProductEdit(props: { product: any; categories: any[]; brands: any[]; tags: any[] }) {
    return <ProductForm {...props} />;
}
