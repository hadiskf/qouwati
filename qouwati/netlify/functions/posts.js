// netlify/functions/posts.js
const { getCollection, setCollection, nextId, ok, err, cors } = require('./db');

// Basic HTML sanitizer — strips tags to prevent XSS
function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  const { httpMethod, queryStringParameters: qs, body: raw } = event;

  try {
    // ── GET ────────────────────────────────────────────────
    if (httpMethod === 'GET') {
      let posts = await getCollection('posts');
      if (qs?.id) {
        const post = posts.find(p => p.id == qs.id);
        if (!post) return err('Not found', 404);
        // Only increment view count for public views, not admin previews
        if (qs?.preview !== '1') {
          post.views = (post.views || 0) + 1;
          await setCollection('posts', posts);
        }
        return ok(post);
      }
      // Filter by status (default: published only)
      const status = qs?.status || 'published';
      if (status !== 'all') posts = posts.filter(p => p.status === status);
      if (qs?.tag) posts = posts.filter(p => p.tag === qs.tag);
      // Strip full body from list view for performance
      return ok(posts.map(({ body, ...rest }) => rest));
    }

    // ── POST ───────────────────────────────────────────────
    if (httpMethod === 'POST') {
      const data = JSON.parse(raw || '{}');
      const { title, excerpt, body, tag, status, image_url, emoji } = data;
      if (!title?.trim() || !excerpt?.trim() || !body?.trim())
        return err('title, excerpt and body are required');
      const posts = await getCollection('posts');
      const id = await nextId('posts');
      const post = {
        id,
        title:     sanitize(title),
        excerpt:   sanitize(excerpt),
        body:      sanitize(body),
        tag:       sanitize(tag) || 'Reflection',
        status:    status === 'draft' ? 'draft' : 'published',
        image_url: image_url ? sanitize(image_url) : null,
        emoji:     sanitize(emoji) || '🌿',
        views:     0,
        created_at: new Date().toISOString(),
      };
      posts.unshift(post);
      await setCollection('posts', posts);
      return ok(post, 201);
    }

    // ── PUT ────────────────────────────────────────────────
    if (httpMethod === 'PUT') {
      if (!qs?.id) return err('id is required');
      const posts = await getCollection('posts');
      const idx = posts.findIndex(p => p.id == qs.id);
      if (idx === -1) return err('Not found', 404);
      const data = JSON.parse(raw || '{}');
      const allowed = ['title','excerpt','body','tag','status','image_url','emoji'];
      allowed.forEach(f => { if (data[f] !== undefined) posts[idx][f] = sanitize(String(data[f])); });
      posts[idx].updated_at = new Date().toISOString();
      await setCollection('posts', posts);
      return ok(posts[idx]);
    }

    // ── DELETE ─────────────────────────────────────────────
    if (httpMethod === 'DELETE') {
      if (!qs?.id) return err('id is required');
      const posts = await getCollection('posts');
      await setCollection('posts', posts.filter(p => p.id != qs.id));
      return ok({ deleted: true });
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('posts:', e);
    return err('Server error', 500);
  }
};
