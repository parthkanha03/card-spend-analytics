import { useState, useEffect } from 'react';
import { api } from '../services/api';
import PieChart from './PieChart';
import VisaCard from './VisaCard';

const CAT_ICONS = {
  GROCERIES: '🛒', DINING: '🍽️', TRAVEL: '✈️', SHOPPING: '🛍️', UTILITIES: '💡',
};

function UtilBar({ creditLimit, availableBalance }) {
  const spent = creditLimit - availableBalance;
  const pct   = creditLimit > 0 ? (spent / creditLimit) * 100 : 0;
  const cls   = pct < 50 ? 'util-fill util-low' : pct < 80 ? 'util-fill util-mid' : 'util-fill util-high';
  return (
    <div className="util-cell">
      <div className="util-bar">
        <div className={cls} style={{ width: `${Math.min(pct, 100).toFixed(1)}%` }} />
      </div>
      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

function RingMeter({ creditLimit, availableBalance }) {
  const spent  = creditLimit - availableBalance;
  const pct    = creditLimit > 0 ? Math.min((spent / creditLimit) * 100, 100) : 0;
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const dash   = circ - (pct / 100) * circ;
  const color  = pct < 50 ? '#22c55e' : pct < 80 ? '#f59e0b' : '#ef4444';

  return (
    <div className="ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="ring-label">
        <div className="ring-pct" style={{ color }}>{pct.toFixed(0)}%</div>
        <div className="ring-sub">used</div>
      </div>
    </div>
  );
}

export default function Dashboard({ cards, refreshTrigger }) {
  const [selectedCardId, setSelectedCardId] = useState('');
  const [dashboard, setDashboard]           = useState(null);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    if (!selectedCardId) return;
    fetchDashboard(selectedCardId);
  }, [selectedCardId, refreshTrigger]);

  async function fetchDashboard(cardId) {
    setError('');
    setLoading(true);
    try {
      setDashboard(await api.getDashboard(cardId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (cards.length === 0) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div className="empty-icon">📊</div>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Enroll a card to see your analytics here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Card carousel — click to select */}
      <div className="panel">
        <div className="panel-title">Your Cards &mdash; click to view analytics</div>
        <div className="cards-carousel">
          {cards.map((c) => (
            <VisaCard
              key={c.id}
              card={c}
              selected={String(c.id) === String(selectedCardId)}
              onClick={() => setSelectedCardId(String(c.id))}
            />
          ))}
        </div>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {loading && <div className="alert alert-info" style={{ textAlign: 'center' }}>Loading analytics…</div>}

      {dashboard && (
        <>
          {/* Stat cards row */}
          <div className="stats-row">
            <div className="stat-card stat-card--blue">
              <div className="stat-card-label">Credit Limit</div>
              <div className="stat-card-value">${dashboard.creditLimit.toFixed(2)}</div>
            </div>
            <div className="stat-card stat-card--green">
              <div className="stat-card-label">Available Balance</div>
              <div className="stat-card-value">${dashboard.availableBalance.toFixed(2)}</div>
            </div>
            <div className="stat-card stat-card--red">
              <div className="stat-card-label">Total Spent</div>
              <div className="stat-card-value">${dashboard.totalSpent.toFixed(2)}</div>
            </div>
          </div>

          {/* Chart + ring row */}
          <div className="two-col" style={{ alignItems: 'stretch' }}>
            <div className="panel">
              <div className="panel-title">Spend by Category</div>
              <PieChart spendByCategory={dashboard.spendByCategory} totalSpent={dashboard.totalSpent} />
            </div>

            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
              <div className="panel-title" style={{ alignSelf: 'flex-start' }}>Utilization</div>
              <RingMeter creditLimit={dashboard.creditLimit} availableBalance={dashboard.availableBalance} />
              <div style={{ width: '100%' }}>
                {Object.entries(dashboard.spendByCategory)
                  .filter(([, v]) => v > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amt]) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.85rem' }}>{CAT_ICONS[cat]} {cat}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--blue)', fontWeight: 600 }}>${amt.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* All cards overview table */}
          <div className="panel">
            <div className="panel-title">All Cards — Balance Overview</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Card</th>
                    <th>Number</th>
                    <th>Credit Limit</th>
                    <th>Available</th>
                    <th>Spent</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((c) => (
                    <tr
                      key={c.id}
                      className={String(c.id) === String(dashboard.cardId) ? 'row-active' : ''}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCardId(String(c.id))}
                    >
                      <td>{c.name}</td>
                      <td className="mono">{c.maskedCardNumber}</td>
                      <td>${c.creditLimit?.toFixed(2)}</td>
                      <td style={{ color: 'var(--green)' }}>${c.availableBalance?.toFixed(2)}</td>
                      <td style={{ color: 'var(--red)' }}>${(c.creditLimit - c.availableBalance)?.toFixed(2)}</td>
                      <td><UtilBar creditLimit={c.creditLimit} availableBalance={c.availableBalance} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction history */}
          {dashboard.recentTransactions.length > 0 && (
            <div className="panel">
              <div className="panel-title">Transaction History</div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Merchant</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td>{tx.merchant}</td>
                        <td>
                          <span className={`badge badge--${tx.category.toLowerCase()}`}>
                            {CAT_ICONS[tx.category]} {tx.category}
                          </span>
                        </td>
                        <td style={{ color: 'var(--red)', fontWeight: 600 }}>${tx.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!dashboard && !loading && selectedCardId && (
        <div className="alert alert-info" style={{ textAlign: 'center' }}>No data yet — make a payment to see analytics.</div>
      )}
    </div>
  );
}
