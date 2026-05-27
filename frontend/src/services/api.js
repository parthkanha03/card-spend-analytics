const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const api = {
  enrollCard: (payload) =>
    request('/cards', { method: 'POST', body: JSON.stringify(payload) }),

  listCards: () =>
    request('/cards'),

  makePayment: (cardId, payload) =>
    request(`/cards/${cardId}/pay`, { method: 'POST', body: JSON.stringify(payload) }),

  getDashboard: (cardId) =>
    request(`/dashboard/${cardId}`),
};
