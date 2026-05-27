import { useState } from 'react';
import { api } from '../services/api';

const EMPTY_FORM = { name: '', cardNumber: '', creditLimit: '' };

export default function EnrollCard({ onCardEnrolled }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]     = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const card = await api.enrollCard({
        name: form.name,
        cardNumber: form.cardNumber,
        creditLimit: parseFloat(form.creditLimit),
      });
      onCardEnrolled(card);
      setForm(EMPTY_FORM);
      setSuccessMsg(`${card.name} (${card.maskedCardNumber}) enrolled — limit $${card.creditLimit.toFixed(2)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Enroll New Card</div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <label className="field-label">Card Nickname</label>
          <input
            className="field-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. My Travel Card"
            required
          />
        </div>

        <div className="field">
          <label className="field-label">Card Number</label>
          <input
            className="field-input mono"
            name="cardNumber"
            value={form.cardNumber}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
          />
        </div>

        <div className="field">
          <label className="field-label">Credit Limit ($)</label>
          <input
            className="field-input"
            name="creditLimit"
            type="number"
            min="1"
            step="0.01"
            value={form.creditLimit}
            onChange={handleChange}
            placeholder="5000.00"
            required
          />
        </div>

        {error      && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? (
            <><span className="spinner" /> Enrolling…</>
          ) : (
            '+ Enroll Card'
          )}
        </button>
      </form>
    </div>
  );
}
