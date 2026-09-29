/* =========================================================
   ASK QOUWATI — AI guide widget (front end)
   - Conversation lives in memory only (never saved to the device or server).
   - "Get help now" works offline and never calls the AI.
   - Talks to /api/chat (netlify/functions/chat.mjs).
   ========================================================= */
(function () {
  'use strict';

  // Keep in sync with HELPLINES in netlify/functions/chat.mjs
  var HELPLINES = [
    { label: 'Lebanon — National Lifeline (Embrace)', number: '1564', note: 'Emotional support & suicide prevention' },
    { label: 'Lebanon — KAFA helpline', number: '03 018 019', note: 'If someone is hurting you · 24/7' },
    { label: 'Lebanon — Emergency', number: '112', note: 'Police / Red Cross: 140' },
    { label: 'UAE — Mental Support Line', number: '800 4673', note: '800-HOPE · 8am–8pm' }
  ];
  var HELP_TEXT = "If you're struggling or not safe, please talk to a real person now. These lines are free and confidential. If you're in immediate danger, call emergency services or go to the nearest emergency room.";
  var STARTERS = [
    'I feel anxious lately',
    "I'm exhausted all the time",
    'How do I stop faking happiness?',
    'بحس حالي تعبان كتير'
  ];
  var MAX = 600;

  var history = [];   // [{role, content}] — memory only
  var busy = false;
  var lastFocus = null;

  // ── Build DOM ─────────────────────────────────────────────
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  var launch = el('button', { class: 'qc-launch', type: 'button', 'aria-haspopup': 'dialog', 'aria-controls': 'qc-panel' },
    '<span class="qc-launch-ico" aria-hidden="true">✦</span><span class="qc-launch-txt">Ask Qouwati</span><span class="qc-sr">Open the Ask Qouwati assistant</span>');

  var panel = el('div', { class: 'qc-panel', id: 'qc-panel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'qc-title', 'aria-hidden': 'true' });
  panel.innerHTML =
    '<div class="qc-head">' +
      '<div class="qc-av" aria-hidden="true">ق</div>' +
      '<div class="qc-titles"><div class="qc-title" id="qc-title">Ask Qouwati</div><div class="qc-sub">Guide to Aya’s writing</div></div>' +
      '<button type="button" class="qc-hbtn" id="qc-clear" title="Start a new conversation">New chat</button>' +
      '<button type="button" class="qc-hbtn qc-x" id="qc-close" aria-label="Close assistant">✕</button>' +
    '</div>' +
    '<div class="qc-note"><span>I’m an automated guide, not Aya and not a therapist. I answer from Aya’s posts.</span>' +
      '<button type="button" class="qc-help" id="qc-help">Get help now</button></div>' +
    '<div class="qc-log" id="qc-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
    '<form class="qc-form" id="qc-form" autocomplete="off">' +
      '<label for="qc-input" class="qc-sr">Your message</label>' +
      '<textarea class="qc-input" id="qc-input" rows="1" maxlength="' + MAX + '" dir="auto" placeholder="Ask about stress, rest, self-love…"></textarea>' +
      '<button type="submit" class="qc-send" id="qc-send" aria-label="Send">➤</button>' +
    '</form>' +
    '<div class="qc-foot">Conversations aren’t saved. Not medical advice.</div>';

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  var log = panel.querySelector('#qc-log');
  var form = panel.querySelector('#qc-form');
  var input = panel.querySelector('#qc-input');
  var send = panel.querySelector('#qc-send');

  // ── Rendering (all text escaped before formatting) ─────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function format(text) {
    var blocks = esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').split(/\n{2,}/);
    return blocks.map(function (b) {
      var lines = b.split('\n');
      if (lines.every(function (l) { return /^\s*[-•*]\s+/.test(l); })) {
        return '<ul>' + lines.map(function (l) { return '<li>' + l.replace(/^\s*[-•*]\s+/, '') + '</li>'; }).join('') + '</ul>';
      }
      return '<p>' + lines.join('<br>') + '</p>';
    }).join('');
  }
  function scroll() { log.scrollTop = log.scrollHeight; }

  function addUser(text) {
    var m = el('div', { class: 'qc-msg qc-user', dir: 'auto' }, format(text));
    log.appendChild(m); scroll();
  }
  var TOOLS = {
    breathing: { id: 'breathing', en: '🌬️ Breathing exercise', ar: '🌬️ تمرين التنفّس' },
    journal: { id: 'gratitude', en: '✍️ Gratitude journal', ar: '✍️ دفتر الامتنان' },
    mood: { id: 'mood', en: '🙂 Mood check-in', ar: '🙂 متابعة المزاج' }
  };
  function addBot(text, sources, contact, tool) {
    var m = el('div', { class: 'qc-msg qc-bot', dir: 'auto' }, format(text));
    var ar = /[؀-ۿ]/.test(text || '');
    if ((sources && sources.length) || contact || TOOLS[tool]) {
      var wrap = el('div', { class: 'qc-srcs' });
      (sources || []).forEach(function (s) {
        var b = el('button', { type: 'button', class: 'qc-src', dir: 'auto' }, '📖 ' + esc(s.title));
        b.addEventListener('click', function () { openSource(s.id); });
        wrap.appendChild(b);
      });
      if (TOOLS[tool]) {
        var t = el('button', { type: 'button', class: 'qc-src' }, esc(ar ? TOOLS[tool].ar : TOOLS[tool].en));
        t.addEventListener('click', function () { goSection(TOOLS[tool].id); });
        wrap.appendChild(t);
      }
      if (contact) {
        var c = el('button', { type: 'button', class: 'qc-src' }, ar ? '✉️ تواصل مع آية' : '✉️ Contact Aya');
        c.addEventListener('click', function () { goSection('contact'); });
        wrap.appendChild(c);
      }
      m.appendChild(wrap);
    }
    log.appendChild(m); scroll();
  }
  function addCrisis(text, lines, isArabic) {
    var box = el('div', { class: 'qc-crisis', role: 'alert', dir: isArabic ? 'rtl' : 'ltr' });
    box.innerHTML = '<div class="qc-crisis-h">' + (isArabic ? 'أنت مش لحالك' : 'You don’t have to face this alone') + '</div>' +
      '<p>' + esc(text) + '</p>';
    var list = el('div', { class: 'qc-lines' });
    (lines || HELPLINES).forEach(function (h) {
      var a = el('a', { class: 'qc-line', href: 'tel:' + String(h.number).replace(/[^\d+]/g, '') },
        '<span class="qc-line-l">' + esc(h.label) + '<span class="qc-line-n">' + esc(h.note || '') + '</span></span>' +
        '<span class="qc-line-num">' + esc(h.number) + '</span>');
      list.appendChild(a);
    });
    box.appendChild(list);
    log.appendChild(box);
    log.scrollTop = box.offsetTop - log.offsetTop - 8; // show the heading first
  }
  function addError(text) {
    log.appendChild(el('div', { class: 'qc-err', role: 'status' }, esc(text))); scroll();
  }
  function welcome() {
    log.innerHTML = '';
    addBot("Hi, I'm Ask Qouwati 🌿 I can help you find what Aya has written about how you're feeling — in English or Arabic. What's on your mind?");
    var s = el('div', { class: 'qc-starters' });
    STARTERS.forEach(function (t) {
      var b = el('button', { type: 'button', class: 'qc-starter', dir: 'auto' }, esc(t));
      b.addEventListener('click', function () { s.remove(); ask(t); });
      s.appendChild(b);
    });
    log.appendChild(s);
  }
  function typing(on) {
    var t = log.querySelector('.qc-typing');
    if (on && !t) { log.appendChild(el('div', { class: 'qc-typing', 'aria-label': 'Ask Qouwati is typing' }, '<span></span><span></span><span></span>')); scroll(); }
    if (!on && t) t.remove();
  }

  // ── Actions ───────────────────────────────────────────────
  function openSource(id) {
    close(false);
    if (typeof window.openPost === 'function') window.openPost(id);
  }
  function goSection(id) {
    close(false);
    var s = document.getElementById(id);
    if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function ask(text) {
    text = String(text || '').trim().slice(0, MAX);
    if (!text || busy) return;
    var starters = log.querySelector('.qc-starters'); if (starters) starters.remove();
    addUser(text);
    history.push({ role: 'user', content: text });
    busy = true; send.disabled = true; typing(true);

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-8) })
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, d: d }; });
      })
      .then(function (res) {
        typing(false);
        var d = res.d || {};
        if (res.ok && d.type === 'crisis') {
          addCrisis(d.reply, d.helplines, d.lang === 'ar');
          // Keep the model out of the crisis turn: drop it from history.
          history.pop();
        } else if (res.ok && d.type === 'answer') {
          addBot(d.reply, d.sources, d.contact, d.tool);
          history.push({ role: 'assistant', content: d.reply });
        } else {
          history.pop();
          addError(d.error || (res.status === 429 ? 'Too many messages — please wait a minute.' : 'Something went wrong. Please try again.'));
        }
      })
      .catch(function () {
        typing(false); history.pop();
        addError(navigator.onLine === false ? "You're offline. The “Get help now” numbers still work." : 'Could not reach the assistant. Please try again.');
      })
      .then(function () { busy = false; send.disabled = false; input.focus(); });
  }

  function open() {
    lastFocus = document.activeElement;
    if (!log.childElementCount) welcome();
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    launch.hidden = true;
    launch.setAttribute('aria-expanded', 'true');
    setTimeout(function () { input.focus(); }, 60);
  }
  function close(restoreFocus) {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    launch.hidden = false;
    launch.setAttribute('aria-expanded', 'false');
    if (restoreFocus !== false) (lastFocus && lastFocus.focus ? lastFocus : launch).focus();
  }

  // ── Events ────────────────────────────────────────────────
  launch.addEventListener('click', open);
  panel.querySelector('#qc-close').addEventListener('click', function () { close(); });
  panel.querySelector('#qc-clear').addEventListener('click', function () { history = []; welcome(); input.value = ''; input.focus(); });
  panel.querySelector('#qc-help').addEventListener('click', function () { addCrisis(HELP_TEXT, HELPLINES, false); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; autosize(); ask(v); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); }
  });
  function autosize() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; }
  input.addEventListener('input', autosize);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !panel.classList.contains('open')) return;
    var modal = document.getElementById('blog-modal');
    if (modal && modal.classList.contains('open')) return;
    close();
  });

  // Public hook, e.g. <a href="#" onclick="QouwatiChat.open()">
  function help() { open(); addCrisis(HELP_TEXT, HELPLINES, false); }
  window.QouwatiChat = { open: open, close: close, help: help };
})();
