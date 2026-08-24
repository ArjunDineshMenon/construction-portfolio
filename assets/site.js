/* ==========================================================================
   Golden Pearl Trading & Contracting — shared behaviour
   --------------------------------------------------------------------------
   Replaces four divergent inline <script> blocks. Everything here is
   progressive enhancement: with JavaScript disabled the site still renders
   all content, shows every project, and navigates via the visible links.

   Contents
     1. Nav scroll state
     2. Mobile drawer (built from the existing desktop nav)
     3. Scroll reveals
     4. Parallax + nav, on one rAF-throttled scroll listener
     5. Project sector filter
     6. Footer year
     7. Broken-image fallback
     8. Particle canvas (about page only)
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ---------------------------------------------------------------- 1. Nav */

  var nav = document.getElementById('main-nav');

  function syncNav(y) {
    if (!nav) return;
    nav.classList.toggle('nav-scrolled', y > 50);
  }

  /* ------------------------------------------------------------- 2. Drawer
     The four pages previously each had:
       <button class="md:hidden">…menu…</button>
     with no handler and no drawer markup, so mobile had no navigation and no
     call to action. The drawer is built here from the links already present
     in the desktop nav, so there is still only one list of links to maintain
     per page — and it stays in the HTML, where crawlers can see it. */

  function buildDrawer() {
    var toggle = document.getElementById('nav-toggle');
    var source = document.getElementById('nav-links');
    if (!toggle || !source) return;

    var drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.id = 'nav-drawer';
    drawer.hidden = true;

    var head = document.createElement('div');
    head.className = 'flex items-center justify-between px-margin-mobile h-20 border-b border-line';
    head.innerHTML =
      '<span class="font-display text-headline-sm tracking-[0.2em] uppercase text-gold">Golden Pearl</span>';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'text-gold p-2 -mr-2';
    close.setAttribute('aria-label', 'Close menu');
    close.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">close</span>';
    head.appendChild(close);

    var body = document.createElement('nav');
    body.className = 'flex-1 overflow-y-auto px-margin-mobile py-6';
    body.setAttribute('aria-label', 'Mobile navigation');

    var list = document.createElement('div');
    Array.prototype.forEach.call(source.querySelectorAll('a'), function (a) {
      var link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.className = 'drawer-link';
      link.textContent = a.textContent.trim();
      if (a.getAttribute('aria-current')) link.setAttribute('aria-current', 'page');
      list.appendChild(link);
    });
    body.appendChild(list);

    /* Mobile users previously had no way to make contact at all: the
       "Inquire Now" button was hidden below the md breakpoint. */
    var actions = document.createElement('div');
    actions.className = 'mt-8 space-y-3';
    actions.innerHTML =
      '<a class="btn w-full" href="contact.html">Request a Quote</a>' +
      '<a class="btn-ghost w-full" href="mailto:info@goldenpearlbh.com">Email Us</a>';
    body.appendChild(actions);

    drawer.appendChild(head);
    drawer.appendChild(body);
    document.body.appendChild(drawer);

    toggle.setAttribute('aria-controls', 'nav-drawer');
    toggle.setAttribute('aria-expanded', 'false');

    var lastFocus = null;

    function openDrawer() {
      lastFocus = document.activeElement;
      drawer.hidden = false;
      // force a reflow so the opacity transition runs
      void drawer.offsetWidth;
      drawer.classList.add('is-open');
      document.body.classList.add('drawer-open');
      toggle.setAttribute('aria-expanded', 'true');
      close.focus();
      document.addEventListener('keydown', onKeydown);
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeydown);
      window.setTimeout(function () { drawer.hidden = true; }, 300);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function onKeydown(e) {
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key !== 'Tab') return;
      // Keep focus inside the drawer while it is open
      var items = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    toggle.addEventListener('click', openDrawer);
    close.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', function (e) {
      // close after following an in-page link, and on backdrop taps
      if (e.target === drawer) closeDrawer();
      if (e.target.closest('a')) closeDrawer();
    });
  }

  /* ------------------------------------------------------------ 3. Reveals */

  function initReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------- 4. Parallax
     One listener for the whole page, throttled to the frame rate. The old
     pages attached two or three unthrottled scroll listeners that each read
     layout (getBoundingClientRect / offsetHeight) on every event. */

  var parallaxItems = [];

  function collectParallax() {
    parallaxItems = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  }

  function applyParallax(y) {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    for (var i = 0; i < parallaxItems.length; i++) {
      var el = parallaxItems[i];
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > vh * 2) continue; // offscreen
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
      var offset = (rect.top - vh / 2) * speed * -1;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    }
  }

  var queued = false;

  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      syncNav(y);
      applyParallax(y);
      queued = false;
    });
  }

  /* ------------------------------------------------------------- 5. Filter
     Reads `data-sector` straight off the project cards in the HTML, so the
     markup stays the single source of truth and the unfiltered grid is what
     a crawler (or a visitor without JS) sees. */

  function initFilter() {
    var bar = document.getElementById('project-filter');
    if (!bar) return;

    var chips = bar.querySelectorAll('.chip');
    var projects = document.querySelectorAll('.project[data-sector]');
    var count = document.getElementById('filter-count');
    if (!chips.length || !projects.length) return;

    bar.hidden = false;

    function apply(sector) {
      var shown = 0;
      Array.prototype.forEach.call(projects, function (card) {
        var match = sector === 'all' || card.getAttribute('data-sector') === sector;
        card.hidden = !match;
        if (match) shown++;
      });
      Array.prototype.forEach.call(chips, function (chip) {
        chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === sector));
      });
      if (count) {
        /* "entries" rather than "projects": the Midal card groups four
           separate works, so a card count would contradict the 23 named
           works quoted elsewhere on the page. */
        count.textContent = 'Showing ' + shown + (shown === 1 ? ' entry' : ' entries');
      }
    }

    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        apply(chip.getAttribute('data-filter'));
      });
    });

    apply('all');
  }

  /* --------------------------------------------------------------- 6. Year */

  function initYear() {
    var year = String(new Date().getFullYear());
    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
      el.textContent = year;
    });
  }

  /* ----------------------------------------------- 7. Broken-image fallback
     Most imagery is still AI-generated placeholder art. If a file is missing
     or a remote host stops serving it, degrade to the branded pattern panel
     rather than a broken-image icon. */

  function initImageFallback() {
    Array.prototype.forEach.call(document.images, function (img) {
      img.addEventListener('error', function () {
        var holder = img.closest('.project-media') || img.parentElement;
        if (holder) holder.classList.add('media-fallback');
        img.style.visibility = 'hidden';
      });
    });
  }

  /* ----------------------------------------------------------- 8. Particles
     Kept from the old about page but at roughly half the density, and skipped
     entirely under reduced-motion or on small screens where it costs battery
     for no benefit. */

  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas || reduceMotion || window.innerWidth < 768) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var raf = null;

    function size() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function seed() {
      particles = [];
      var n = Math.min(40, Math.round(window.innerWidth / 36));
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          a: Math.random() * 0.35 + 0.06
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, ' + p.a + ')';
        ctx.fill();
      }
      raf = window.requestAnimationFrame(frame);
    }

    size(); seed(); frame();

    window.addEventListener('resize', function () { size(); seed(); });

    // Stop painting when the tab is hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (raf) window.cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        frame();
      }
    });
  }

  /* ----------------------------------------------------------------- Init */

  ready(function () {
    buildDrawer();
    initReveals();
    collectParallax();
    initFilter();
    initYear();
    initImageFallback();
    initParticles();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', collectParallax, { passive: true });
    onScroll();
  });
})();
