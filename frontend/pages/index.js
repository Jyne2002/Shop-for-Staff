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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ShopLayout from '../components/ShopLayout';
import { getStoredValue } from '../lib/shopData';

export default function HomePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const tokens = getStoredValue('akbar-tokens', ['AKBAR-STAFF-ACCESS']);
    if (Array.isArray(tokens) && !tokens.includes('AKBAR-STAFF-ACCESS')) {
      tokens.unshift('AKBAR-STAFF-ACCESS');
      window.localStorage.setItem('akbar-tokens', JSON.stringify(tokens));
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const tokens = getStoredValue('akbar-tokens', ['AKBAR-STAFF-ACCESS']);
    if (Array.isArray(tokens) && tokens.includes(token.trim())) {
      setMessage('Access granted. You can now continue to products.');
      router.push('/products');
    } else {
      setMessage('Invalid token. Please use a valid token from the token generator.');
    }
  };

  return (
    <ShopLayout title="AKBAR Staff Purchase Portal" description="Simple staff ordering for AKBAR tea products" active="access">
      <div className="card">
        <h2>Enter your access token</h2>
        <p>Only staff with a valid token can continue to the ordering page.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="token-input">Token number</label>
          <input id="token-input" name="token" placeholder="Enter token" required value={token} onChange={(event) => setToken(event.target.value)} />
          <button type="submit">Enter portal</button>
        </form>

        <div id="access-msg" className="message" aria-live="polite">{message}</div>

        <div className="hint-box">
          <h3>Quick notes</h3>
          <ul>
            <li>Use a token created on the Tokens page.</li>
            <li>Demo token: AKBAR-STAFF-ACCESS</li>
            <li>Orders can be downloaded as CSV for record keeping.</li>
          </ul>
        </div>
      </div>
    </ShopLayout>
  );
}
