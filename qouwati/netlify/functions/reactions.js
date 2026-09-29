// netlify/functions/reactions.js
const { getCollection, setCollection, ok, err, cors } = require('./db');

const VALID_EMOJIS = ['🤍', '✨', '💪', '🙏'];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  const { httpMethod, queryStringParameters: qs, body: raw } = event;

  try {
    if (httpMethod === 'GET') {
      if (!qs?.post_id) return err('post_id is required');
      const reactions = await getCollection('reactions');
      return ok(reactions[qs.post_id] || {});
    }

    if (httpMethod === 'POST') {
      const { post_id, emoji, action } = JSON.parse(raw || '{}');
      if (!post_id || !emoji) return err('post_id and emoji required');
      if (!VALID_EMOJIS.includes(emoji)) return err('Invalid emoji');
      const reactions = await getCollection('reactions');
      if (!reactions[post_id]) reactions[post_id] = {};
      const current = reactions[post_id][emoji] || 0;
      reactions[post_id][emoji] = action === 'remove'
        ? Math.max(0, current - 1)
        : current + 1;
      await setCollection('reactions', reactions);
      return ok({ emoji, count: reactions[post_id][emoji] });
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('reactions:', e);
    return err('Server error', 500);
  }
};
