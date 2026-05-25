// netlify/functions/db.js
// Storage using @netlify/blobs with proper site context
// Falls back to in-memory seed data if blobs unavailable

let blobsAvailable = false;
let getStore;

try {
  const blobs = require('@netlify/blobs');
  getStore = blobs.getStore;
  blobsAvailable = true;
} catch(e) {
  blobsAvailable = false;
}

// ── Default seed data ─────────────────────────────────────────
const SEED = {
  posts: [
    { id: 1, title: "When War Enters Our Minds 🧠", excerpt: "During war, emotions feel overwhelming. But your mind has extraordinary power to adapt and heal.", body: "During war, emotions can feel overwhelming: fear, anxiety, helplessness. But your mind has extraordinary power to adapt, protect, and heal.\n\n**Acknowledge your feelings.** Fear and sadness are normal responses. Don't suppress them.\n\n**Limit news consumption.** One check-in per day is enough.\n\n**Create safety rituals.** Small routines signal safety to your nervous system.\n\n**Connect with loved ones.** Human connection buffers against trauma.\n\n**Seek professional support.** There is no shame in asking for help.\n\nYou are not alone. 🌿", tag: "Mental Health", status: "published", image_url: null, emoji: "🧠", views: 124, created_at: "2025-04-10T00:00:00.000Z" },
    { id: 2, title: "🌙✨ In Ramadan, You Don't Just Fast... You Feel", excerpt: "Ramadan is not only about fasting from food. It is about feeling — gratitude, empathy, and presence.", body: "Ramadan is not only about fasting from food. It is about feeling the fast — feeling gratitude, empathy, and presence.\n\nWhen we abstain, we create space to reconnect with what truly matters.\n\n**Mental wellness during Ramadan:**\n\nPractice mindful breaking of the fast. Use Suhoor for reflection. Let iftar be a moment of community. Be gentle with yourself.\n\nThis month, your strength is spiritual, emotional, and deeply human. 🌙", tag: "Mindfulness", status: "published", image_url: null, emoji: "🌙", views: 89, created_at: "2025-03-20T00:00:00.000Z" },
    { id: 3, title: "🎭 The Illusion of Happiness", excerpt: "Posting fake happiness is a defense mechanism. But authentic expression leads to greater wellbeing.", body: "We live in a world where everyone's highlight reel is on display. But behind the filters, many people are struggling.\n\nPosting fake happiness is a defense mechanism — a way to control our narrative.\n\n**Breaking the cycle:**\n\nNotice when you post for validation. Let one trusted person see your real state. Remember: your struggles make you human. 🤍", tag: "Self-Love", status: "published", image_url: null, emoji: "🎭", views: 203, created_at: "2025-02-28T00:00:00.000Z" },
    { id: 4, title: "The Psychology of a Hug 🤍", excerpt: "Science confirms: hugs release oxytocin, lower cortisol, and create genuine safety.", body: "When was the last time you gave or received a real hug?\n\n**What happens in your body:**\n\nOxytocin is released. Cortisol drops. Blood pressure lowers. The parasympathetic nervous system activates.\n\nWhen we hold someone, we say: *You are not alone. You are safe.*\n\nToday, offer someone a moment of warmth. 🫂", tag: "Wellness", status: "published", image_url: null, emoji: "🤍", views: 156, created_at: "2025-01-15T00:00:00.000Z" },
    { id: 5, title: "Breaking the Stigma: Why Mental Health Matters", excerpt: "Mental health is just as important as physical health. It is time we treat it that way.", body: "For too long, mental health has been taboo. But mental health is just as important as physical health.\n\n**Breaking the stigma means:**\n\nTalking openly about therapy. Checking in on friends. Understanding mental illness is not a flaw.\n\nTrue strength — قُوَّة — includes the courage to say: I need support. 💚", tag: "Mental Health", status: "published", image_url: null, emoji: "💚", views: 178, created_at: "2024-12-01T00:00:00.000Z" },
    { id: 6, title: "You're Not Lazy, You're Tired 💛", excerpt: "Mental fatigue and burnout are not laziness. They are your nervous system protecting you.", body: "We say 'I'm lazy,' but it's usually mental fatigue, emotional overload, or burnout.\n\n**Signs you're exhausted, not lazy:**\n\nThings you loved feel meaningless. You feel guilty for resting. Small tasks feel overwhelming.\n\n**What helps:**\n\nRest without guilt. Identify the source. Nourish your body. Seek support.\n\nHonoring your limits is wisdom. 💛", tag: "Self-Love", status: "published", image_url: null, emoji: "💛", views: 231, created_at: "2024-11-10T00:00:00.000Z" }
  ],
  tips: [
    { id: 1, title: "Kind thoughts about yourself change the way you experience life.", description: "Speak to yourself with the gentleness you'd offer a dear friend.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 2, title: "You can't pour from an empty cup — protect yourself first.", description: "Self-care is not selfishness. Filling your own well allows you to give genuinely.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 3, title: "Be kind; everyone is fighting battles you cannot see.", description: "Compassion begins with yourself and radiates outward naturally.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 4, title: "Growth is not linear. Give yourself grace on the hard days.", description: "Some days feel like steps backward. They are still part of the journey.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 5, title: "Rest is not a reward. It is a right.", description: "Your worth is not measured by your productivity.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 6, title: "Healing is not forgetting. It is learning to carry things differently.", description: "You just learn to hold your story with different hands.", created_at: "2025-01-01T00:00:00.000Z" }
  ],
  faqs: [
    { id: 1, question: 'What does "قُوَّة" mean?', answer: '"قُوَّة" means "strength" in Arabic. At Qouwati, strength comes from within — from your thoughts, self-acceptance, and resilience.', sort_order: 1, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 2, question: 'How do I start building self-confidence?', answer: 'It starts with kindness. Speak to yourself with love, focus on your strengths, and remember that growth is a process.', sort_order: 2, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 3, question: 'What does Qouwati offer?', answer: 'Motivational content, practical tips, diary reflections, a breathing widget, gratitude journal, and a safe community space.', sort_order: 3, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 4, question: 'How can I share my voice?', answer: 'Follow us on Instagram @qouwati, comment on posts, and share your story. Every voice matters.', sort_order: 4, created_at: "2025-01-01T00:00:00.000Z" }
  ],
  testimonials: [
    { id: 1, quote: "Qouwati has been a quiet companion through some of my hardest months.", name: "Lara M.", location: "Beirut, Lebanon", stars: 5, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 2, quote: "The daily reminders genuinely helped me feel less alone.", name: "Nour H.", location: "Dubai, UAE", stars: 5, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 3, quote: "Having these reflections in Arabic makes them hit so much deeper.", name: "Farah K.", location: "Amman, Jordan", stars: 5, created_at: "2025-01-01T00:00:00.000Z" }
  ],
  comments: {},
  reactions: {},
  subscribers: [],
  nextId: { posts: 7, tips: 7, faqs: 5, testimonials: 4 }
};

// ── In-memory fallback store (resets on cold start but never crashes) ──
const memStore = {};

// ── Store helpers ─────────────────────────────────────────────
async function getCollection(name) {
  // Try Netlify Blobs first
  if (blobsAvailable) {
    try {
      const store = getStore({ name: 'qouwati', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_TOKEN });
      const raw = await store.get(name, { type: 'json' });
      if (raw !== null && raw !== undefined) return raw;
    } catch (e) {
      console.log('Blobs read failed, using seed:', e.message);
    }
  }
  // Fall back to memory store or seed
  if (memStore[name] !== undefined) return memStore[name];
  // Return a deep copy of seed data
  return JSON.parse(JSON.stringify(SEED[name] ?? (name === 'comments' || name === 'reactions' ? {} : [])));
}

async function setCollection(name, data) {
  // Always save to memory
  memStore[name] = data;
  // Try Netlify Blobs
  if (blobsAvailable) {
    try {
      const store = getStore({ name: 'qouwati', siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_TOKEN });
      await store.setJSON(name, data);
    } catch (e) {
      console.log('Blobs write failed, saved to memory only:', e.message);
    }
  }
}

async function nextId(collection) {
  let ids = await getCollection('nextId');
  if (!ids || typeof ids !== 'object' || Array.isArray(ids)) {
    ids = { ...SEED.nextId };
  }
  const id = ids[collection] || 1;
  ids[collection] = id + 1;
  await setCollection('nextId', ids);
  return id;
}

// ── HTTP helpers ──────────────────────────────────────────────
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};
const ok   = (d, s=200) => ({ statusCode: s, headers: HEADERS, body: JSON.stringify(d) });
const err  = (m, s=400) => ({ statusCode: s, headers: HEADERS, body: JSON.stringify({ error: m }) });
const cors = ()          => ({ statusCode: 204, headers: HEADERS, body: '' });

module.exports = { getCollection, setCollection, nextId, ok, err, cors, SEED };
