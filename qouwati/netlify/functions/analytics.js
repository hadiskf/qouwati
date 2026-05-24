// netlify/functions/analytics.js
const { getCollection, ok, err, cors } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  if (event.httpMethod !== 'GET') return err('Method not allowed', 405);

  try {
    const [posts, subs, comments, reactions] = await Promise.all([
      getCollection('posts'),
      getCollection('subscribers'),
      getCollection('comments'),
      getCollection('reactions'),
    ]);

    const totalViews = posts.reduce((a, p) => a + (p.views || 0), 0);
    const topPosts = [...posts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({ id: p.id, title: p.title, views: p.views || 0, tag: p.tag }));

    const totalComments = Object.values(comments).reduce((a, c) => a + c.length, 0);
    const pendingComments = Object.values(comments)
      .flat()
      .filter(c => c.status === 'pending').length;

    const tagCounts = {};
    posts.forEach(p => { tagCounts[p.tag] = (tagCounts[p.tag] || 0) + 1; });

    const totalReactions = Object.values(reactions)
      .reduce((a, r) => a + Object.values(r).reduce((b, c) => b + c, 0), 0);

    return ok({
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      draftPosts: posts.filter(p => p.status === 'draft').length,
      totalViews,
      topPosts,
      totalComments,
      pendingComments,
      totalSubscribers: subs.length,
      totalReactions,
      tagCounts,
      recentSubscribers: subs.slice(-5).reverse(),
    });
  } catch (e) {
    console.error('analytics:', e);
    return err('Server error', 500);
  }
};
