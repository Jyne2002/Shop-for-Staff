import ShopLayout from '../components/ShopLayout';
import { PRODUCTS } from '../lib/shopData';

export default function CustomerPage() {
  return (
    <ShopLayout title="AKBAR Customer Platform" description="Product catalog and customer ordering portal" active="customer">
      <section className="customer-layout">
        <section className="customer-hero">
          <div>
            <span className="eyebrow">AKBAR Tea Customer Portal</span>
            <h2>Premium tea for every order</h2>
            <p className="lead-text">Browse our trusted tea products and place staff-approved customer orders through the AKBAR ordering system.</p>
            <div className="hero-actions">
              <a href="/products" className="btn btn-primary">Place an order</a>
              <a href="/orders" className="btn btn-secondary">Order history</a>
            </div>
          </div>
          <aside className="hero-panel">
            <span className="panel-kicker">Today’s availability</span>
            <strong>{PRODUCTS.length}</strong>
            <span className="meta-text">Tea products ready</span>
          </aside>
        </section>

        <section className="customer-grid">
          {PRODUCTS.map((product) => (
            <article className="customer-product-card" key={product.id}>
              <div className="customer-product-top">
                <span className="product-icon">☕</span>
                <span className="product-category">{product.category}</span>
              </div>
              <h3>{product.name}</h3>
              <div className="price-row">
                <span>Customer price</span>
                <strong>Rs. {product.sellingPrice}</strong>
              </div>
              <div className="product-footer">
                <span className="product-status">Available</span>
                <a className="text-link" href="/products">Order now</a>
              </div>
            </article>
          ))}
        </section>
      </section>
    </ShopLayout>
  );
}
