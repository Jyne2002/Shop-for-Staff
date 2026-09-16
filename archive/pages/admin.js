import { useEffect, useMemo, useState } from 'react';
import ShopLayout from '../components/ShopLayout';
import {
  getStoredValue,
  getTokens,
  generateToken,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateOrder
} from '../lib/shopData';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', staffPrice: '', sellingPrice: '', category: '' });

  useEffect(() => {
    setOrders(getStoredValue('akbar-orders', []));
    setTokens(getTokens());
    setProducts(getProducts());
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const received = orders.filter((order) => order.status === 'Received').length;
    const pending = orders.filter((order) => order.status !== 'Received').length;

    return {
      orderCount: orders.length,
      totalRevenue,
      received,
      pending
    };
  }, [orders]);

  return (
    <ShopLayout title="AKBAR Admin Dashboard" description="Operations, sales, and order management" active="dashboard">
      <section className="dashboard-layout">
        {!isAuthorized && (
          <div className="card">
            <h2>Admin access</h2>
            <p>Enter an admin token to access management features.</p>
            <input placeholder="Paste token here" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} />
            <div style={{ marginTop: 8 }}>
              <button onClick={() => {
                const found = tokens.find(t => t.token === tokenInput.trim());
                if (found) setIsAuthorized(true);
                else alert('Invalid token');
              }}>Unlock</button>
            </div>
          </div>
        )}
        <div className="dashboard-top">
          <article className="metric-card">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{metrics.orderCount}</span>
            <span className="metric-foot">All saved orders</span>
          </article>

          <article className="metric-card">
            <span className="metric-label">Revenue</span>
            <span className="metric-value">Rs. {metrics.totalRevenue.toFixed(2)}</span>
            <span className="metric-foot">Current order value</span>
          </article>

          <article className="metric-card">
            <span className="metric-label">Received</span>
            <span className="metric-value">{metrics.received}</span>
            <span className="metric-foot">Completed orders</span>
          </article>

          <article className="metric-card warning-card">
            <span className="metric-label">Pending</span>
            <span className="metric-value">{metrics.pending}</span>
            <span className="metric-foot">Awaiting delivery</span>
          </article>
        </div>

        <div className="admin-panels">
          <aside className="report-panel">
            <div className="panel-header">
              <h2>Recent orders</h2>
              <span className="subtle-text">Live</span>
            </div>
            <div className="activity-list">
              {orders.slice(0, 10).map((order) => (
                <div className="activity-row" key={`${order.orderNumber}-${order.date}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{order.customerName}</strong>
                    <div style={{ fontSize: 12 }}>{order.orderNumber} • {order.date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={order.status} onChange={(e) => {
                      const updated = updateOrder(order.orderNumber, { status: e.target.value, receivedAt: e.target.value === 'Received' ? new Date().toISOString() : '' });
                      if (updated) setOrders(getStoredValue('akbar-orders', []));
                    }}>
                      <option>Pending</option>
                      <option>Received</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}

              {!orders.length && <p className="empty-text">No orders available yet.</p>}
            </div>
          </aside>

          <aside className="report-panel">
            <div className="panel-header">
              <h2>Tokens</h2>
              <span className="subtle-text">Admin access</span>
            </div>
            <div>
              <button onClick={() => {
                const t = generateToken('admin');
                setTokens(getTokens());
                alert(`New token:\n${t.token}`);
              }}>Generate token</button>
              <ul className="token-list">
                {tokens.map((t) => (
                  <li key={t.id}><div><strong>{t.label || 'token'}</strong><div style={{ fontSize: 12 }}>{t.createdAt}</div></div><div style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.id}</div></li>
                ))}
              </ul>
            </div>
          </aside>

          <aside className="report-panel">
            <div className="panel-header">
              <h2>Products</h2>
              <span className="subtle-text">Manage catalog</span>
            </div>
            <div>
              <div style={{ display: 'grid', gap: 8 }}>
                {products.map((p) => (
                  <div key={p.id} className="cart-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: 12 }}>{p.category}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => {
                        const name = prompt('Name', p.name);
                        if (!name) return;
                        const staffPrice = prompt('Staff price', String(p.staffPrice));
                        const sellingPrice = prompt('Selling price', String(p.sellingPrice));
                        const updated = updateProduct(p.id, { name, staffPrice: Number(staffPrice), sellingPrice: Number(sellingPrice) });
                        if (updated) setProducts(getProducts());
                      }}>Edit</button>
                      <button onClick={() => {
                        if (!confirm('Delete product?')) return;
                        deleteProduct(p.id);
                        setProducts(getProducts());
                      }}>Delete</button>
                    </div>
                  </div>
                ))}

                <div className="card">
                  <h3>Add product</h3>
                  <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct(n => ({ ...n, name: e.target.value }))} />
                  <input placeholder="Staff price" value={newProduct.staffPrice} onChange={(e) => setNewProduct(n => ({ ...n, staffPrice: e.target.value }))} />
                  <input placeholder="Selling price" value={newProduct.sellingPrice} onChange={(e) => setNewProduct(n => ({ ...n, sellingPrice: e.target.value }))} />
                  <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct(n => ({ ...n, category: e.target.value }))} />
                  <button onClick={() => {
                    if (!newProduct.name) return alert('Provide name');
                    addProduct({ name: newProduct.name, staffPrice: Number(newProduct.staffPrice || 0), sellingPrice: Number(newProduct.sellingPrice || 0), category: newProduct.category });
                    setProducts(getProducts());
                    setNewProduct({ name: '', staffPrice: '', sellingPrice: '', category: '' });
                  }}>Add</button>
                </div>
              </div>
            </div>
          </aside>

          <aside className="report-panel highlight-panel">
            <div className="panel-header">
              <h2>Operations</h2>
              <span className="subtle-text">Today</span>
            </div>
            <div className="quick-list">
              <div className="quick-row">
                <span>Product catalog</span>
                <strong>AKBAR Tea</strong>
              </div>
              <div className="quick-row">
                <span>Customer access</span>
                <strong>Token-based</strong>
              </div>
              <div className="quick-row">
                <span>Order timeline</span>
                <strong>{metrics.orderCount}</strong>
              </div>
              <div className="quick-row">
                <span>Export</span>
                <strong>CSV ready</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </ShopLayout>
  );
}
