/* =========================================================
   QOUWATI FEATURES
   1. "Start here" reading paths
   2. Emotion wheel (English + Arabic)
   3. "Listen to this post" (device text-to-speech, free)
   4. Deep links: #post-N, #start, #feelings, #ask, #help
   Everything runs in the browser. Nothing is sent or stored.
   ========================================================= */
(function () {
  'use strict';

  // ── Helpers ──────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function $(id) { return document.getElementById(id); }
  function sitePosts() { try { return (typeof posts !== 'undefined' && Array.isArray(posts)) ? posts : []; } catch (e) { return []; } }
  function siteTips() { try { return (typeof tips !== 'undefined' && Array.isArray(tips)) ? tips : []; } catch (e) { return []; } }
  function scrollToId(id) {
    var el = $(id); if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
  function words(s) { return String(s || '').toLowerCase().split(/[^a-z؀-ۿ]+/).filter(function (w) { return w.length > 2; }); }

  // ── Exercises (link into existing page tools) ────────────
  var EXERCISES = {
    breathing478: { label: 'Try 4-7-8 breathing', note: 'Slows your heart and quiets racing thoughts.', go: function () { useBreath('478'); } },
    breathingBox: { label: 'Try box breathing', note: 'Steady and grounding when things feel out of control.', go: function () { useBreath('box'); } },
    breathingSimple: { label: 'Take a gentle 4-4 breath', note: 'The softest place to start.', go: function () { useBreath('simple'); } },
    journal: { label: 'Open the gratitude journal', note: 'Writing it down helps you come back to it.', go: function () { scrollToId('gratitude'); setTimeout(function () { var g = $('g1'); if (g) g.focus({ preventScroll: true }); }, 700); } },
    mood: { label: 'Check in with your mood', note: 'Noticing how you feel is already a step.', go: function () { scrollToId('mood'); } }
  };
  function useBreath(pattern) {
    var sel = $('breath-type');
    if (sel) { sel.value = pattern; if (typeof window.resetBreath === 'function') window.resetBreath(); }
    scrollToId('breathing');
  }

  // ── 1. Reading paths ─────────────────────────────────────
  var PATHS = {
    anxious: {
      emoji: '🌊', label: 'Anxious', ar: 'قلقان',
      title: 'When your mind won’t slow down',
      intro: 'Anxiety is your body trying to protect you. Calm the body first, then the thoughts follow.',
      keys: 'anxiety fear overwhelming nervous safety calm emotions war',
      ex: 'breathing478',
      step: 'Name 3 things you can see and 2 you can hear. You are here, and right now you are safe.'
    },
    tired: {
      emoji: '🕯️', label: 'Exhausted', ar: 'تعبان',
      title: 'When you’re running on empty',
      intro: 'Being tired is not being lazy. It’s often your nervous system asking for rest.',
      keys: 'tired lazy burnout rest exhausted fatigue overload guilt',
      ex: 'mood',
      step: 'Take 10 minutes today to rest with no task and no guilt. Rest is recovery.'
    },
    sad: {
      emoji: '🤍', label: 'Sad or lonely', ar: 'حزين أو وحيد',
      title: 'When your heart feels heavy',
      intro: 'Sadness deserves space, not fixing. You don’t have to carry it alone.',
      keys: 'hug alone connection struggling authentic safe warmth sad',
      ex: 'breathingSimple',
      step: 'Send one message to someone you trust, even just “thinking of you.” Connection is medicine.'
    },
    news: {
      emoji: '📰', label: 'Heavy news', ar: 'الأخبار تقيلة',
      title: 'When the news is too much',
      intro: 'Caring about the world is human. Protecting your mind from it is too.',
      keys: 'war news fear safety rituals overwhelming loved',
      ex: 'breathingBox',
      step: 'Pick one time a day to check the news, and keep a small calming ritual after it.'
    },
    worth: {
      emoji: '🪞', label: 'Not enough', ar: 'مش كفاية',
      title: 'When you feel you’re not enough',
      intro: 'What you see online is a highlight reel. Your worth was never up for comparison.',
      keys: 'happiness fake validation authentic self-love confidence stigma strength human',
      ex: 'journal',
      step: 'Write one sentence to yourself the way you’d speak to a dear friend.'
    },
    sleep: {
      emoji: '🌙', label: 'Can’t sleep', ar: 'ما عم نام',
      title: 'When you can’t switch off at night',
      intro: 'A tired body with a busy mind needs a slow landing, not more effort.',
      keys: 'rest tired calm nervous system routines rituals fatigue',
      ex: 'breathing478',
      step: 'Put your phone away 20 minutes before bed and do three rounds of slow breathing.'
    },
    good: {
      emoji: '🌿', label: 'Feeling good', ar: 'منيح',
      title: 'When you’re feeling good',
      intro: 'Good days are worth noticing. Remembering them helps on the harder ones.',
      keys: 'gratitude hug connection ramadan presence strength',
      ex: 'journal',
      step: 'Write down what made today good, so you can come back to it later.'
    }
  };

  function pickPostsFor(path) {
    var keys = words(path.keys);
    var list = sitePosts().filter(function (p) { return p.status !== 'draft'; });
    var scored = list.map(function (p) {
      var w = words(p.title + ' ' + p.title + ' ' + p.tag + ' ' + p.excerpt + ' ' + (p.body || ''));
      var s = 0; keys.forEach(function (k) { if (w.some(function (x) { return x.indexOf(k) === 0; })) s++; });
      return { p: p, s: s };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; });
    var out = scored.slice(0, 3).map(function (x) { return x.p; });
    if (out.length < 2) {
      list.slice().sort(function (a, b) { return (b.views || 0) - (a.views || 0); })
        .forEach(function (p) { if (out.length < 2 && out.indexOf(p) < 0) out.push(p); });
    }
    return out;
  }
  function pickTipFor(path) {
    var keys = words(path.keys), best = null, bestS = 0;
    siteTips().forEach(function (t) {
      var w = words(t.title + ' ' + (t.description || '')), s = 0;
      keys.forEach(function (k) { if (w.some(function (x) { return x.indexOf(k) === 0; })) s++; });
      if (s > bestS) { best = t; bestS = s; }
    });
    return best;
  }

  function renderStart() {
    var grid = $('start-grid'); if (!grid) return;
    grid.innerHTML = Object.keys(PATHS).map(function (k) {
      var p = PATHS[k];
      return '<button type="button" class="st-card" data-path="' + k + '" aria-controls="start-path" aria-expanded="false">' +
        '<span class="st-emo" aria-hidden="true">' + p.emoji + '</span>' +
        '<span class="st-lbl">' + esc(p.label) + '</span>' +
        '<span class="st-ar" lang="ar">' + esc(p.ar) + '</span></button>';
    }).join('');
    grid.querySelectorAll('.st-card').forEach(function (b) {
      b.addEventListener('click', function () { openPath(b.getAttribute('data-path'), false); });
    });
  }

  function openPath(key, scroll) {
    var path = PATHS[key], box = $('start-path');
    if (!path || !box) return;
    document.querySelectorAll('.st-card').forEach(function (c) {
      var on = c.getAttribute('data-path') === key;
      c.classList.toggle('on', on); c.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    var ps = pickPostsFor(path), tip = pickTipFor(path), ex = EXERCISES[path.ex];
    var steps = ps.map(function (p, i) {
      return '<li class="sp-step"><span class="sp-n">' + (i + 1) + '</span><div class="sp-body">' +
        '<div class="sp-kind">' + (i === 0 ? 'Read first' : 'Then read') + ' · ' + esc(p.tag || '') + '</div>' +
        '<button type="button" class="sp-post" data-id="' + esc(p.id) + '">' + esc(p.title) + '</button>' +
        '<p class="sp-exc">' + esc(p.excerpt || '') + '</p></div></li>';
    }).join('');
    var n = ps.length + 1;
    steps += '<li class="sp-step"><span class="sp-n">' + n + '</span><div class="sp-body">' +
      '<div class="sp-kind">Try this</div>' +
      '<button type="button" class="btn btn-dark btn-sm sp-ex">' + esc(ex.label) + ' →</button>' +
      '<p class="sp-exc">' + esc(ex.note) + '</p></div></li>';
    steps += '<li class="sp-step"><span class="sp-n">' + (n + 1) + '</span><div class="sp-body">' +
      '<div class="sp-kind">One step for today</div><p class="sp-today">' + esc(path.step) + '</p></div></li>';

    box.innerHTML =
      '<div class="sp-head"><div><div class="sp-eyebrow">' + path.emoji + ' Your reading path</div>' +
      '<h3 class="sp-title">' + esc(path.title) + '</h3><p class="sp-intro">' + esc(path.intro) + '</p></div>' +
      '<button type="button" class="sp-close" aria-label="Close reading path">✕</button></div>' +
      '<ol class="sp-steps">' + steps + '</ol>' +
      (tip ? '<div class="sp-tip"><span aria-hidden="true">💡</span> <em>' + esc(tip.title) + '</em></div>' : '') +
      '<div class="sp-help">Thinking about harming yourself, or not safe? <button type="button" class="sp-helpbtn">Get help now</button></div>';
    box.hidden = false;

    box.querySelectorAll('.sp-post').forEach(function (b) {
      b.addEventListener('click', function () { if (typeof window.openPost === 'function') window.openPost(Number(b.getAttribute('data-id'))); });
    });
    box.querySelector('.sp-ex').addEventListener('click', ex.go);
    box.querySelector('.sp-close').addEventListener('click', function () {
      box.hidden = true;
      document.querySelectorAll('.st-card').forEach(function (c) { c.classList.remove('on'); c.setAttribute('aria-expanded', 'false'); });
      var first = document.querySelector('.st-card[data-path="' + key + '"]'); if (first) first.focus();
    });
    box.querySelector('.sp-helpbtn').addEventListener('click', function () { if (window.QouwatiChat && window.QouwatiChat.help) window.QouwatiChat.help(); });
    if (scroll !== false) scrollToId('start-path');
    else if (box.getBoundingClientRect().top > window.innerHeight - 120) scrollToId('start-path');
  }

  // Mood check-in → suggest a reading path
  var MOOD_TO_PATH = { amazing: 'good', good: 'good', tired: 'tired', anxious: 'anxious', sad: 'sad' };
  function hookMood() {
    if (typeof window.selectMood !== 'function') return;
    var original = window.selectMood;
    window.selectMood = function (btn, mood) {
      original(btn, mood);
      addMoodLink(mood);
    };
  }
  function addMoodLink(mood) {
    var r = $('mood-resp'); if (!r) return;
    var old = r.querySelector('.mood-path'); if (old) old.remove();
    var key = MOOD_TO_PATH[mood]; if (!key) return;
    var a = document.createElement('button');
    a.type = 'button'; a.className = 'mood-path';
    a.textContent = 'A reading path for you →';
    a.addEventListener('click', function () { openPath(key, true); });
    r.appendChild(document.createTextNode(' '));
    r.appendChild(a);
  }

  // ── 2. Emotion wheel ─────────────────────────────────────
  var CORES = [
    { k: 'joyful', en: 'Joyful', ar: 'فرحان', c: 'var(--fw-joy)' },
    { k: 'peaceful', en: 'Peaceful', ar: 'مطمئن', c: 'var(--fw-peace)' },
    { k: 'tired', en: 'Tired', ar: 'متعب', c: 'var(--fw-tired)' },
    { k: 'sad', en: 'Sad', ar: 'حزين', c: 'var(--fw-sad)' },
    { k: 'scared', en: 'Scared', ar: 'خائف', c: 'var(--fw-scared)' },
    { k: 'angry', en: 'Angry', ar: 'غاضب', c: 'var(--fw-angry)' }
  ];
  // en, ar, what it can feel like, what it may need, path, exercise
  var FEELINGS = {
    sad: [
      ['Lonely', 'وحيد', 'Feeling disconnected, even when people are around.', 'Connection: one small message to someone safe.', 'sad'],
      ['Hurt', 'مجروح', 'Something or someone touched a tender place.', 'Gentleness, and permission to feel it.', 'sad'],
      ['Disappointed', 'خايب أمل', 'Things didn’t turn out the way you hoped.', 'Space to let go of the hope, then one small next step.', 'sad'],
      ['Empty', 'فاضي من جوّا', 'A hollow, flat feeling where emotions used to be.', 'Rest and softness, not pressure to feel better.', 'tired'],
      ['Homesick', 'مشتاق', 'Missing a place, a person, or a version of life.', 'Honouring what you miss: a memory, a call, a photo.', 'sad']
    ],
    scared: [
      ['Anxious', 'قلقان', 'Your mind racing ahead to what might go wrong.', 'Slow the body first: breath before thoughts.', 'anxious'],
      ['Overwhelmed', 'مضغوط', 'Too much at once, with no room to breathe.', 'One thing at a time. Put the rest down for now.', 'anxious'],
      ['Unsettled by the news', 'متوتر من الأخبار', 'Heavy from what’s happening around you.', 'Limits on news, and small rituals of safety.', 'news'],
      ['Insecure', 'مش واثق بحالي', 'Doubting whether you’re good enough.', 'Kind self-talk, the way you’d speak to a friend.', 'worth'],
      ['Helpless', 'عاجز', 'Feeling like nothing you do will change things.', 'Focus on the small part that is in your hands.', 'news']
    ],
    angry: [
      ['Frustrated', 'محبط', 'Blocked from something you need or want.', 'Name what’s blocked, then find one small step around it.', null, 'breathingBox'],
      ['Irritated', 'منزعج', 'Small things are getting under your skin.', 'A pause. Irritation is often tiredness in disguise.', 'tired'],
      ['Resentful', 'مستاء', 'Carrying an unfairness that hasn’t been acknowledged.', 'Saying it out loud, to someone safe or on paper.', null, 'breathingBox'],
      ['Jealous', 'غيران', 'Wanting what someone else seems to have.', 'Curiosity: what is this feeling pointing you towards?', 'worth'],
      ['Betrayed', 'مخذول', 'Trust you gave was broken.', 'Support from someone safe, and time.', 'sad']
    ],
    tired: [
      ['Drained', 'مستنزف', 'Nothing left in the tank.', 'Rest without guilt.', 'tired'],
      ['Burned out', 'محروق نفسياً', 'Exhausted from caring or pushing for too long.', 'Real rest, and a look at what’s draining you.', 'tired'],
      ['Numb', 'متبلّد', 'Not feeling much of anything.', 'Gentle, body-based care: breath, warmth, a short walk.', 'tired'],
      ['Unmotivated', 'بلا حافز', 'Hard to start even small things.', 'Tiny steps count. Start with two minutes.', 'tired'],
      ['Sleepless', 'أرِق', 'Your body is tired but your mind won’t switch off.', 'A slow landing before bed.', 'sleep']
    ],
    joyful: [
      ['Grateful', 'ممتن', 'Noticing the good that’s here.', 'Write it down so you can return to it.', 'good'],
      ['Hopeful', 'متفائل', 'Sensing that things can get better.', 'Hold on to it, and share it with someone.', 'good'],
      ['Proud', 'فخور', 'You did something that mattered to you.', 'Let yourself feel it fully. You earned it.', 'good'],
      ['Loved', 'محبوب', 'Feeling held and cared for.', 'Notice who made you feel this way, and tell them.', 'good']
    ],
    peaceful: [
      ['Calm', 'هادي', 'Settled and unhurried.', 'Stay here a moment longer. Notice your breath.', 'good'],
      ['Content', 'راضي', 'Enough, just as things are.', 'Remember this feeling for the harder days.', 'good'],
      ['Safe', 'بأمان', 'Your body can let its guard down.', 'Rest into it. This is what your nervous system needs.', 'good'],
      ['Relieved', 'مرتاح', 'A weight has lifted.', 'Breathe out fully, and let your shoulders drop.', 'good']
    ]
  };

  var currentCore = null;
  function renderWheel() {
    var host = $('fw-wheel'); if (!host) return;
    var R = 150, r = 58, cx = 160, cy = 160, n = CORES.length, seg = (Math.PI * 2) / n;
    function pt(rad, a) { return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; }
    var svg = '<svg viewBox="0 0 320 320" class="fw-svg" role="group" aria-label="Emotion wheel: choose a feeling">';
    CORES.forEach(function (c, i) {
      var a0 = -Math.PI / 2 + i * seg + 0.012, a1 = a0 + seg - 0.024, am = (a0 + a1) / 2;
      var p0 = pt(R, a0), p1 = pt(R, a1), q1 = pt(r, a1), q0 = pt(r, a0), m = pt((R + r) / 2 + 4, am);
      var d = 'M' + p0 + ' A' + R + ',' + R + ' 0 0 1 ' + p1 + ' L' + q1 + ' A' + r + ',' + r + ' 0 0 0 ' + q0 + 'Z';
      svg += '<g class="fw-seg" data-core="' + c.k + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + c.en + ', ' + c.ar + '">' +
        '<path d="' + d + '" style="fill:' + c.c + '"/>' +
        '<text x="' + m[0].toFixed(1) + '" y="' + (m[1] - 3).toFixed(1) + '" class="fw-en">' + c.en + '</text>' +
        '<text x="' + m[0].toFixed(1) + '" y="' + (m[1] + 15).toFixed(1) + '" class="fw-ar">' + c.ar + '</text></g>';
    });
    svg += '<circle cx="160" cy="160" r="52" class="fw-hub"/><text x="160" y="156" class="fw-hub-t" id="fw-hub-t">How do</text><text x="160" y="174" class="fw-hub-t" id="fw-hub-t2">you feel?</text></svg>';
    host.innerHTML = svg;
    host.querySelectorAll('.fw-seg').forEach(function (g) {
      g.addEventListener('click', function () { chooseCore(g.getAttribute('data-core')); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseCore(g.getAttribute('data-core')); } });
    });
  }

  function chooseCore(k) {
    currentCore = k;
    var core = CORES.filter(function (c) { return c.k === k; })[0];
    document.querySelectorAll('.fw-seg').forEach(function (g) {
      var on = g.getAttribute('data-core') === k;
      g.classList.toggle('on', on); g.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $('fw-hub-t').textContent = core.en; $('fw-hub-t2').textContent = core.ar;
    var list = FEELINGS[k] || [];
    var box = $('fw-detail');
    box.innerHTML = '<div class="fw-q">' + esc(core.en) + ' <span lang="ar">' + esc(core.ar) + '</span> · which feels closest?</div>' +
      '<div class="fw-chips" role="group" aria-label="More specific feelings">' + list.map(function (f, i) {
        return '<button type="button" class="fw-chip" data-i="' + i + '" style="--chip:' + core.c + '">' + esc(f[0]) + ' <span lang="ar">' + esc(f[1]) + '</span></button>';
      }).join('') + '</div><div id="fw-card" aria-live="polite"></div>';
    box.querySelectorAll('.fw-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        box.querySelectorAll('.fw-chip').forEach(function (x) { x.classList.toggle('on', x === b); });
        showFeeling(list[Number(b.getAttribute('data-i'))], core);
      });
    });
  }

  function showFeeling(f, core) {
    var path = f[4] ? PATHS[f[4]] : null, ex = EXERCISES[f[5] || (path && path.ex)];
    var card = $('fw-card');
    card.innerHTML = '<div class="fw-card" style="--chip:' + core.c + '">' +
      '<div class="fw-name">' + esc(f[0]) + ' <span lang="ar">' + esc(f[1]) + '</span></div>' +
      '<p><strong>What it can feel like:</strong> ' + esc(f[2]) + '</p>' +
      '<p><strong>What it may need:</strong> ' + esc(f[3]) + '</p>' +
      '<p class="fw-valid">Naming a feeling is the first step to caring for it. Every feeling is allowed.</p>' +
      '<div class="fw-acts">' +
      (path ? '<button type="button" class="btn btn-dark btn-sm fw-path">See your reading path →</button>' : '') +
      (ex ? '<button type="button" class="btn btn-outline btn-sm fw-ex">' + esc(ex.label) + '</button>' : '') +
      '</div></div>';
    if (path) card.querySelector('.fw-path').addEventListener('click', function () { openPath(f[4], true); });
    if (ex) card.querySelector('.fw-ex').addEventListener('click', ex.go);
  }

  // ── 3. Listen to this post ───────────────────────────────
  var synth = window.speechSynthesis;
  var listen = { queue: [], active: false, paused: false };
  function listenBar() {
    var bar = $('m-listen');
    if (bar) return bar;
    var content = $('m-content'); if (!content) return null;
    bar = document.createElement('div');
    bar.id = 'm-listen'; bar.className = 'ls-bar';
    bar.innerHTML = '<button type="button" class="ls-btn" id="ls-play" aria-label="Listen to this post">🔊 Listen</button>' +
      '<button type="button" class="ls-btn ls-stop" id="ls-stop" hidden aria-label="Stop listening">■ Stop</button>' +
      '<span class="ls-note" id="ls-note" aria-live="polite"></span>';
    content.parentNode.insertBefore(bar, content);
    $('ls-play').addEventListener('click', togglePlay);
    $('ls-stop').addEventListener('click', stopListen);
    return bar;
  }
  function pickVoice(lang) {
    var vs = synth.getVoices() || [];
    var match = vs.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(lang) === 0; });
    if (!match.length) return null;
    return match.filter(function (v) { return v.localService; })[0] || match[0];
  }
  function chunks(text) {
    // (no regex lookbehind: it breaks older iPhones)
    var parts = text.replace(/([.!?؟…])\s+/g, '$1\n').split(/\n+/), out = [], cur = '';
    parts.forEach(function (s) {
      s = s.trim(); if (!s) return;
      if ((cur + ' ' + s).length > 220 && cur) { out.push(cur); cur = s; } else cur = cur ? cur + ' ' + s : s;
    });
    if (cur) out.push(cur);
    return out;
  }
  function setLabels() {
    var play = $('ls-play'), stop = $('ls-stop'); if (!play) return;
    play.textContent = !listen.active ? '🔊 Listen' : (listen.paused ? '▶ Resume' : '⏸ Pause');
    play.setAttribute('aria-label', !listen.active ? 'Listen to this post' : (listen.paused ? 'Resume' : 'Pause'));
    stop.hidden = !listen.active;
  }
  function togglePlay() {
    if (!listen.active) return startListen();
    if (listen.paused) { synth.resume(); listen.paused = false; } else { synth.pause(); listen.paused = true; }
    setLabels();
  }
  function startListen() {
    var title = ($('m-title') || {}).textContent || '';
    var body = ($('m-content') || {}).innerText || '';
    var text = (title + '.\n' + body).replace(/\p{Extended_Pictographic}|️|‍/gu, '').replace(/\*\*/g, '');
    var lang = /[؀-ۿ]/.test(text) && (text.match(/[؀-ۿ]/g) || []).length > text.length * 0.3 ? 'ar' : 'en';
    var voice = pickVoice(lang);
    var note = $('ls-note');
    if (!voice && lang === 'ar') { note.textContent = 'Your device doesn’t have an Arabic voice installed.'; return; }
    note.textContent = '';
    synth.cancel();
    listen.queue = chunks(text); listen.active = true; listen.paused = false;
    setLabels();
    speakNext(voice, lang);
  }
  function speakNext(voice, lang) {
    if (!listen.active) return;
    var part = listen.queue.shift();
    if (!part) { stopListen(); return; }
    var u = new SpeechSynthesisUtterance(part);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : (lang === 'ar' ? 'ar' : 'en-US');
    u.rate = 0.95;
    u.onend = function () { speakNext(voice, lang); };
    u.onerror = function (e) { if (e.error !== 'interrupted' && e.error !== 'canceled') { var n = $('ls-note'); if (n) n.textContent = 'Could not play audio on this device.'; } stopListen(); };
    synth.speak(u);
  }
  function stopListen() {
    listen.active = false; listen.paused = false; listen.queue = [];
    if (synth) synth.cancel();
    setLabels();
  }
  function hookModal() {
    if (!synth || typeof window.openPost !== 'function') return;
    var open = window.openPost, close = window.closeModal;
    window.openPost = function (id) {
      stopListen();
      var r = open.apply(this, arguments);
      Promise.resolve(r).then(function () {
        var bar = listenBar(); if (!bar) return;
        var n = $('ls-note'); if (n) n.textContent = '';
        bar.hidden = !(($('m-content') || {}).textContent || '').trim();
        setLabels();
      });
      return r;
    };
    window.closeModal = function () {
      stopListen();
      if (/^#post-\d+$/.test(location.hash) && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      return close.apply(this, arguments);
    };
    if (synth.getVoices) synth.getVoices(); // warm up voice list
    window.addEventListener('pagehide', stopListen);
  }

  // ── 4. Deep links (#post-3, #start, #feelings, #ask, #help) ──
  function handleHash() {
    var h = location.hash;
    var m = h.match(/^#post-(\d+)$/);
    if (m && typeof window.openPost === 'function') { window.openPost(Number(m[1])); return; }
    if (h === '#ask' && window.QouwatiChat) { window.QouwatiChat.open(); return; }
    if (h === '#help' && window.QouwatiChat && window.QouwatiChat.help) { window.QouwatiChat.help(); return; }
    var p = h.match(/^#path-(\w+)$/);
    if (p && PATHS[p[1]]) openPath(p[1], true);
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    renderStart();
    renderWheel();
    hookMood();
    hookModal();
    setTimeout(handleHash, 300);
    window.addEventListener('hashchange', handleHash);
    // Returning visitor who already checked in today: offer their path too
    setTimeout(function () {
      try {
        var today = new Date().toISOString().split('T')[0];
        var e = (typeof moodLog !== 'undefined' && Array.isArray(moodLog)) ? moodLog.filter(function (m) { return m.date === today; })[0] : null;
        if (e) addMoodLink(e.mood);
      } catch (err) { /* ignore */ }
    }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.QouwatiFeatures = { openPath: openPath, paths: PATHS };
})();
