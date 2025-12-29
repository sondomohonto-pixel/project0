(() => {
  const qs = (sel, parent = document) => parent.querySelector(sel);
  const qsa = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  // Footer year
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scrolling (also closes collapsed navbar)
  const navCollapseEl = qs('#navbarPrimary');
  const bsCollapse = (navCollapseEl && window.bootstrap) ? window.bootstrap.Collapse.getOrCreateInstance(navCollapseEl, { toggle: false }) : null;

  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });

      // close navbar on mobile
      if (navCollapseEl && navCollapseEl.classList.contains('show') && bsCollapse) {
        bsCollapse.hide();
      }
    });
  });

  // Glow follow effect for cards/buttons
  const glowables = qsa('.glass-card, .btn-gradient, .btn-ghost');
  glowables.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty('--mx', `${mx}%`);
      el.style.setProperty('--my', `${my}%`);
      el.classList.add('is-glowing');
    });
    el.addEventListener('mouseleave', () => {
      el.classList.remove('is-glowing');
    });
  });

  // Subtle tilt for elements with data-tilt
  qsa('[data-tilt]').forEach(el => {
    const max = 6;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -max;
      const ry = (px - 0.5) * max;
      el.style.transform = `translateY(-2px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // Animated counters (stats)
  const counters = qsa('.counter');
  const animateCounter = (el) => {
    const target = Number(el.dataset.target || '0');
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  counters.forEach(c => counterObserver.observe(c));

  // Skill bars
  const skillRoot = qs('[data-skill-root]');
  if (skillRoot) {
    const bars = qsa('.progress-bar[data-level]', skillRoot);
    const skillObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        bars.forEach(b => {
          const level = Number(b.dataset.level || '0');
          b.style.width = `${Math.max(0, Math.min(100, level))}%`;
        });
        obs.disconnect();
      });
    }, { threshold: 0.35 });

    skillObserver.observe(skillRoot);
  }

  // Testimonial slider
  const track = qs('#testimonialTrack');
  const stage = qs('#testimonialStage');
  const prevBtn = qs('#tPrev');
  const nextBtn = qs('#tNext');

  if (track && stage) {
    const slides = qsa('.testimonial', track);
    let index = 0;
    let timer = null;

    const render = () => {
      const x = -index * 100;
      track.style.transform = `translateX(${x}%)`;
    };

    const next = () => {
      index = (index + 1) % slides.length;
      render();
    };

    const prev = () => {
      index = (index - 1 + slides.length) % slides.length;
      render();
    };

    const startAuto = () => {
      stopAuto();
      timer = window.setInterval(next, 4800);
    };

    const stopAuto = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

    stage.addEventListener('mouseenter', stopAuto);
    stage.addEventListener('mouseleave', startAuto);

    render();
    startAuto();
  }

  // Contact form (client-side only)
  const form = qs('#contactForm');
  const statusEl = qs('#formStatus');
  if (form && statusEl) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (qs('#name')?.value || '').trim();
      const email = (qs('#email')?.value || '').trim();
      const message = (qs('#message')?.value || '').trim();

      if (!name || !email || !message) {
        statusEl.textContent = 'Please fill in all fields.';
        return;
      }

      statusEl.textContent = 'Message ready to send (demo). Hook this form to your backend/email service.';
      form.reset();
    });
  }
})();
