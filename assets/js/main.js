(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* Loader: a spiral of dots echoing the SKALA mark */
  const dotsWrap = document.querySelector('.loader__dots');
  const N = 46;
  for (let i = 0; i < N; i++) {
    const d = document.createElement('i');
    const t = i / N;
    const ang = t * Math.PI * 3.2 + Math.PI * .7;
    const rad = 12 + t * 38;
    const size = 4 + t * 12;
    d.style.width = d.style.height = size + 'px';
    d.style.left = 50 + Math.cos(ang) * rad + '%';
    d.style.top = 50 + Math.sin(ang) * rad + '%';
    d.style.background = i % 2 ? '#12afa5' : '#1b355e';
    dotsWrap.appendChild(d);
  }

  const heroIn = () => {
    gsap.from('.hero__title .line > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: .09 });
    gsap.from('.hero__foot > *', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', delay: .35, stagger: .1 });
    gsap.from('.nav', { y: -30, opacity: 0, duration: 1, ease: 'expo.out', delay: .2 });
  };

  const finish = () => {
    document.body.classList.remove('is-loading');
    lenis && lenis.start();
    ScrollTrigger.refresh();
  };

  if (reduce) {
    document.querySelector('.loader').remove();
    finish();
  } else {
    const tl = gsap.timeline({ onComplete: finish });
    tl.from('.loader__dots i', { scale: 0, opacity: 0, duration: .6, ease: 'back.out(2)', stagger: { each: .018 } })
      .to('.loader__dots', { rotate: 120, scale: 2.4, opacity: 0, duration: 1.1, ease: 'expo.inOut' }, '+=.1')
      .to('.loader__logo', { opacity: 1, duration: .6, ease: 'power2.out' }, '-=.7')
      .to('.loader__logo', { opacity: 0, y: -10, duration: .5, ease: 'power2.in' }, '+=.45')
      .to('.loader', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=.15')
      .add(heroIn, '-=.55')
      .set('.loader', { display: 'none' });
  }

  /* Video: make sure it plays everywhere */
  const vid = document.querySelector('.hero__video');
  if (vid) { vid.muted = true; const p = vid.play(); p && p.catch(() => {}); }

  /* Nav state */
  const nav = document.querySelector('.nav');
  let lastY = 0;
  const onScroll = y => {
    const hero = window.innerHeight * .85;
    nav.classList.toggle('is-solid', y > hero);
    if (!nav.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > hero + 200);
    lastY = y;
  };
  lenis ? lenis.on('scroll', e => onScroll(e.scroll)) : window.addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  /* Mega menu */
  const items = document.querySelectorAll('.nav__item');
  const panels = document.querySelectorAll('.mega__panel');
  let closeT;
  const open = key => {
    clearTimeout(closeT);
    nav.classList.add('menu-open');
    nav.classList.remove('is-hidden');
    items.forEach(i => i.classList.toggle('is-open', i.dataset.menu === key));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === key));
  };
  const close = () => {
    closeT = setTimeout(() => {
      nav.classList.remove('menu-open');
      items.forEach(i => i.classList.remove('is-open'));
      panels.forEach(p => p.classList.remove('is-active'));
    }, 160);
  };
  items.forEach(i => {
    i.addEventListener('mouseenter', () => open(i.dataset.menu));
    i.addEventListener('focus', () => open(i.dataset.menu));
    i.addEventListener('click', () => nav.classList.contains('menu-open') && i.classList.contains('is-open') ? close() : open(i.dataset.menu));
  });
  nav.addEventListener('mouseleave', close);
  document.querySelector('.mega').addEventListener('mouseenter', () => clearTimeout(closeT));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());

  /* Mobile menu */
  document.querySelector('.burger').addEventListener('click', () => {
    const on = document.body.classList.toggle('mm-open');
    nav.classList.toggle('menu-open', on);
    on ? lenis && lenis.stop() : lenis && lenis.start();
  });

  /* Map pins */
  const pins = {
    aceh: [6.2, 24, 'Aceh'],
    kaltara: [47.8, 22, 'Kalimantan Utara'],
    gorontalo: [61.4, 40, 'Gorontalo'],
    ntb: [49.6, 76, 'Nusa Tenggara Barat'],
    ntt: [60, 79, 'Nusa Tenggara Timur'],
    maluku: [75.6, 49, 'Maluku'],
    pbd: [81.2, 47.5, 'Papua Barat Daya'],
    pb: [85.6, 50, 'Papua Barat'],
    papua: [95, 53, 'Papua'],
    ps: [94.6, 70, 'Papua Selatan'],
  };
  const pinWrap = document.querySelector('.map__pins');
  Object.entries(pins).forEach(([k, [x, y, name]], i) => {
    const p = document.createElement('button');
    p.className = 'pin';
    p.dataset.pin = k;
    p.style.setProperty('--x', x + '%');
    p.style.setProperty('--y', y + '%');
    p.style.setProperty('--d', (i * .25) + 's');
    p.setAttribute('aria-label', name);
    p.innerHTML = `<span>${name}</span>`;
    pinWrap.appendChild(p);
  });
  const hot = k => document.querySelectorAll('[data-pin]').forEach(el => el.classList.toggle('is-hot', el.dataset.pin === k));
  document.querySelectorAll('[data-pin]').forEach(el => {
    el.addEventListener('mouseenter', () => hot(el.dataset.pin));
    el.addEventListener('mouseleave', () => hot(null));
  });

  /* Podcast wave bars */
  const wave = document.querySelector('.podcast__wave');
  for (let i = 0; i < 34; i++) {
    const b = document.createElement('i');
    b.style.setProperty('--h', (25 + Math.abs(Math.sin(i * .7)) * 70) + '%');
    b.style.animationDelay = (i * -.09) + 's';
    wave.appendChild(b);
  }

  /* Testimonials */
  const voices = [...document.querySelectorAll('.voice')];
  const dots = [...document.querySelectorAll('.voices__nav .dot')];
  let vi = 0, vt;
  const show = n => {
    vi = (n + voices.length) % voices.length;
    voices.forEach((v, i) => v.classList.toggle('is-active', i === vi));
    dots.forEach((d, i) => { d.classList.remove('is-active'); if (i === vi) { void d.offsetWidth; d.classList.add('is-active'); } });
    clearTimeout(vt); vt = setTimeout(() => show(vi + 1), 7000);
  };
  dots.forEach((d, i) => d.addEventListener('click', () => show(i)));
  show(0);

  /* Marquee: duplicate track for a seamless loop */
  const track = document.querySelector('.marquee__track');
  track.innerHTML += track.innerHTML;

  /* Counters */
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to({ v: 0 }, { v: end, duration: 1.8, ease: 'expo.out', onUpdate() { el.textContent = Math.round(this.targets()[0].v); } })
    });
  });

  if (reduce) { document.querySelectorAll('.statement__text').forEach(e => e.classList.add('static')); return; }

  /* Hero parallax out */
  gsap.to('.hero__media', { yPercent: 18, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: '85% top', scrub: true } });

  /* Statement: words fill in as you read */
  const st = document.querySelector('[data-words]');
  st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = st.querySelectorAll('.w');
  ScrollTrigger.create({
    trigger: st, start: 'top 78%', end: 'bottom 45%', scrub: true,
    onUpdate: s => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); }
  });
  gsap.from('.statement__side', { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.statement__side', start: 'top 88%' } });

  /* Band: frame opens to full bleed */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 821px)', () => {
    gsap.fromTo('.band__frame', { clipPath: 'inset(12% 18% 12% 18% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.band', start: 'top 70%', end: 'top top', scrub: true }
    });
    gsap.to('.band__img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.band__caption h2', { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top 5%', end: 'top -15%', scrub: true } });

    /* Goals: stacked cards recede as the next one arrives */
    const cards = gsap.utils.toArray('.goal');
    cards.forEach((c, i) => {
      c.style.setProperty('--i', i);
      if (i === cards.length - 1) return;
      gsap.to(c, {
        scale: .94, opacity: .55, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 120px', scrub: true }
      });
    });

    /* Focus tags float in around the clay village */
    gsap.to('.tag', { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.focus__stage', start: 'top 70%' } });
    gsap.fromTo('.focus__clay', { xPercent: -50, yPercent: -50, y: 60, rotate: -3 }, { xPercent: -50, yPercent: -50, y: -40, rotate: 2, ease: 'none', scrollTrigger: { trigger: '.focus', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  mm.add('(max-width: 1180px)', () => { gsap.set('.tag', { opacity: 1, y: 0 }); });

  /* Pins pop in */
  gsap.to('.pin', { scale: 1, duration: .7, ease: 'back.out(2.5)', stagger: .08, scrollTrigger: { trigger: '.map', start: 'top 75%' } });

  /* Generic reveals */
  const reveal = sel => gsap.utils.toArray(sel).forEach(el => gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  reveal('.stat, .goals__intro > *, .where__head > *, .focus__copy > *, .systems__head h2, .news__head, .news__lead, .news__item, .pubs__head, .pub, .podcast__card, .join__copy > *, .footer__top > *');

  /* Image parallax inside frames */
  gsap.utils.toArray('.join__img img, .news__img img').forEach(img => {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.fromTo('.voices__bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.voices', start: 'top bottom', end: 'bottom top', scrub: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
