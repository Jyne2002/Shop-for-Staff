export const PRODUCTS = [
  { id: 1, name: 'AKBAR Tea 250g', staffPrice: 950, sellingPrice: 1100, category: 'Tea' },
  { id: 2, name: 'AKBAR Tea 500g', staffPrice: 1800, sellingPrice: 2100, category: 'Tea' },
  { id: 3, name: 'AKBAR Tea Gift Pack', staffPrice: 2600, sellingPrice: 3000, category: 'Gift' },
  { id: 4, name: 'AKBAR Classic Pack', staffPrice: 3200, sellingPrice: 3600, category: 'Pack' }
];

export function escapeCsv(value) {
  const stringValue = String(value ?? '');
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

export function downloadCsv(filename, rows) {
  const csvContent = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getOrderNumber(orders) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const todayOrders = orders.filter(order => order.orderNumber && order.orderNumber.includes(`AKBAR-${today}-`)).length + 1;
  return `AKBAR-${today}-${String(todayOrders).padStart(3, '0')}`;
}

export function getStoredValue(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

export function saveStoredValue(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

export function getTokens() {
  return getStoredValue('akbar-tokens', []);
}

export function generateToken(label = '') {
  const tokens = getTokens();
  const raw = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const token = { id: raw.slice(0, 12), token: raw, label, createdAt: new Date().toISOString() };
  tokens.unshift(token);
  saveStoredValue('akbar-tokens', tokens);
  return token;
}

const PRODUCTS_KEY = 'akbar-products';

export function getProducts() {
  const stored = getStoredValue(PRODUCTS_KEY, null);
  if (stored) return stored;
  saveStoredValue(PRODUCTS_KEY, PRODUCTS);
  return PRODUCTS.slice();
}

export function saveProducts(products) {
  saveStoredValue(PRODUCTS_KEY, products);
}

export function addProduct(product) {
  const products = getProducts();
  const nextId = products.reduce((m, p) => Math.max(m, Number(p.id || 0)), 0) + 1;
  const item = { id: nextId, ...product };
  products.push(item);
  saveProducts(products);
  return item;
}

export function updateProduct(id, patch) {
  const products = getProducts();
  const idx = products.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...patch };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id) {
  let products = getProducts();
  products = products.filter(p => String(p.id) !== String(id));
  saveProducts(products);
  return products;
}

export function saveOrders(orders) {
  saveStoredValue('akbar-orders', orders);
}

export function updateOrder(orderNumber, patch) {
  const orders = getStoredValue('akbar-orders', []);
  const idx = orders.findIndex(o => o.orderNumber === orderNumber);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...patch };
  saveStoredValue('akbar-orders', orders);
  return orders[idx];
}
