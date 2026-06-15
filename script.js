/* =========================================================
   HANNA SECRU — JAVASCRIPT
   ========================================================= */

(function () {
  'use strict';

  /* ── CUSTOM CURSOR ── */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mx = -100, my = -100, fx = -100, fy = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  })();

  /* ── PARTICLES CANVAS ── */
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: Math.random() > 0.5 ? '139,92,246' : '99,102,241',
    };
  }

  for (let i = 0; i < 80; i++) particles.push(createParticle());

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    /* draw lines between close particles */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ── NAVBAR SCROLL ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ── HAMBURGER MENU ── */
  const hamburger = document.getElementById('hamburger');
  hamburger.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => document.body.classList.remove('nav-open'));
  });

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => observer.observe(el));

  /* ── COUNT-UP ANIMATION ── */
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    (function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    })(start);
  }

  const statNums = document.querySelectorAll('.stat-num');
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          countUp(e.target);
          statsObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statNums.forEach((el) => statsObserver.observe(el));

  /* ── PROJECT FILTER ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projectCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
        if (match) {
          card.style.animation = 'none';
          requestAnimationFrame(() => {
            card.style.animation = '';
            card.style.animationName = 'fadeInUp';
            card.style.animationDuration = '0.4s';
          });
        }
      });
    });
  });

  /* Add fadeInUp keyframe */
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleSheet);

  /* ── TESTIMONIALS SLIDER ── */
  const inner   = document.getElementById('testimonialsInner');
  const cards   = inner.querySelectorAll('.testimonial-card');
  const prevBtn = document.getElementById('testPrev');
  const nextBtn = document.getElementById('testNext');
  const dotsEl  = document.getElementById('testDots');
  let current   = 0;
  let autoSlide;

  function getVisible() {
    return window.innerWidth <= 900 ? 1 : 2;
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    const total = Math.ceil(cards.length / getVisible());
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'test-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    }
  }

  function goTo(index) {
    const visible = getVisible();
    const total   = Math.ceil(cards.length / visible);
    current = (index + total) % total;
    const cardWidth = cards[0].offsetWidth + 28; // gap
    inner.style.transform = `translateX(-${current * cardWidth * visible}px)`;
    document.querySelectorAll('.test-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => { clearInterval(autoSlide); goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { clearInterval(autoSlide); goTo(current + 1); startAuto(); });
  window.addEventListener('resize', () => { buildDots(); goTo(0); });
  buildDots();

  function startAuto() {
    autoSlide = setInterval(() => goTo(current + 1), 5000);
  }
  startAuto();

  /* ── CONTACT FORM ── */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn   = document.getElementById('formSubmitBtn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      formSuccess.classList.add('show');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 1500);
  });

  /* ── SMOOTH ACTIVE NAV ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) => {
            l.style.color = l.getAttribute('href') === '#' + e.target.id ? '#fff' : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ── FOUNDER IMAGE FALLBACK ── */
  const founderImg = document.getElementById('founderImg');
  if (founderImg) {
    founderImg.onerror = function () {
      this.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        width:100%; height:100%; display:flex; align-items:center; justify-content:center;
        background: linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
        font-size: 3rem; font-weight: 900; color: #fff;
      `;
      placeholder.textContent = 'HS';
      this.parentElement.appendChild(placeholder);
    };
  }

  /* ── PARALLAX ORBS ON MOUSE ── */
  document.addEventListener('mousemove', (e) => {
    const xRatio = (e.clientX / window.innerWidth  - 0.5) * 20;
    const yRatio = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelector('.orb-1').style.transform = `translate(${xRatio * 0.5}px, ${yRatio * 0.5}px)`;
    document.querySelector('.orb-2').style.transform = `translate(${-xRatio * 0.3}px, ${-yRatio * 0.3}px)`;
  });

})();
