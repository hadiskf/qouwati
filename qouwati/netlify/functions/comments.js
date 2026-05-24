// netlify/functions/comments.js
// Comments go to "pending" first — admin must approve before public display
const { getCollection, setCollection, ok, err, cors } = require('./db');

const SPAM_WORDS = ['casino', 'viagra', 'crypto', 'bitcoin', 'click here', 'free money', 'buy now', 'http://', 'https://bit.ly'];

function isSpam(text) {
  const lower = text.toLowerCase();
  return SPAM_WORDS.some(w => lower.includes(w));
}

function sanitize(str) {
  return String(str || '').replace(/<[^>]+>/g, '').trim().slice(0, 2000);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  const { httpMethod, queryStringParameters: qs, body: raw } = event;

  try {
    const all = await getCollection('comments');

    // GET — public: approved only. Admin: all with ?admin=1
    if (httpMethod === 'GET') {
      if (!qs?.post_id) return err('post_id is required');
      const postComments = (all[qs.post_id] || []);
      const result = qs?.admin === '1'
        ? postComments
        : postComments.filter(c => c.status === 'approved');
      return ok(result);
    }

    // POST — submit new comment (goes to pending)
    if (httpMethod === 'POST') {
      const { post_id, name, email, message } = JSON.parse(raw || '{}');
      if (!post_id || !name?.trim() || !message?.trim()) return err('post_id, name and message are required');
      const cleanMsg = sanitize(message);
      if (cleanMsg.length < 2) return err('Message too short');
      const status = isSpam(cleanMsg) ? 'spam' : 'pending';
      const comment = {
        id: Date.now(),
        post_id: parseInt(post_id),
        name: sanitize(name).slice(0, 100),
        email: sanitize(email || '').slice(0, 200),
        message: cleanMsg,
        status,
        created_at: new Date().toISOString(),
      };
      if (!all[post_id]) all[post_id] = [];
      all[post_id].push(comment);
      await setCollection('comments', all);
      return ok({ submitted: true, status }, 201);
    }

    // PUT — approve / reject (admin)
    if (httpMethod === 'PUT') {
      const { post_id, comment_id, status } = JSON.parse(raw || '{}');
      if (!post_id || !comment_id || !status) return err('post_id, comment_id and status required');
      if (!['approved','rejected','spam'].includes(status)) return err('Invalid status');
      const comments = all[post_id] || [];
      const idx = comments.findIndex(c => c.id == comment_id);
      if (idx === -1) return err('Not found', 404);
      comments[idx].status = status;
      all[post_id] = comments;
      await setCollection('comments', all);
      return ok(comments[idx]);
    }

    // DELETE — remove comment
    if (httpMethod === 'DELETE') {
      const { post_id, comment_id } = qs || {};
      if (!post_id || !comment_id) return err('post_id and comment_id required');
      all[post_id] = (all[post_id] || []).filter(c => c.id != comment_id);
      await setCollection('comments', all);
      return ok({ deleted: true });
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('comments:', e);
    return err('Server error', 500);
  }
};
