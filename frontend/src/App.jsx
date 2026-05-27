import { useState, useEffect, useCallback } from 'react';
import EnrollCard from './components/EnrollCard';
import MakePayment from './components/MakePayment';
import Dashboard from './components/Dashboard';
import VisaCard from './components/VisaCard';
import { api } from './services/api';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'enroll',    label: 'Enroll Card', icon: '➕' },
  { id: 'pay',       label: 'Make Payment', icon: '💳' },
];

export default function App() {
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchCards = useCallback(async () => {
    try { setCards(await api.listCards()); } catch { /* silent on load */ }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  function handleCardEnrolled(newCard) {
    setCards((prev) => [...prev, newCard]);
    setActiveTab('dashboard');
  }

  function handlePaymentMade() {
    fetchCards();
    setRefreshTrigger((n) => n + 1);
    setActiveTab('dashboard');
  }

  const totalLimit   = cards.reduce((s, c) => s + (c.creditLimit ?? 0), 0);
  const totalBalance = cards.reduce((s, c) => s + (c.availableBalance ?? 0), 0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <div className="header-icon">💳</div>
          <div>
            <h1>Spend Analytics</h1>
            <p>Powered by Visa</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-pill">
            Cards &nbsp;<span>{cards.length}</span>
          </div>
          <div className="stat-pill">
            Total Limit &nbsp;<span>${totalLimit.toFixed(2)}</span>
          </div>
          <div className="stat-pill">
            Available &nbsp;<span>${totalBalance.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {activeTab === 'dashboard' && (
        <Dashboard cards={cards} refreshTrigger={refreshTrigger} />
      )}
      {activeTab === 'enroll' && (
        <div className="two-col">
          <EnrollCard onCardEnrolled={handleCardEnrolled} />
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="panel-title">Your Cards</div>
            {cards.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🪪</div>
                <p>No cards enrolled yet</p>
              </div>
            ) : (
              <div className="cards-carousel">
                {cards.map((c) => (
                  <VisaCard key={c.id} card={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'pay' && (
        <MakePayment cards={cards} onPaymentMade={handlePaymentMade} />
      )}
    </div>
  );
}
