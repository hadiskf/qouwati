// netlify/functions/testimonials.js
const { getCollection, setCollection, nextId, ok, err, cors } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  const { httpMethod, queryStringParameters: qs, body: raw } = event;

  try {
    if (httpMethod === 'GET') {
      return ok(await getCollection('testimonials'));
    }
    if (httpMethod === 'POST') {
      const { quote, name, location, stars } = JSON.parse(raw || '{}');
      if (!quote?.trim() || !name?.trim()) return err('quote and name are required');
      const testis = await getCollection('testimonials');
      const testi = { id: await nextId('testimonials'), quote: quote.trim(), name: name.trim(), location: (location || '').trim(), stars: Math.min(5, Math.max(1, parseInt(stars) || 5)), created_at: new Date().toISOString() };
      testis.unshift(testi);
      await setCollection('testimonials', testis);
      return ok(testi, 201);
    }
    if (httpMethod === 'PUT') {
      if (!qs?.id) return err('id is required');
      const testis = await getCollection('testimonials');
      const idx = testis.findIndex(t => t.id == qs.id);
      if (idx === -1) return err('Not found', 404);
      const data = JSON.parse(raw || '{}');
      if (data.quote !== undefined) testis[idx].quote = data.quote.trim();
      if (data.name !== undefined) testis[idx].name = data.name.trim();
      if (data.location !== undefined) testis[idx].location = data.location.trim();
      if (data.stars !== undefined) testis[idx].stars = Math.min(5, Math.max(1, parseInt(data.stars) || 5));
      await setCollection('testimonials', testis);
      return ok(testis[idx]);
    }
    if (httpMethod === 'DELETE') {
      if (!qs?.id) return err('id is required');
      const testis = await getCollection('testimonials');
      await setCollection('testimonials', testis.filter(t => t.id != qs.id));
      return ok({ deleted: true });
    }
    return err('Method not allowed', 405);
  } catch (e) {
    console.error('testimonials:', e);
    return err('Server error', 500);
  }
};
