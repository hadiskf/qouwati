// netlify/functions/tips.js
const { getCollection, setCollection, nextId, ok, err, cors } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  const { httpMethod, queryStringParameters: qs, body: raw } = event;

  try {
    if (httpMethod === 'GET') {
      return ok(await getCollection('tips'));
    }
    if (httpMethod === 'POST') {
      const { title, description } = JSON.parse(raw || '{}');
      if (!title?.trim()) return err('title is required');
      const tips = await getCollection('tips');
      const tip = { id: await nextId('tips'), title: title.trim(), description: (description || '').trim(), created_at: new Date().toISOString() };
      tips.push(tip);
      await setCollection('tips', tips);
      return ok(tip, 201);
    }
    if (httpMethod === 'PUT') {
      if (!qs?.id) return err('id is required');
      const tips = await getCollection('tips');
      const idx = tips.findIndex(t => t.id == qs.id);
      if (idx === -1) return err('Not found', 404);
      const { title, description } = JSON.parse(raw || '{}');
      if (title !== undefined) tips[idx].title = title.trim();
      if (description !== undefined) tips[idx].description = description.trim();
      await setCollection('tips', tips);
      return ok(tips[idx]);
    }
    if (httpMethod === 'DELETE') {
      if (!qs?.id) return err('id is required');
      const tips = await getCollection('tips');
      await setCollection('tips', tips.filter(t => t.id != qs.id));
      return ok({ deleted: true });
    }
    return err('Method not allowed', 405);
  } catch (e) {
    console.error('tips:', e);
    return err('Server error', 500);
  }
};
