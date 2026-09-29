// netlify/functions/faqs.js
const { getCollection, setCollection, nextId, ok, err, cors } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  const { httpMethod, queryStringParameters: qs, body: raw } = event;

  try {
    if (httpMethod === 'GET') {
      const faqs = await getCollection('faqs');
      return ok(faqs.sort((a, b) => a.sort_order - b.sort_order));
    }
    if (httpMethod === 'POST') {
      const { question, answer } = JSON.parse(raw || '{}');
      if (!question?.trim() || !answer?.trim()) return err('question and answer are required');
      const faqs = await getCollection('faqs');
      const faq = { id: await nextId('faqs'), question: question.trim(), answer: answer.trim(), sort_order: faqs.length + 1, created_at: new Date().toISOString() };
      faqs.push(faq);
      await setCollection('faqs', faqs);
      return ok(faq, 201);
    }
    if (httpMethod === 'PUT') {
      if (!qs?.id) return err('id is required');
      const faqs = await getCollection('faqs');
      const idx = faqs.findIndex(f => f.id == qs.id);
      if (idx === -1) return err('Not found', 404);
      const { question, answer } = JSON.parse(raw || '{}');
      if (question !== undefined) faqs[idx].question = question.trim();
      if (answer !== undefined) faqs[idx].answer = answer.trim();
      await setCollection('faqs', faqs);
      return ok(faqs[idx]);
    }
    if (httpMethod === 'DELETE') {
      if (!qs?.id) return err('id is required');
      const faqs = await getCollection('faqs');
      await setCollection('faqs', faqs.filter(f => f.id != qs.id));
      return ok({ deleted: true });
    }
    return err('Method not allowed', 405);
  } catch (e) {
    console.error('faqs:', e);
    return err('Server error', 500);
  }
};
