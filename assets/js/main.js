/* =========================================================
   MONK — $monk
   Edit the two values below and the whole site updates.
   ========================================================= */
const MONK = {
  // Solana contract address (placeholder — replace with the real mint)
  ca: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // Telegram invite URL (placeholder — replace with the real group or channel)
  telegram: 'https://t.me/'
};

(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- inject config ---------- */
  $$('[data-ca]').forEach(el => { el.textContent = MONK.ca; });
  $$('[data-tg]').forEach(el => { el.setAttribute('href', MONK.telegram); });

  /* ---------- sticky nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#menu');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    } else {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { menu.hidden = true; }, 400);
    }
  }

  if (burger && menu) {
    burger.addEventListener('click', () => {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) setMenu(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1000 && !menu.hidden) setMenu(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  const targets = $$('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(el => io.observe(el));
  }

  /* ---------- copy contract ---------- */
  const toast = $('#toast');
  let toastTimer;
  function say(message) {
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  }

  function legacyCopy(text) {
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('execCommand copy failed'));
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
  }

  $$('[data-copy]').forEach(btn => {
    const label = $('.ca__btnText', btn);
    btn.addEventListener('click', () => {
      copyText(MONK.ca).then(() => {
        btn.classList.add('is-done');
        label.textContent = 'Copied';
        say('Contract address copied');
        setTimeout(() => {
          btn.classList.remove('is-done');
          label.textContent = 'Copy';
        }, 2200);
      }).catch(() => say('Copy failed — select it by hand'));
    });
  });

  /* ---------- gallery rail: drag, wheel, progress ---------- */
  const rail = $('#rail');
  const bar  = $('#railBar');

  if (rail) {
    const prevBtn = $('[data-rail="-1"]');
    const nextBtn = $('[data-rail="1"]');
    let down = false, startX = 0, startLeft = 0, moved = 0;

    const maxScroll = () => Math.max(0, rail.scrollWidth - rail.clientWidth);

    // one card plus the gap it sits next to
    function stepSize() {
      const card = $('.card', rail);
      if (!card) return rail.clientWidth * 0.8;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function sync() {
      const max = maxScroll();
      const ratio = max > 0 ? rail.scrollLeft / max : 0;
      const travel = Math.max(0, bar.parentElement.clientWidth - bar.offsetWidth);
      bar.style.transform = 'translateX(' + (ratio * travel) + 'px)';
      if (prevBtn) prevBtn.disabled = rail.scrollLeft <= 1;
      if (nextBtn) nextBtn.disabled = rail.scrollLeft >= max - 1;
    }
    sync();
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);

    /* arrows */
    [prevBtn, nextBtn].forEach(b => {
      if (!b) return;
      b.addEventListener('click', () => {
        const dir = Number(b.getAttribute('data-rail'));
        rail.scrollBy({ left: dir * stepSize(), behavior: reduced ? 'auto' : 'smooth' });
      });
    });

    /* drag with a mouse or pen — touch keeps its native scrolling */
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      if (e.button !== 0) return;
      down = true; moved = 0;
      startX = e.clientX;
      startLeft = rail.scrollLeft;
      rail.classList.add('is-dragging');
      try { rail.setPointerCapture(e.pointerId); } catch (err) { /* not critical */ }
    });

    rail.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      rail.scrollLeft = startLeft - dx;
      if (moved > 4) e.preventDefault();
    });

    function release(e) {
      if (!down) return;
      down = false;
      rail.classList.remove('is-dragging');
      if (e) { try { rail.releasePointerCapture(e.pointerId); } catch (err) { /* not critical */ } }
    }
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    window.addEventListener('blur', () => release());

    // swallow the click that ends a real drag
    rail.addEventListener('click', (e) => {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    // vertical wheel scrolls the rail sideways while the pointer is over it
    rail.addEventListener('wheel', (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      const max = maxScroll();
      const next = Math.min(max, Math.max(0, rail.scrollLeft + delta));
      // hand the wheel back to the page once the rail has run out of room
      if (next === rail.scrollLeft) return;
      e.preventDefault();
      rail.scrollLeft = next;
    }, { passive: false });

    rail.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { rail.scrollBy({ left: stepSize(), behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { rail.scrollBy({ left: -stepSize(), behavior: 'smooth' }); e.preventDefault(); }
    });
  }

  /* ---------- lightbox ---------- */
  const box = $('#lightbox');
  const boxImg = $('#lightboxImg');
  let lastFocus = null;

  function openBox(src, alt) {
    lastFocus = document.activeElement;
    boxImg.src = src;
    boxImg.alt = alt || '';
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', box).focus();
  }
  function closeBox() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { box.hidden = true; boxImg.src = ''; }, 320);
    if (lastFocus) lastFocus.focus();
  }

  $$('[data-zoom]').forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.parentElement.querySelector('img');
      openBox(btn.getAttribute('data-zoom'), img ? img.alt : '');
    });
  });
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.closest('.lightbox__close')) closeBox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !box.hidden) closeBox();
  });

  /* ---------- the practice: guided breath ---------- */
  const orb    = $('#orb');
  const word   = $('#orbWord');
  const btn    = $('#breathBtn');
  const tally  = $('#breathTally');
  const reward = $('#breathReward');

  if (orb && btn) {
    const rings = $$('.orb__ring', orb);
    const PHASES = [
      { word: 'Breathe in', ms: 4200, small: 1.00, large: 1.06 },
      { word: 'Hold',       ms: 1400, small: 1.00, large: 1.06 },
      { word: 'Let go',     ms: 6000, small: 0.62, large: 0.66 }
    ];
    let running = false, step = 0, breaths = 0, timer = null;

    function setRings(a, b, ms) {
      rings[0].style.transitionDuration = ms + 'ms';
      rings[0].style.transform = 'scale(' + a + ')';
      if (rings[1]) {
        rings[1].style.transitionDuration = ms + 'ms';
        rings[1].style.transform = 'scale(' + b + ')';
      }
    }

    function tick() {
      const phase = PHASES[step];
      word.textContent = phase.word;
      setRings(phase.small, phase.large, phase.ms);
      timer = setTimeout(() => {
        step = (step + 1) % PHASES.length;
        if (step === 0) {
          breaths++;
          tally.textContent = 'Breaths taken — ' + breaths;
          if (breaths === 7) reward.hidden = false;
        }
        if (running) tick();
      }, phase.ms);
    }

    function stop() {
      running = false;
      clearTimeout(timer);
      step = 0;
      word.textContent = 'Still';
      setRings(0.62, 0.66, 900);
      btn.textContent = 'Begin sitting';
    }

    btn.addEventListener('click', () => {
      if (running) { stop(); return; }
      running = true;
      btn.textContent = 'Stop sitting';
      if (reduced) {
        word.textContent = 'Breathe';
        return;
      }
      tick();
    });
  }
})();
