/* ===================================================================
   GNOSIS: A READING SERIES, shared.js
   Each page sets window.GNOSIS_PART before this script loads.
   Schema:
     window.GNOSIS_PART = {
       number: 1..5 or 'index',
       title: 'string',
       systemPrompt: 'string, Sophia's system prompt for this page',
       chips: [{ label, q }], optional starter questions
     }
   =================================================================== */

(function () {
  // === PROGRESS BAR ===
  const progress = document.getElementById('progress');
  if (progress) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = pct + '%';
    });
  }

  // === SCROLL-REVEAL FOR PART CARDS (index) ===
  const partCards = document.querySelectorAll('.part-card');
  if (partCards.length) {
    const partObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
      });
    }, { threshold: 0.15 });
    partCards.forEach(c => partObserver.observe(c));
  }

  // === ICON GRID FADE-IN ===
  const iconCells = document.querySelectorAll('.icon-cell');
  if (iconCells.length) {
    iconCells.forEach((c, i) => {
      c.style.animationDelay = (i * 0.08) + 's';
    });
    const cellObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.15 });
    iconCells.forEach(c => cellObserver.observe(c));
  }

  // === AI COMPANION ===
  const chatLog = document.getElementById('chatLog');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');

  if (!chatLog || !userInput || !sendBtn) return; // no companion on this page

  const PART = window.GNOSIS_PART || {};
  const systemPrompt = PART.systemPrompt || 'You are a thoughtful reading companion. Answer briefly and directly. No em dashes.';

  let history = [];

  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'msg msg-you' : 'msg msg-claude';
    const label = role === 'user' ? 'You' : 'Sophia';
    // basic escape so SVG/HTML in answers doesn't break the page
    const safe = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    div.innerHTML = `<div class="msg-label">${label}</div><div>${safe}</div>`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'msg msg-claude';
    div.id = 'typingIndicator';
    div.innerHTML = `<div class="msg-label">Sophia</div><div class="typing">...</div>`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  async function askSophia(question) {
    addMessage('user', question);
    history.push({ role: 'user', content: question });
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;
    showTyping();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: history
        })
      });

      const data = await response.json();
      hideTyping();

      const text = (data.content || [])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n')
        .trim();

      if (text) {
        addMessage('assistant', text);
        history.push({ role: 'assistant', content: text });
      } else {
        addMessage('assistant', 'Something went quiet on my end. Try asking again.');
      }
    } catch (e) {
      hideTyping();
      addMessage('assistant', 'I could not reach my source right now. Try again in a moment.');
      console.error(e);
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', () => {
    const q = userInput.value.trim();
    if (q) askSophia(q);
  });

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const q = userInput.value.trim();
      if (q) askSophia(q);
    }
  });

  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
  });

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q;
      if (q) askSophia(q);
    });
  });
})();
