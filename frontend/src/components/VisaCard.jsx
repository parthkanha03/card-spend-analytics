const THEMES = ['card-theme-0','card-theme-1','card-theme-2','card-theme-3','card-theme-4'];

const CAT_ICONS = {
  GROCERIES: '🛒', DINING: '🍽️', TRAVEL: '✈️', SHOPPING: '🛍️', UTILITIES: '💡',
};

export default function VisaCard({ card, selected, onClick, showBalance = true }) {
  const theme = THEMES[card.id % THEMES.length];
  const utilPct = card.creditLimit > 0
    ? ((card.creditLimit - card.availableBalance) / card.creditLimit) * 100
    : 0;

  return (
    <div
      className={`visa-card ${theme} ${selected ? 'selected' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="card-shine" />
      <div className="card-circles" />

      {/* Top row */}
      <div className="card-top">
        <div className="card-chip" />
        <div className="contactless-icon">
          <div className="contactless-arc" />
          <div className="contactless-arc" />
          <div className="contactless-arc" />
        </div>
      </div>

      {/* Card number */}
      <div className="card-number">{card.maskedCardNumber}</div>

      {/* Bottom row */}
      <div className="card-bottom">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="card-info-block">
            <div className="card-label">Card Holder</div>
            <div className="card-value">{card.name}</div>
          </div>

          {showBalance && (
            <div className="card-info-block">
              <div className="card-label">Available</div>
              <div className="card-value" style={{ color: utilPct > 80 ? '#fca5a5' : '#6ee7b7' }}>
                ${card.availableBalance?.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div className="visa-logo">VISA</div>
          {showBalance && (
            <div className="card-balance-badge">
              {utilPct.toFixed(0)}% used
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { CAT_ICONS };
