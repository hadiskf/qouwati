// netlify/functions/newsletter.js
const { getCollection, setCollection, ok, err, cors } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  const { httpMethod, queryStringParameters: qs, body: raw } = event;

  try {
    if (httpMethod === 'GET') {
      const subs = await getCollection('subscribers');
      return ok({ count: subs.length, subscribers: subs });
    }

    if (httpMethod === 'POST') {
      const { email } = JSON.parse(raw || '{}');
      if (!email?.includes('@')) return err('Valid email required');
      const clean = email.toLowerCase().trim().slice(0, 300);
      const subs = await getCollection('subscribers');
      if (subs.find(s => s.email === clean)) return ok({ subscribed: true, existing: true });
      subs.push({ email: clean, created_at: new Date().toISOString() });
      await setCollection('subscribers', subs);
      return ok({ subscribed: true }, 201);
    }

    if (httpMethod === 'DELETE') {
      const email = qs?.email;
      if (!email) return err('email required');
      const subs = await getCollection('subscribers');
      await setCollection('subscribers', subs.filter(s => s.email !== email.toLowerCase()));
      return ok({ unsubscribed: true });
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('newsletter:', e);
    return err('Server error', 500);
  }
};
