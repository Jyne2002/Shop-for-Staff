import { useEffect, useState } from 'react';
import ShopLayout from '../components/ShopLayout';
import { downloadCsv, escapeCsv, getStoredValue } from '../lib/shopData';

export default function GeneratePage() {
  const [tokenCount, setTokenCount] = useState(10);
  const [tokens, setTokens] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = getStoredValue('akbar-tokens', ['AKBAR-STAFF-ACCESS']);
    setTokens(Array.isArray(stored) ? stored : ['AKBAR-STAFF-ACCESS']);
  }, []);

  const generateTokens = () => {
    const generated = [];
    for (let i = 0; i < Number(tokenCount || 1); i += 1) {
      generated.push(`AKBAR-${Date.now().toString().slice(-6)}-${String(i + 1).padStart(2, '0')}`);
    }
    const nextTokens = [...tokens, ...generated];
    setTokens(nextTokens);
    window.localStorage.setItem('akbar-tokens', JSON.stringify(nextTokens));
    setMessage(`${generated.length} token(s) created.`);
  };

  const exportTokens = () => {
    const rows = [['Token']];
    tokens.forEach(token => rows.push([token]));
    downloadCsv('tokens.csv', rows.map(row => row.map(escapeCsv)));
  };

  return (
    <ShopLayout title="Token Generator" description="Create temporary access codes for staff and customers" active="tokens">
      <div className="card">
        <div className="toolbar">
          <label htmlFor="token-count">How many tokens?</label>
          <input id="token-count" type="number" min="1" max="50" value={tokenCount} onChange={(event) => setTokenCount(Number(event.target.value))} />
          <button onClick={generateTokens}>Generate tokens</button>
          <button className="secondary" onClick={exportTokens}>Export tokens</button>
        </div>

        <div id="token-msg" className="message" aria-live="polite">{message}</div>

        <div className="token-list-wrap">
          <h2>Available tokens</h2>
          <ul className="token-list">
            {tokens.map((token) => (
              <li key={token}>
                <span>{token}</span>
                <button className="secondary" onClick={() => navigator.clipboard.writeText(token)}>Copy</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ShopLayout>
  );
}
