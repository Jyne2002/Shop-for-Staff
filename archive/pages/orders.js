import { useEffect, useMemo, useState } from 'react';
import ShopLayout from '../components/ShopLayout';
import { downloadCsv, escapeCsv, getStoredValue } from '../lib/shopData';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setOrders(getStoredValue('akbar-orders', []));
  }, []);

  const visibleOrders = useMemo(() => {
    const searchQuery = query.trim().toLowerCase();
    if (!searchQuery) return orders;

    return orders.filter((order) => [order.customerName, order.epfNumber, order.orderNumber, order.employeeName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchQuery)));
  }, [orders, query]);

  const exportOrdersSheet = () => {
    const rows = [[
      'Order Number',
      'Customer Name',
      'Department',
      'Designation',
      'Mobile Number',
      'Payment Method',
      'Given Amount',
      'Balance',
      'Order Date',
      'Order Need Time',
      'Employee Name',
      'EPF Number',
      'Items',
      'Total',
      'Status',
      'Received Time'
    ]];

    visibleOrders.forEach((order) => {
      rows.push([
        order.orderNumber,
        order.customerName,
        order.department,
        order.designation,
        order.mobileNumber,
        order.paymentMethod,
        order.givenAmount ?? '',
        order.balance ?? '',
        order.orderDate,
        order.orderTime,
        order.employeeName,
        order.epfNumber,
        order.items.map((item) => `${item.name} x${item.qty}`).join(' | '),
        order.total,
        order.status || 'Pending',
        order.receivedAt || ''
      ]);
    });

    downloadCsv('akbar-orders.csv', rows.map((row) => row.map(escapeCsv)));
  };

  const toggleOrderStatus = (orderNumber) => {
    const next = orders.map((order) => {
      if (order.orderNumber !== orderNumber) return order;
      if (order.status === 'Received') {
        return { ...order, status: 'Pending', receivedAt: '' };
      }
      return { ...order, status: 'Received', receivedAt: new Date().toLocaleString() };
    });
    setOrders(next);
    window.localStorage.setItem('akbar-orders', JSON.stringify(next));
  };

  const clearOrders = () => {
    setOrders([]);
    window.localStorage.setItem('akbar-orders', JSON.stringify([]));
    setMessage('Order history cleared.');
  };

  return (
    <ShopLayout title="Order history" description="Saved orders and export view" active="orders">
      <div className="card">
        <div className="toolbar">
          <input id="order-search" type="text" placeholder="Search by customer name, EPF, or order number" value={query} onChange={(event) => setQuery(event.target.value)} />
          <button className="secondary" onClick={exportOrdersSheet}>Export all orders</button>
          <button onClick={clearOrders}>Clear history</button>
        </div>

        <div id="orders-msg" className="message" aria-live="polite">{message}</div>
        <div className="orders-list">
          {!visibleOrders.length ? (
            <p>No matching orders found.</p>
          ) : (
            visibleOrders.map((order) => (
              <div className="order-box" key={order.orderNumber}>
                <p><strong>{order.customerName}</strong> | Order: {order.orderNumber}</p>
                <p>Employee: {order.employeeName} | Department: {order.department}</p>
                <p>Designation: {order.designation} | Mobile: {order.mobileNumber}</p>
                <p>Payment: {order.paymentMethod} | Date: {order.orderDate} | Time: {order.orderTime}</p>
                <p>Items: {order.items.map((item) => `${item.name} x${item.qty}`).join(', ')}</p>
                <p>Total: Rs. {order.total}</p>
                <p><span className="status-pill">{order.status || 'Pending'}</span></p>
                <p>Received time: {order.receivedAt || 'Not received yet'}</p>
                <button className="secondary" onClick={() => toggleOrderStatus(order.orderNumber)}>{order.status === 'Received' ? 'Mark Pending' : 'Mark Received'}</button>
              </div>
            ))
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
