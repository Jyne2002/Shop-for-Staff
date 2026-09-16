import { useEffect, useMemo, useState } from 'react';
import ShopLayout from '../components/ShopLayout';
import { getProducts, saveOrders, downloadCsv, escapeCsv, getOrderNumber, getStoredValue } from '../lib/shopData';

export default function ProductsPage() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    employeeName: '',
    customerName: '',
    department: '',
    designation: '',
    epfNumber: '',
    contactNumber: '',
    orderNumber: '',
    orderDate: '',
    orderTime: '',
    paymentMethod: 'Cash',
    givenAmount: '',
    balanceAmount: ''
  });
  const [message, setMessage] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    setOrders(getStoredValue('akbar-orders', []));
    setProducts(getProducts());
    setForm((current) => ({ ...current, orderNumber: getOrderNumber(getStoredValue('akbar-orders', [])) }));
    const today = new Date().toISOString().slice(0, 10);
    setForm((current) => ({ ...current, orderDate: current.orderDate || today }));
  }, []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.staffPrice * item.qty, 0), [cart]);

  const addToCart = (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setCart((current) => {
      const existing = current.find((item) => item.id === productId);
      if (existing) {
        return current.map((item) => (item.id === productId ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...current, { ...product, qty: 1 }];
    });
  };

  const updateQty = (productId, action) => {
    setCart((current) => {
      const next = current
        .map((item) => {
          if (item.id !== productId) return item;
          const qty = action === 'increase' ? item.qty + 1 : item.qty - 1;
          return qty > 0 ? { ...item, qty } : null;
        })
        .filter(Boolean);
      return next;
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePaymentMethodChange = (event) => {
    const paymentMethod = event.target.value;
    setForm((current) => ({ ...current, paymentMethod, givenAmount: paymentMethod === 'Cash' ? current.givenAmount : '', balanceAmount: '' }));
  };

  const updateBalance = (givenAmount) => {
    const nextBalance = Number(givenAmount || 0) - total;
    setForm((current) => ({ ...current, givenAmount, balanceAmount: Number.isFinite(nextBalance) ? nextBalance.toFixed(2) : '' }));
  };

  const submitOrder = (event) => {
    event.preventDefault();
    if (!cart.length) {
      setMessage('Please add at least one product before saving the order.');
      return;
    }

    const paymentMethod = form.paymentMethod;
    const givenAmount = Number(form.givenAmount || 0);
    const balance = givenAmount - total;

    if (paymentMethod === 'Cash' && (!form.givenAmount || givenAmount < total)) {
      setMessage('Cash payment requires a given amount equal to or greater than the total.');
      return;
    }

    const order = {
      employeeName: form.employeeName.trim(),
      customerName: form.customerName.trim(),
      department: form.department.trim(),
      designation: form.designation.trim(),
      epfNumber: form.epfNumber.trim(),
      mobileNumber: form.contactNumber.trim(),
      paymentMethod,
      givenAmount: paymentMethod === 'Cash' ? givenAmount.toFixed(2) : '',
      balance: paymentMethod === 'Cash' ? balance.toFixed(2) : '',
      orderNumber: form.orderNumber.trim() || getOrderNumber(orders),
      orderDate: form.orderDate,
      orderTime: form.orderTime,
      items: cart.map((item) => ({ name: item.name, qty: item.qty, staffPrice: item.staffPrice })),
      total: total.toFixed(2),
      status: 'Pending',
      receivedAt: '',
      date: new Date().toLocaleString()
    };

    const nextOrders = [order, ...orders];
    setOrders(nextOrders);
    window.localStorage.setItem('akbar-orders', JSON.stringify(nextOrders));
    setReceipt(order);
    setShowReceipt(true);
    setMessage('Order saved. Receipt is ready to print.');
    setForm((current) => ({ ...current, orderNumber: getOrderNumber(nextOrders), givenAmount: '', balanceAmount: '' }));
    setCart([]);
  };

  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`<html><head><title>Receipt</title></head><body>${document.getElementById('receipt-content')?.innerHTML || ''}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <ShopLayout title="AKBAR Tea Products" description="Staff pricing and selling price view" active="products">
      <div className="products-layout">
        <section>
          <h2>Product catalog</h2>
          <div className="product-grid">
            {products.map((product) => {
              const icons = ['☕', '☕', '🎁', '📦'];
              return (
                <div className="product-card" key={product.id}>
                  <div className="product-card-image">{icons[product.id - 1] || '☕'}</div>
                  <div className="product-card-content">
                    <h3>{product.name}</h3>
                    <p><strong>Category:</strong> {product.category}</p>
                    <div className="price-row"><span>Staff price</span><strong>Rs. {product.staffPrice}</strong></div>
                    <div className="price-row"><span>Customer price</span><strong>Rs. {product.sellingPrice}</strong></div>
                    <p className="price-note">💰 Staff benefit: Rs. {product.sellingPrice - product.staffPrice}</p>
                    <button style={{ marginTop: 'auto' }} onClick={() => addToCart(product.id)}>+ Add to order</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="cart-card">
          <h2>Order summary</h2>
          <div className="cart-items">
            {!cart.length ? (
              <p>No products selected yet.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <strong>{item.name}</strong>
                    <div className="price-row"><span>Qty</span><span>{item.qty}</span></div>
                    <div className="price-row"><span>Staff price</span><span>Rs. {item.staffPrice}</span></div>
                    <div className="price-row"><span>Line total</span><span>Rs. {item.staffPrice * item.qty}</span></div>
                    <div className="qty-row">
                      <button className="qty-btn" onClick={() => updateQty(item.id, 'decrease')}>-</button>
                      <span>{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 'increase')}>+</button>
                    </div>
                  </div>
                ))}
                <div className="cart-item">
                  <strong>Order total</strong>
                  <div className="price-row"><span>Amount</span><strong>Rs. {total}</strong></div>
                </div>
              </>
            )}
          </div>

          <hr />

          <form onSubmit={submitOrder}>
            <label htmlFor="employee-name">Employee name</label>
            <input id="employee-name" name="employeeName" required value={form.employeeName} onChange={handleInputChange} />

            <label htmlFor="customer-name">Customer name</label>
            <input id="customer-name" name="customerName" required value={form.customerName} onChange={handleInputChange} />

            <label htmlFor="department">Department</label>
            <input id="department" name="department" required value={form.department} onChange={handleInputChange} />

            <label htmlFor="designation">Designation</label>
            <input id="designation" name="designation" required value={form.designation} onChange={handleInputChange} />

            <label htmlFor="epf-number">EPF number</label>
            <input id="epf-number" name="epfNumber" required value={form.epfNumber} onChange={handleInputChange} />

            <label htmlFor="contact-number">Mobile number</label>
            <input id="contact-number" name="contactNumber" required value={form.contactNumber} onChange={handleInputChange} />

            <label htmlFor="order-number">Order number</label>
            <input id="order-number" name="orderNumber" readOnly required value={form.orderNumber} onChange={handleInputChange} />

            <label htmlFor="order-date">Order date</label>
            <input id="order-date" name="orderDate" type="date" required value={form.orderDate} onChange={handleInputChange} />

            <label htmlFor="order-time">Order need time</label>
            <input id="order-time" name="orderTime" type="time" required value={form.orderTime} onChange={handleInputChange} />

            <label>Payment method</label>
            <div className="payment-options">
              <label><input type="radio" name="paymentMethod" value="Cash" checked={form.paymentMethod === 'Cash'} onChange={handlePaymentMethodChange} /> Cash</label>
              <label><input type="radio" name="paymentMethod" value="Card" checked={form.paymentMethod === 'Card'} onChange={handlePaymentMethodChange} /> Card</label>
              <label><input type="radio" name="paymentMethod" value="Bank transfer" checked={form.paymentMethod === 'Bank transfer'} onChange={handlePaymentMethodChange} /> Bank transfer</label>
              <label><input type="radio" name="paymentMethod" value="Other" checked={form.paymentMethod === 'Other'} onChange={handlePaymentMethodChange} /> Other</label>
            </div>

            {form.paymentMethod === 'Cash' && (
              <div className="cash-fields" id="cash-fields">
                <label htmlFor="given-amount">Given amount</label>
                <input id="given-amount" name="givenAmount" type="number" step="0.01" value={form.givenAmount} onChange={(event) => updateBalance(event.target.value)} />

                <label htmlFor="balance-amount">Balance</label>
                <input id="balance-amount" name="balanceAmount" readOnly value={form.balanceAmount} />
              </div>
            )}

            <button type="submit">Save order and export CSV</button>
          </form>

          <div id="order-msg" className="message" aria-live="polite">{message}</div>
        </aside>
      </div>

      {showReceipt && receipt && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div id="receipt-content">
              <div className="receipt-box">
                <h3>AKBAR Tea Receipt</h3>
                <p><strong>Order:</strong> {receipt.orderNumber}</p>
                <p><strong>Customer:</strong> {receipt.customerName}</p>
                <p><strong>Employee:</strong> {receipt.employeeName}</p>
                <p><strong>Department:</strong> {receipt.department}</p>
                <p><strong>Designation:</strong> {receipt.designation}</p>
                <p><strong>Mobile:</strong> {receipt.mobileNumber}</p>
                <p><strong>Payment:</strong> {receipt.paymentMethod}</p>
                <p><strong>Date:</strong> {receipt.orderDate} {receipt.orderTime}</p>
                <hr />
                <p><strong>Items:</strong></p>
                <ul>{receipt.items.map((item) => <li key={`${item.name}-${item.qty}`}>{item.name} x{item.qty}</li>)}</ul>
                <p><strong>Total:</strong> Rs. {receipt.total}</p>
                <p><strong>Status:</strong> {receipt.status || 'Pending'}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="secondary" onClick={printReceipt}>Print receipt</button>
              <button onClick={() => setShowReceipt(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </ShopLayout>
  );
}
