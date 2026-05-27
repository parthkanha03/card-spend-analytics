import { useState } from 'react';
import { api } from '../services/api';
import VisaCard from './VisaCard';

const CATEGORIES = [
  { value: 'GROCERIES', label: '🛒 Groceries' },
  { value: 'DINING',    label: '🍽️ Dining'    },
  { value: 'TRAVEL',    label: '✈️ Travel'     },
  { value: 'SHOPPING',  label: '🛍️ Shopping'  },
  { value: 'UTILITIES', label: '💡 Utilities'  },
];

export default function MakePayment({ cards, onPaymentMade }) {
  const [form, setForm]             = useState({ cardId: '', amount: '', category: '', merchant: '' });
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]       = useState(false);

  const selectedCard = cards.find((c) => String(c.id) === String(form.cardId)) ?? null;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function selectCard(card) {
    setForm((prev) => ({ ...prev, cardId: String(card.id) }));
    setError('');
    setSuccessMsg('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const tx = await api.makePayment(form.cardId, {
        amount:   parseFloat(form.amount),
        category: form.category,
        merchant: form.merchant,
      });
      onPaymentMade(form.cardId, tx);
      setSuccessMsg(`$${tx.amount.toFixed(2)} at ${tx.merchant} (${tx.category}) recorded`);
      setForm((prev) => ({ ...prev, amount: '', category: '', merchant: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (cards.length === 0) {
    return (
      <div className="panel">
        <div className="panel-title">Make Payment</div>
        <div className="empty-state">
          <div className="empty-icon">🪪</div>
          <p>Enroll a card first to make payments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="two-col" style={{ alignItems: 'flex-start' }}>
      {/* Card picker */}
      <div className="panel">
        <div className="panel-title">Select Card</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cards.map((c) => (
            <VisaCard
              key={c.id}
              card={c}
              selected={String(c.id) === String(form.cardId)}
              onClick={() => selectCard(c)}
            />
          ))}
        </div>
      </div>

      {/* Payment form */}
      <div className="panel">
        <div className="panel-title">Transaction Details</div>

        {selectedCard ? (
          <div className="selected-card-badge">
            <span className="badge-dot" />
            {selectedCard.name} &mdash; {selectedCard.maskedCardNumber}
            &nbsp;&nbsp;<span style={{ color: 'var(--green)' }}>${selectedCard.availableBalance?.toFixed(2)} avail.</span>
          </div>
        ) : (
          <div className="alert alert-info">← Pick a card to continue</div>
        )}

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label className="field-label">Amount ($)</label>
            <input
              className="field-input"
              name="amount"
              type="number"
              min="1.00"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="25.00"
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Category</label>
            <select className="field-input" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Merchant</label>
            <input
              className="field-input"
              name="merchant"
              value={form.merchant}
              onChange={handleChange}
              placeholder="e.g. Whole Foods"
              required
            />
          </div>

          {error      && <div className="alert alert-error">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <button className="btn-primary" type="submit" disabled={loading || !form.cardId}>
            {loading ? (
              <><span className="spinner" /> Processing…</>
            ) : (
              '💳 Submit Payment'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
