// netlify/functions/db.js
// Netlify Blobs — free, built-in, persistent storage
// No external DB needed. Works out of the box on every Netlify site.

const { getStore } = require('@netlify/blobs');

// ── Default seed data ────────────────────────────────────────
const SEED = {
  posts: [
    { id: 1, title: "When War Enters Our Minds 🧠", excerpt: "During war, emotions feel overwhelming. But your mind has extraordinary power to adapt and heal.", body: "During war, emotions can feel overwhelming: fear, anxiety, helplessness. But your mind has extraordinary power to adapt, protect, and heal.\n\n**Acknowledge your feelings.** Fear and sadness are normal responses. Don't suppress them — feel them, name them, and let them move through you.\n\n**Limit news consumption.** Stay informed but set boundaries — constant news exposure increases cortisol significantly. One check-in per day is enough.\n\n**Create safety rituals.** Small routines (morning tea, a walk, journaling) signal safety to your nervous system even when the outside world feels chaotic.\n\n**Connect with loved ones.** Human connection is one of the most powerful buffers against trauma. A simple call can change everything.\n\n**Seek professional support.** Therapists and counselors can offer tools tailored to your needs. There is no shame in asking for help.\n\nYou are not alone. Your strength is greater than you know. 🌿", tag: "Mental Health", status: "published", image_url: "assets/img/blog13.png", emoji: "🧠", views: 124, created_at: "2025-04-10T00:00:00.000Z" },
    { id: 2, title: "🌙✨ In Ramadan, You Don't Just Fast... You Feel", excerpt: "Ramadan is not only about fasting from food. It is about feeling — gratitude, empathy, and presence.", body: "Ramadan is not only about fasting from food. It is about feeling the fast — feeling gratitude, empathy, and presence.\n\nWhen we abstain from food and drink, we create space. Space to listen to our body, to slow down our racing thoughts, to reconnect with what truly matters.\n\n**Mental wellness during Ramadan:**\n\nPractice mindful breaking of the fast — eat slowly, with gratitude. Use the quiet of Suhoor for reflection. Let iftar be a moment of genuine community. Be gentle with yourself if you feel emotional or fatigued.\n\nThis month, your strength is not just physical. It is spiritual, emotional, and deeply human. 🌙", tag: "Mindfulness", status: "published", image_url: "assets/img/blog12.JPG", emoji: "🌙", views: 89, created_at: "2025-03-20T00:00:00.000Z" },
    { id: 3, title: "🎭 The Illusion of Happiness", excerpt: "Psychologically, posting fake happiness is a defense mechanism. But authentic expression leads to greater wellbeing.", body: "We live in a world where everyone's highlight reel is on display. But behind the filtered photos and cheerful captions, many people are struggling in silence.\n\nPosting fake happiness is psychologically a defense mechanism — a way to control our narrative, to seek validation, or to avoid vulnerability.\n\n**But here's what the research tells us:**\n\nAuthentic expression — even of difficult emotions — leads to greater wellbeing than performed happiness.\n\n**Breaking the cycle:**\n\nNotice when you post for external validation. Practice letting one trusted person see your real state. Remember: your struggles don't make you weak. They make you human. 🤍", tag: "Self-Love", status: "published", image_url: "assets/img/blog10.JPG", emoji: "🎭", views: 203, created_at: "2025-02-28T00:00:00.000Z" },
    { id: 4, title: "The Psychology of a Hug 🤍", excerpt: "Science confirms what our hearts know: hugs release oxytocin, lower cortisol, and create genuine safety.", body: "When was the last time you gave or received a real, full, present hug?\n\nScience confirms what our hearts already know: hugs are medicine.\n\n**What happens in your body:**\n\nOxytocin (the bonding hormone) is released. Cortisol — the stress hormone — drops measurably. Blood pressure lowers. The parasympathetic nervous system activates.\n\nBut the psychology goes deeper. When we hold someone, we communicate: *I see you. You are not alone. You are safe.*\n\nToday, offer someone — or yourself — a moment of warmth. 🫂", tag: "Wellness", status: "published", image_url: "assets/img/blog8.jpg", emoji: "🤍", views: 156, created_at: "2025-01-15T00:00:00.000Z" },
    { id: 5, title: "Breaking the Stigma: Why Mental Health Matters", excerpt: "For too long, mental health has been taboo. It is time we treat it as importantly as physical health.", body: "For too long, mental health has been a taboo topic. But mental health is just as important as physical health.\n\n**What does breaking the stigma look like?**\n\nTalking openly about therapy without shame. Checking in on friends who seem 'fine'. Understanding that mental illness is not a character flaw. Creating spaces where vulnerability is welcomed.\n\nTrue strength — قُوَّة — includes the courage to say: I need support.\n\nOne conversation can change a life. 💚", tag: "Mental Health", status: "published", image_url: "assets/img/blog1.jpeg", emoji: "💚", views: 178, created_at: "2024-12-01T00:00:00.000Z" },
    { id: 6, title: "You're Not Lazy, You're Tired 💛", excerpt: "Mental fatigue, emotional overload, burnout — these are not laziness. They are your nervous system protecting you.", body: "We say 'I'm lazy,' but deep down, it's usually something else entirely.\n\n**Mental fatigue. Emotional overload. Burnout from caring too much for too long.**\n\nWhen your body doesn't want to move, when tasks feel impossibly heavy — this is often your nervous system protecting itself.\n\n**Signs you're exhausted, not lazy:**\n\nYou used to enjoy things that now feel meaningless. You feel guilty for resting. Small tasks feel overwhelming.\n\n**What actually helps:**\n\nRest without guilt. Identify the source of depletion. Nourish your body: sleep, water, food, sunlight. Seek support.\n\nYou are not failing. Honoring your limits is wisdom. 💛", tag: "Self-Love", status: "published", image_url: "assets/img/blog6.jpg", emoji: "💛", views: 231, created_at: "2024-11-10T00:00:00.000Z" }
  ],
  tips: [
    { id: 1, title: "Kind thoughts about yourself change the way you experience life.", description: "The language you use internally shapes your reality. Speak to yourself with the gentleness you'd offer a dear friend.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 2, title: "You can't pour from an empty cup — protect yourself first.", description: "Self-care is not selfishness. Filling your own well allows you to be genuinely present for others.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 3, title: "Be kind; everyone is fighting battles you cannot see.", description: "Compassion begins with yourself and radiates outward to every person you encounter.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 4, title: "Growth is not linear. Give yourself grace on the hard days.", description: "Some days feel like steps backward. They are still part of the journey.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 5, title: "Rest is not a reward. It is a right.", description: "You do not need to earn rest. Your worth is not measured by your productivity.", created_at: "2025-01-01T00:00:00.000Z" },
    { id: 6, title: "Healing is not forgetting. It is learning to carry things differently.", description: "You don't have to let go of your story. You just learn to hold it with different hands.", created_at: "2025-01-01T00:00:00.000Z" }
  ],
  faqs: [
    { id: 1, question: 'What does "قُوَّة" mean, and why is it central to Qouwati?', answer: '"قُوَّة" means "strength" in Arabic — the word at the heart of this platform. At Qouwati, we believe strength comes from within: from your thoughts, your self-acceptance, and your resilience.', sort_order: 1, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 2, question: 'How do I start building self-confidence?', answer: 'It starts with kindness. Speak to yourself with love, focus on your unique strengths, and remind yourself that growth is a process. Your imperfections make you human — and that is genuinely beautiful.', sort_order: 2, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 3, question: 'What kind of mental health support does Qouwati offer?', answer: 'Qouwati provides motivational content, practical tips, diary reflections, a breathing widget, gratitude journal, and a safe community space. For professional support, we curate resources in the Resources section.', sort_order: 3, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 4, question: 'How can I share my voice with the Qouwati community?', answer: 'Follow us on Instagram @qouwati, comment on our posts, and share your story. Every voice matters.', sort_order: 4, created_at: "2025-01-01T00:00:00.000Z" }
  ],
  testimonials: [
    { id: 1, quote: "Qouwati has been a quiet companion through some of my hardest months. Aya's words feel like they were written just for me.", name: "Lara M.", location: "Beirut, Lebanon", stars: 5, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 2, quote: "I found this page during a really difficult time. The daily reminders and blog posts genuinely helped me feel less alone.", name: "Nour H.", location: "Dubai, UAE", stars: 5, created_at: "2025-01-01T00:00:00.000Z" },
    { id: 3, quote: "The bilingual content is so important. Having these reflections in Arabic makes them hit so much deeper.", name: "Farah K.", location: "Amman, Jordan", stars: 5, created_at: "2025-01-01T00:00:00.000Z" }
  ],
  comments: {},
  reactions: {},
  subscribers: [],
  nextId: { posts: 7, tips: 7, faqs: 5, testimonials: 4 }
};

// ── Store helpers ────────────────────────────────────────────
async function getCollection(name) {
  const store = getStore('qouwati');
  try {
    const raw = await store.get(name, { type: 'json' });
    return raw ?? SEED[name] ?? (Array.isArray(SEED[name]) ? [] : {});
  } catch (e) {
    return SEED[name] ?? (Array.isArray(SEED[name]) ? [] : {});
  }
}

async function setCollection(name, data) {
  const store = getStore('qouwati');
  await store.setJSON(name, data);
}

async function nextId(collection) {
  const store = getStore('qouwati');
  let ids;
  try { ids = await store.get('nextId', { type: 'json' }) ?? { ...SEED.nextId }; }
  catch (e) { ids = { ...SEED.nextId }; }
  const id = ids[collection] || 1;
  ids[collection] = id + 1;
  await store.setJSON('nextId', ids);
  return id;
}

// ── HTTP helpers ─────────────────────────────────────────────
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};
const ok  = (d, s=200) => ({ statusCode: s, headers: HEADERS, body: JSON.stringify(d) });
const err = (m, s=400) => ({ statusCode: s, headers: HEADERS, body: JSON.stringify({ error: m }) });
const cors = ()         => ({ statusCode: 204, headers: HEADERS, body: '' });

module.exports = { getCollection, setCollection, nextId, ok, err, cors };
