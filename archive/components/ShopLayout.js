import Link from 'next/link';
import Logo from './Logo';

export default function ShopLayout({ title, description, active, children }) {
  return (
    <>
      <header className="topbar">
        <div className="logo-section">
          <Logo />
        </div>
        <div className="header-content">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <nav>
          <Link href="/admin" className={active === 'dashboard' ? 'nav-active' : ''}>Dashboard</Link>
          <Link href="/" className={active === 'access' ? 'nav-active' : ''}>Access</Link>
          <Link href="/customer" className={active === 'customer' ? 'nav-active' : ''}>Customer</Link>
          <Link href="/generate" className={active === 'tokens' ? 'nav-active' : ''}>Tokens</Link>
          <Link href="/products" className={active === 'products' ? 'nav-active' : ''}>Products</Link>
          <Link href="/orders" className={active === 'orders' ? 'nav-active' : ''}>Orders</Link>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
