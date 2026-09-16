import Link from 'next/link';
import ShopLayout from '../components/ShopLayout';

export default function Home() {
  return (
    <ShopLayout title="AKBAR Tea" description="Staff shop" active="products">
      <div style={{ padding: 20 }}>
        <h2>Welcome to AKBAR staff shop</h2>
        <p><Link href="/products">View products</Link></p>
        <p><Link href="/admin">Admin dashboard</Link></p>
      </div>
    </ShopLayout>
  );
}
