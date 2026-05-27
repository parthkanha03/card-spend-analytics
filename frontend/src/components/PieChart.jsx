const CAT_COLORS = {
  GROCERIES: '#22c55e',
  DINING:    '#f59e0b',
  TRAVEL:    '#3b82f6',
  SHOPPING:  '#ec4899',
  UTILITIES: '#a855f7',
};

const CAT_ICONS = {
  GROCERIES: '🛒', DINING: '🍽️', TRAVEL: '✈️', SHOPPING: '🛍️', UTILITIES: '💡',
};

export default function PieChart({ spendByCategory, totalSpent }) {
  if (!spendByCategory || totalSpent === 0) {
    return (
      <div className="pie-empty">
        <svg className="pie-circle pie-circle--empty" viewBox="0 0 130 130" width="130" height="130">
          <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="22" />
        </svg>
        <p style={{ color: 'var(--muted)', marginTop: '0.75rem', fontSize: '0.85rem' }}>
          No spend yet — make a payment to see your breakdown
        </p>
      </div>
    );
  }

  let accumulated = 0;
  const slices = Object.entries(spendByCategory)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => {
      const pct   = (amount / totalSpent) * 100;
      const start = accumulated;
      accumulated += pct;
      return { category, amount, pct, start, end: accumulated };
    });

  const gradient = slices
    .map(({ category, start, end }) =>
      `${CAT_COLORS[category]} ${start.toFixed(2)}% ${end.toFixed(2)}%`
    )
    .join(', ');

  return (
    <div className="pie-wrapper">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div
          className="pie-circle"
          style={{ background: `conic-gradient(${gradient})` }}
          aria-label={`Spend breakdown, total $${totalSpent.toFixed(2)}`}
        />
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          Total: <strong style={{ color: 'var(--text)' }}>${totalSpent.toFixed(2)}</strong>
        </div>
      </div>

      <ul className="pie-legend">
        {slices.map(({ category, amount, pct }) => (
          <li key={category} className="pie-legend-item">
            <span className="pie-legend-dot" style={{ background: CAT_COLORS[category] }} />
            <span className="pie-legend-label">{CAT_ICONS[category]} {category}</span>
            <span className="pie-legend-value">
              ${amount.toFixed(2)}&nbsp;<span style={{ color: 'var(--muted)' }}>({pct.toFixed(1)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
