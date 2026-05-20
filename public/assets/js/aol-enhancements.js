(function () {
  'use strict';

  function runSafely(fn) {
    try {
      return fn();
    } catch (e) {
      return undefined;
    }
  }

  var MOBILE_MAX = 767;

  /* AOL Enhancement: Scroll progress bar (Section H) */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'aol-scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var onScroll = function () {
      try {
        var h = document.documentElement;
        var st = h.scrollTop || document.body.scrollTop;
        var max = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
        var p = max > 0 ? st / max : 0;
        bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0.001, p)) + ')';
      } catch (e) {}
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* AOL Enhancement: Scroll-to-top (Section E) */
  function initScrollTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'aol-scroll-top-btn';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    });
    var vis = false;
    window.addEventListener(
      'scroll',
      function () {
        try {
          var h = document.documentElement;
          var st = h.scrollTop || document.body.scrollTop;
          var max = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
          var ratio = max > 0 ? st / max : 0;
          var next = ratio >= 0.8;
          if (next !== vis) {
            vis = next;
            btn.classList.toggle('aol-scroll-top-btn--visible', vis);
          }
        } catch (e) {}
      },
      { passive: true }
    );
  }

  /* AOL Enhancement: Footer accordion (Section C) */
  function isMobileViewport() {
    return typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX;
  }

  function getHeadingPanelPairs(footer) {
    var pairs = [];
    try {
      footer.querySelectorAll('.aol-footer-column').forEach(function (col) {
        var head = col.querySelector('.aol-footer-section-heading');
        var panel = col.querySelector('.aol-footer-panel');
        if (head && panel) pairs.push({ head: head, panel: panel });
      });
    } catch (e) {}
    return pairs;
  }

  function teardownAccordion(pairs) {
    pairs.forEach(function (p) {
      try {
        var h = p.head;
        var panel = p.panel;
        panel.classList.remove('aol-footer-panel--collapsed');
        h.classList.remove('aol-footer-accordion-active');
        h.removeAttribute('role');
        h.removeAttribute('tabindex');
        h.removeAttribute('aria-expanded');
        h.removeAttribute('aria-controls');
        if (h._aolAccordionClick) {
          h.removeEventListener('click', h._aolAccordionClick);
          h.removeEventListener('keydown', h._aolAccordionKey);
          delete h._aolAccordionClick;
          delete h._aolAccordionKey;
        }
      } catch (e) {}
    });
  }

  function setupAccordion(pairs) {
    pairs.forEach(function (p) {
      try {
        var h = p.head;
        var panel = p.panel;
        if (!panel.id) return;
        h.classList.add('aol-footer-accordion-active');
        h.setAttribute('role', 'button');
        h.setAttribute('tabindex', '0');
        h.setAttribute('aria-expanded', 'true');
        h.setAttribute('aria-controls', panel.id);
        h._aolAccordionClick = function () {
          try {
            if (!isMobileViewport()) return;
            var open = h.getAttribute('aria-expanded') === 'true';
            var next = !open;
            h.setAttribute('aria-expanded', next ? 'true' : 'false');
            panel.classList.toggle('aol-footer-panel--collapsed', !next);
          } catch (err) {}
        };
        h._aolAccordionKey = function (ev) {
          try {
            if (!isMobileViewport()) return;
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              h._aolAccordionClick();
            }
          } catch (err) {}
        };
        h.addEventListener('click', h._aolAccordionClick);
        h.addEventListener('keydown', h._aolAccordionKey);
      } catch (e) {}
    });
  }

  function applyMobileAccordion(footer) {
    var pairs = getHeadingPanelPairs(footer);
    teardownAccordion(pairs);
    if (isMobileViewport()) setupAccordion(pairs);
  }

  var resizeTimer = null;
  function bindFooterAccordion(footer) {
    if (footer.getAttribute('data-aol-footer-section-c') === '1') return;
    footer.setAttribute('data-aol-footer-section-c', '1');
    applyMobileAccordion(footer);
    window.addEventListener('resize', function () {
      try {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          applyMobileAccordion(footer);
          resizeTimer = null;
        }, 150);
      } catch (e) {}
    });
  }

  /* AOL Enhancement: Trust signals (Section B) */
  function initTrustBadges() {
    var mount = document.getElementById('aol-footer-trust-mount');
    if (!mount || mount.childNodes.length) return;
    var row = document.createElement('div');
    row.className = 'aol-trust-row';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Trust badges');

    function badge(svg, text) {
      var d = document.createElement('div');
      d.className = 'aol-trust-badge';
      d.appendChild(svg);
      var t = document.createElement('span');
      t.textContent = text;
      d.appendChild(t);
      return d;
    }
    var lock = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lock.setAttribute('width', '16');
    lock.setAttribute('height', '16');
    lock.setAttribute('viewBox', '0 0 24 24');
    lock.setAttribute('aria-hidden', 'true');
    lock.innerHTML =
      '<rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.5"/>';
    row.appendChild(badge(lock, 'SSL Secured'));
    var s1981 = document.createElement('div');
    s1981.className = 'aol-trust-badge';
    s1981.textContent = 'Since 1981';
    row.appendChild(s1981);
    var c180 = document.createElement('div');
    c180.className = 'aol-trust-badge';
    c180.textContent = '180+ Countries';
    row.appendChild(c180);
    mount.appendChild(row);

    var pay = document.createElement('div');
    pay.className = 'aol-trust-payment-row';
    var payLabel = document.createElement('span');
    payLabel.textContent = 'Secure Payments';
    pay.appendChild(payLabel);

    var upi = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    upi.setAttribute('width', '48');
    upi.setAttribute('height', '28');
    upi.setAttribute('aria-label', 'UPI');
    upi.innerHTML =
      '<rect width="48" height="28" rx="4" fill="#fff"/><text x="24" y="18" text-anchor="middle" font-size="10" fill="#222">UPI</text>';
    pay.appendChild(upi);

    function payBadge(label) {
      var s = document.createElement('span');
      s.className = 'aol-trust-badge';
      s.textContent = label;
      return s;
    }
    pay.appendChild(payBadge('Visa'));
    pay.appendChild(payBadge('Mastercard'));
    pay.appendChild(payBadge('RuPay'));
    mount.appendChild(pay);

    var social = document.createElement('div');
    social.className = 'aol-trust-social';
    social.innerHTML =
      '<span>10 Million+ Students Worldwide — </span><span class="aol-trust-counter" data-aol-counter-target="10000000" data-aol-counter-suffix="+">0</span>';
    mount.appendChild(social);

    var counterEl = social.querySelector('.aol-trust-counter');
    if (counterEl && 'IntersectionObserver' in window) {
      var cob = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            cob.disconnect();
            var target = parseInt(counterEl.getAttribute('data-aol-counter-target') || '0', 10);
            var suffix = counterEl.getAttribute('data-aol-counter-suffix') || '';
            var start = performance.now();
            var dur = 2200;
            function frame(now) {
              try {
                var t = Math.min(1, (now - start) / dur);
                var eased = 1 - (1 - t) * (1 - t);
                var val = Math.floor(target * eased);
                counterEl.textContent = val.toLocaleString() + suffix;
                if (t < 1) requestAnimationFrame(frame);
              } catch (e) {}
            }
            requestAnimationFrame(frame);
          });
        },
        { threshold: 0.2 }
      );
      cob.observe(counterEl);
    }
  }

  /* AOL Enhancement: Language switcher cookie + html lang (Section D) */
  function getCookie(name) {
    try {
      if (typeof document === 'undefined') return '';
      var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : '';
    } catch (e) {
      return '';
    }
  }

  function setCookie(name, value, days) {
    try {
      var d = new Date();
      d.setTime(d.getTime() + days * 864e5);
      document.cookie = name + '=' + encodeURIComponent(value) + ';path=/;SameSite=Lax;expires=' + d.toUTCString();
    } catch (e) {}
  }

  var LANGS = [
    { code: 'hi', label: 'Hindi' },
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'bn', label: 'Bengali' },
    { code: 'kn', label: 'Kannada' },
    { code: 'mr', label: 'Marathi' },
  ];

  function initLanguageSwitcher() {
    var mount = document.getElementById('aol-footer-lang-mount');
    if (!mount || mount.childNodes.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'aol-lang-switcher';
    var globe = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    globe.setAttribute('width', '18');
    globe.setAttribute('height', '18');
    globe.setAttribute('viewBox', '0 0 24 24');
    globe.setAttribute('aria-hidden', 'true');
    globe.innerHTML =
      '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" fill="none" stroke="currentColor" stroke-width="1.2"/>';
    wrap.appendChild(globe);
    var sel = document.createElement('select');
    sel.setAttribute('aria-label', 'Choose language');
    var saved = getCookie('aol_lang_pref');
    var nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
    var def = saved || (nav.toLowerCase().startsWith('hi') ? 'hi' : 'en');
    LANGS.forEach(function (L) {
      var o = document.createElement('option');
      o.value = L.code;
      o.textContent = L.label;
      if (L.code === def) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      try {
        var v = sel.value;
        document.documentElement.setAttribute('lang', v);
        setCookie('aol_lang_pref', v, 365);
        window.dispatchEvent(new Event('aol-lang-changed'));
      } catch (e) {}
    });
    document.documentElement.setAttribute('lang', def);
    wrap.appendChild(sel);
    var arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '▾';
    wrap.appendChild(arrow);
    mount.appendChild(wrap);
  }

  /* AOL Enhancement: Live stats after hero (Section G) */
  function initLiveStats() {
    var hero = document.getElementById('aol-page-hero');
    if (!hero || document.getElementById('aol-live-stats-strip')) return;
    var section = document.createElement('section');
    section.id = 'aol-live-stats-strip';
    section.className = 'aol-live-stats';
    section.setAttribute('aria-label', 'Impact highlights');
    section.innerHTML =
      '<div class="aol-live-stats-inner">' +
      '<div class="aol-stat-card"><div class="aol-stat-value" data-aol-stat="10000000" data-suffix="+">0</div><div class="aol-stat-label">10 Million+ Students</div></div>' +
      '<div class="aol-stat-card"><div class="aol-stat-value" data-aol-stat="180" data-suffix="+">0</div><div class="aol-stat-label">180+ Countries</div></div>' +
      '<div class="aol-stat-card"><div class="aol-stat-value">1981</div><div class="aol-stat-label">Est. 1981</div></div>' +
      '<div class="aol-stat-card"><div class="aol-stat-value" data-aol-stat="155000" data-suffix="+">0</div><div class="aol-stat-label">155,000+ Courses Taught</div></div>' +
      '</div>';
    hero.parentNode.insertBefore(section, hero.nextSibling);

    function animateStat(el) {
      if (!el.hasAttribute('data-aol-stat')) return;
      var target = parseInt(el.getAttribute('data-aol-stat') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var start = performance.now();
      var dur = 2000;
      function frame(now) {
        try {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - (1 - t) * (1 - t);
          var val = Math.floor(target * eased);
          el.textContent = val.toLocaleString() + suffix;
          if (t < 1) requestAnimationFrame(frame);
        } catch (e) {}
      }
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.disconnect();
          section.querySelectorAll('[data-aol-stat]').forEach(animateStat);
        });
      },
      { threshold: 0.15 }
    );
    io.observe(section);
  }

  /* AOL Enhancement: Hero particles + subtitle (Section F) */
  function initHeroParticles() {
    var canvas = document.getElementById('aol-hero-particles');
    if (!canvas || canvas.getAttribute('data-aol-particles-init') === '1') return;
    canvas.setAttribute('data-aol-particles-init', '1');
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var particles = [];
    var w = 0,
      h = 0;
    var mode = 'default';
    function resize() {
      try {
        var rect = canvas.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        canvas.width = Math.max(1, Math.floor(w * (window.devicePixelRatio || 1)));
        canvas.height = Math.max(1, Math.floor(h * (window.devicePixelRatio || 1)));
        ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      } catch (e) {}
    }
    var count = window.innerWidth < 768 ? 30 : 60;
    function spawn() {
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }
    }
    resize();
    spawn();
    window.addEventListener('resize', function () {
      resize();
      spawn();
    });
    var gold = 'rgba(201, 169, 97,0.35)';
    var blue = 'rgba(100, 160, 210,0.35)';
    var base = 'rgba(255,255,255,0.25)';
    function color() {
      if (mode === 'clear') return gold;
      if (mode === 'rain') return blue;
      return base;
    }
    if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(
        function () {
          try {
            fetch('https://api.open-meteo.com/v1/forecast?current_weather=true&latitude=12.79&longitude=77.50')
              .then(function (r) {
                return r.ok ? r.json() : null;
              })
              .then(function (j) {
                try {
                  var code = j && j.current_weather && j.current_weather.weathercode;
                  if (code === 0 || code === 1) mode = 'clear';
                  else if (code >= 51 && code <= 99) mode = 'rain';
                } catch (e) {}
              })
              .catch(function () {});
          } catch (e) {}
        },
        function () {},
        { maximumAge: 6e5, timeout: 4000 }
      );
    }
    function loop(t) {
      try {
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, w, h);
        var c = color();
        particles.forEach(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          ctx.beginPath();
          ctx.fillStyle = c;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } catch (e) {}
    }
    requestAnimationFrame(loop);
  }

  function cookieLangHi() {
    return getCookie('aol_lang_pref') === 'hi';
  }

  function initHeroSubtitle() {
    var hero = document.getElementById('aol-page-hero');
    if (!hero || document.getElementById('aol-hero-time-subtitle')) return;
    var h1 = hero.querySelector('h1');
    if (!h1) return;
    var p = document.createElement('p');
    p.id = 'aol-hero-time-subtitle';
    p.className = 'aol-hero-subtitle';
    p.setAttribute('aria-live', 'polite');
    var hour = new Date().getHours();
    var linesEn = {
      m: 'Good morning. Start your day with peace.',
      d: 'Find your calm in the middle of the day.',
      e: 'Unwind. You deserve stillness.',
      n: 'Rest well. Tomorrow begins with you.',
    };
    var linesHi = {
      m: 'सुप्रभात। अपने दिन की शुरुआत शांति से करें।',
      d: 'दिन के बीच अपनी शांति पाएँ।',
      e: 'विश्राम करें। आप स्थिरता के योग्य हैं।',
      n: 'अच्छी नींद लें। कल आपके साथ शुरू होता है।',
    };
    var L = cookieLangHi() ? linesHi : linesEn;
    var text;
    if (hour >= 5 && hour < 11) text = L.m;
    else if (hour >= 11 && hour < 17) text = L.d;
    else if (hour >= 17 && hour < 21) text = L.e;
    else text = L.n;
    p.textContent = text;
    h1.insertAdjacentElement('afterend', p);
    window.addEventListener('aol-lang-changed', function () {
      try {
        var L2 = cookieLangHi() ? linesHi : linesEn;
        var h = new Date().getHours();
        if (h >= 5 && h < 11) p.textContent = L2.m;
        else if (h >= 11 && h < 17) p.textContent = L2.d;
        else if (h >= 17 && h < 21) p.textContent = L2.e;
        else p.textContent = L2.n;
      } catch (e) {}
    });
  }

  /* AOL Enhancement: Reading time (Section H) */
  function initReadingTime() {
    var root = document.querySelector('[data-aol-reading-root]');
    if (!root || root.querySelector('.aol-read-badge')) return;
    var text = root.innerText || '';
    var words = text.trim().split(/\s+/).filter(Boolean).length;
    var mins = Math.max(1, Math.round(words / 200));
    var badge = document.createElement('div');
    badge.className = 'aol-read-badge';
    badge.textContent = mins + ' min read';
    badge.setAttribute('aria-label', 'Estimated reading time ' + mins + ' minutes');
    root.insertBefore(badge, root.firstChild);
  }

  /* AOL Enhancement: Sticky CTA mobile (Section H) */
  function initStickyCta() {
    if (window.innerWidth >= 768) return;
    if (document.getElementById('aol-sticky-cta-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'aol-sticky-cta-bar';
    bar.className = 'aol-sticky-cta';
    bar.setAttribute('aria-hidden', 'false');
    var a = document.createElement('a');
    a.href = 'https://programs.vvmvp.org/';
    a.textContent = 'Join a Free Session →';
    a.setAttribute('aria-label', 'Join a free session');
    bar.appendChild(a);
    document.body.appendChild(bar);
    var hero = document.getElementById('aol-page-hero');
    var footer = document.getElementById('aol-site-footer');
    function sync() {
      try {
        var past = bar.getAttribute('data-past-hero') === '1';
        var hide = bar.getAttribute('data-footer-visible') === '1';
        bar.classList.toggle('aol-sticky-cta--on', past && !hide);
      } catch (e) {}
    }
    if (hero && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            bar.setAttribute('data-past-hero', en.isIntersecting ? '0' : '1');
            sync();
          });
        },
        { root: null, rootMargin: '-12% 0px 0px 0px', threshold: 0 }
      );
      io.observe(hero);
    } else {
      bar.setAttribute('data-past-hero', '1');
      sync();
    }
    if (footer && 'IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            bar.setAttribute('data-footer-visible', en.isIntersecting ? '1' : '0');
            sync();
          });
        },
        { threshold: 0.02 }
      );
      io2.observe(footer);
    }
    window.addEventListener('scroll', sync, { passive: true });
  }

  /* AOL Enhancement: Lazy images (Section I) */
  function initLazyImages() {
    try {
      var imgs = document.querySelectorAll('main img:not([loading])');
      imgs.forEach(function (img, i) {
        try {
          if (img.closest('#aol-page-hero')) return;
          if (img.getAttribute('fetchpriority') === 'high') return;
          img.setAttribute('loading', 'lazy');
          if (!img.getAttribute('alt')) img.setAttribute('alt', 'Image');
        } catch (e) {}
      });
    } catch (e) {}
  }

  /* AOL Enhancement: AI chat + WhatsApp (Section A) */
  window.AOLChat = window.AOLChat || {};

  function initAolChatWidget() {
    var slot = document.getElementById('aol-footer-chat-slot');
    if (!slot || slot.childNodes.length) return;
    var collapsed = true;
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('aol-chat-collapsed') === '0') {
        collapsed = false;
      }
    } catch (e) {}

    var root = document.createElement('div');
    root.className = 'aol-chat-dock';

    var bar = document.createElement('div');
    bar.className = 'aol-chat-bar';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'aol-chat-toggle';
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    var hi = getCookie('aol_lang_pref') === 'hi';
    toggle.textContent = hi ? 'Kuch chahiye?' : 'Can we help?';
    bar.appendChild(toggle);

    var panel = document.createElement('div');
    panel.className = 'aol-chat-panel';
    panel.hidden = collapsed;
    var msgs = document.createElement('div');
    msgs.className = 'aol-chat-messages';
    msgs.setAttribute('role', 'log');
    msgs.setAttribute('aria-live', 'polite');
    panel.appendChild(msgs);

    function addBubble(html, who) {
      var b = document.createElement('div');
      b.className = 'aol-chat-bubble aol-chat-bubble--' + who;
      b.innerHTML = html;
      msgs.appendChild(b);
      msgs.scrollTop = msgs.scrollHeight;
    }

    var chips = document.createElement('div');
    chips.className = 'aol-chat-chips';
    var chipData = [
      { t: 'Courses', href: '/programs' },
      { t: 'Meditation', href: '/programs/sahaj-samadhi' },
      { t: 'Events', href: '/events' },
      { t: 'Contact', href: '/connect/contact' },
      { t: 'Donate', href: '/events' },
      { t: 'Volunteer', href: '/seva-careers' },
    ];
    chipData.forEach(function (c) {
      var a = document.createElement('a');
      a.className = 'aol-chat-chip';
      a.href = c.href;
      a.textContent = c.t;
      chips.appendChild(a);
    });
    panel.appendChild(chips);

    var inputRow = document.createElement('div');
    inputRow.className = 'aol-chat-input-row';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.setAttribute('aria-label', 'Message to assistant');
    var send = document.createElement('button');
    send.type = 'button';
    send.textContent = 'Send';
    inputRow.appendChild(inp);
    inputRow.appendChild(send);
    panel.appendChild(inputRow);

    root.appendChild(bar);
    root.appendChild(panel);

    var wa = document.createElement('a');
    wa.className = 'aol-chat-whatsapp';
    wa.href = 'https://wa.me/918067557777';
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span>Chat on WhatsApp</span>';
    root.appendChild(wa);
    slot.appendChild(root);

    function persistCollapse() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('aol-chat-collapsed', collapsed ? '1' : '0');
        }
      } catch (e) {}
    }

    toggle.addEventListener('click', function () {
      try {
        collapsed = !collapsed;
        panel.hidden = collapsed;
        toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        persistCollapse();
      } catch (e) {}
    });

    var siteIndex = null;
    function loadIndex(cb) {
      if (siteIndex) return cb(siteIndex);
      fetch('/data/aol-site-index.json')
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (j) {
          siteIndex = j || {};
          cb(siteIndex);
        })
        .catch(function () {
          siteIndex = {};
          cb(siteIndex);
        });
    }

    function intentOf(q) {
      var s = q.toLowerCase();
      if (/donat|gift|upi|pay/.test(s)) return 'donation';
      if (/volunteer|seva|serve/.test(s)) return 'volunteer';
      if (/event|festival|celebration|mahashiv|shivaratri|schedule|when/.test(s)) return 'events';
      if (/course|program|happiness|sky|kriya|yoga|meditation|sahaj/.test(s)) return 'courses';
      if (/contact|email|phone|call|reach|address/.test(s)) return 'contact';
      return 'general';
    }

    function formatEvent(ev) {
      return (
        '<strong>Title:</strong> ' +
        ev.title +
        '<br/><strong>Description:</strong> ' +
        (ev.description || '').slice(0, 400) +
        (ev.description && ev.description.length > 400 ? '…' : '') +
        '<br/><strong>Schedule:</strong> ' +
        (ev.startDate || '') +
        ' – ' +
        (ev.endDate || '') +
        '<br/><strong>Location:</strong> ' +
        (ev.location || '') +
        '<br/><strong>Fee:</strong> ' +
        (ev.fee || 'See registration') +
        '<br/><strong>Link:</strong> <a href="' +
        ev.link +
        '">' +
        ev.link +
        '</a>' +
        (ev.instructor ? '<br/><strong>Host / instructor:</strong> ' + ev.instructor : '')
      );
    }

    function answerQuery(q) {
      loadIndex(function (idx) {
        try {
          var intent = intentOf(q);
          var events = (idx && idx.events) || [];
          var programs = (idx && idx.programs) || [];
          var pages = (idx && idx.pages) || [];
          var now = Date.now();
          var upcoming = events.filter(function (e) {
            try {
              return e.startDate && new Date(e.startDate).getTime() >= now - 864e5;
            } catch (err) {
              return true;
            }
          });

          var body = '';
          var follow = [];

          if (intent === 'events' && upcoming.length) {
            body += '<p><strong>Upcoming on this site</strong></p>';
            upcoming.slice(0, 2).forEach(function (e) {
              body += '<p>' + formatEvent(e) + '</p>';
            });
            follow.push('Show meditation programs');
            follow.push('How do I contact the ashram?');
          } else if (intent === 'courses' && programs.length) {
            programs.slice(0, 2).forEach(function (p) {
              body +=
                '<p><strong>Title:</strong> ' +
                p.title +
                '<br/><strong>Description:</strong> ' +
                p.description +
                '<br/><strong>Schedule:</strong> ' +
                (p.schedule || '') +
                '<br/><strong>Location:</strong> ' +
                (p.location || '') +
                '<br/><strong>Fee:</strong> ' +
                (p.fee || '') +
                '<br/><strong>Link:</strong> <a href="' +
                p.link +
                '">' +
                p.link +
                '</a>' +
                (p.instructor ? '<br/><strong>Instructor:</strong> ' + p.instructor : '') +
                '</p>';
            });
            follow.push('What events are coming up?');
            follow.push('Volunteer opportunities');
          } else if (intent === 'contact') {
            body +=
              '<p><strong>Contact</strong><br/>Use the ashram contact page for phone and email: <a href="/connect/contact">/connect/contact</a>.</p>';
            follow.push('Upcoming events');
            follow.push('Programs overview');
          } else if (intent === 'volunteer') {
            body +=
              '<p><strong>Seva & careers</strong><br/>Learn about volunteering and careers: <a href="/seva-careers">/seva-careers</a>.</p>';
            follow.push('Programs');
            follow.push('Events');
          } else if (intent === 'donation') {
            body +=
              '<p><strong>Donations</strong><br/>Event pages may include donation options. Start from <a href="/events">Events</a> or visit a specific event.</p>';
            follow.push('Upcoming events');
            follow.push('Contact');
          } else {
            var hit = false;
            var ql = q.toLowerCase();
            events.forEach(function (e) {
              if (hit) return;
              if (e.title && e.title.toLowerCase().indexOf(ql) !== -1) {
                body += '<p>' + formatEvent(e) + '</p>';
                hit = true;
              }
            });
            if (!hit && programs.length) {
              var p0 = programs[0];
              body +=
                '<p><strong>Title:</strong> ' +
                p0.title +
                '<br/><strong>Description:</strong> ' +
                p0.description +
                '<br/><strong>Schedule:</strong> ' +
                (p0.schedule || '') +
                '<br/><strong>Location:</strong> ' +
                (p0.location || '') +
                '<br/><strong>Fee:</strong> ' +
                (p0.fee || '') +
                '<br/><strong>Link:</strong> <a href="' +
                p0.link +
                '">' +
                p0.link +
                '</a></p>';
              hit = true;
            }
            if (!hit) {
              body +=
                '<p>I couldn\'t find exact details for that. Here are some helpful links:</p><ul>' +
                pages
                  .slice(0, 6)
                  .map(function (p) {
                    return '<li><a href="' + p.link + '">' + p.label + '</a></li>';
                  })
                  .join('') +
                '</ul>';
            }
            follow.push('Browse all programs');
            follow.push('See upcoming events');
          }

          addBubble(body || 'How can I guide you today?', 'bot');

          var extra = document.createElement('div');
          extra.className = 'aol-chat-chips';
          (follow.length ? follow : ['Courses', 'Events']).slice(0, 2).forEach(function (label) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'aol-chat-chip';
            b.textContent = label;
            b.addEventListener('click', function () {
              inp.value = label;
              send.click();
            });
            extra.appendChild(b);
          });
          msgs.appendChild(extra);
        } catch (e) {
          addBubble('Something went wrong. Try the links below.', 'bot');
        }
      });
    }

    send.addEventListener('click', function () {
      try {
        var v = (inp.value || '').trim();
        if (!v) return;
        addBubble(escapeHtml(v), 'user');
        inp.value = '';
        answerQuery(v);
      } catch (e) {}
    });

    addBubble('Ask about courses, events, volunteering, donations, or contact — answers use this website’s data only.', 'bot');
    persistCollapse();

    window.AOLChat.open = function () {
      collapsed = false;
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      persistCollapse();
    };
    window.AOLChat.close = function () {
      collapsed = true;
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      persistCollapse();
    };
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* AOL Enhancement: document class for focus ring scope */
  function initDocClass() {
    try {
      document.documentElement.classList.add('aol-enhance-focus');
    } catch (e) {}
  }

  function tick() {
    runSafely(function () {
      var footer = document.getElementById('aol-site-footer');
      if (footer) {
        bindFooterAccordion(footer);
        initTrustBadges();
        initLanguageSwitcher();
        initAolChatWidget();
      }
      initLiveStats();
      initHeroParticles();
      initHeroSubtitle();
      initReadingTime();
      initLazyImages();
      initDocClass();
      if (window.innerWidth < 768) initStickyCta();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      initScrollProgress();
      initScrollTop();
      var n = 0;
      function loop() {
        try {
          n++;
          tick();
          if (n < 90) requestAnimationFrame(loop);
        } catch (e) {}
      }
      requestAnimationFrame(loop);
    } catch (e) {}
  });
})();
