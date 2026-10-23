/* ANEES AHMED — The Master Plan | No external JavaScript libraries */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuBtn = $('#menuToggle');
  const mobileNav = $('#mobileNav');
  const themeBtn = $('#themeToggle');
  const soundBtn = $('#soundToggle');
  const progress = $('#progressBar');
  let soundEnabled = false;
  let audioContext = null;

  const setMenuOpen = (isOpen) => {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    mobileNav.classList.toggle('is-open', isOpen);
    mobileNav.inert = !isOpen;
  };
  menuBtn?.addEventListener('click', () => setMenuOpen(menuBtn.getAttribute('aria-expanded') !== 'true'));
  mobileNav?.querySelectorAll('a').forEach((anchor) => anchor.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (mobileNav?.classList.contains('is-open') && !event.target.closest('.site-header')) setMenuOpen(false);
  });
  window.matchMedia('(min-width: 921px)').addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });

  const setTheme = (newTheme) => {
    document.body.dataset.theme = newTheme;
    const stealth = newTheme === 'stealth';
    themeBtn?.setAttribute('aria-pressed', String(stealth));
    themeBtn?.setAttribute('aria-label', stealth ? 'Switch to red alert theme' : 'Switch to stealth theme');
    themeBtn?.setAttribute('title', stealth ? 'Red Alert theme' : 'Stealth theme');
    // Avoid persistent tracking or storage. Theme resets on reload.
  };
  themeBtn?.addEventListener('click', () => {
    setTheme(document.body.dataset.theme === 'red-alert' ? 'stealth' : 'red-alert');
    playClick();
  });

  const playClick = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      audioContext ??= new AudioCtor();
      if (audioContext.state === 'suspended') void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(450, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(270, audioContext.currentTime + .065);
      gain.gain.setValueAtTime(.025, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .075);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + .08);
    } catch (error) {
      // Audio may be blocked by the browser; interface remains usable without it.
      console.info('Optional interface audio is unavailable.');
    }
  };
  soundBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.setAttribute('aria-pressed', String(soundEnabled));
    soundBtn.setAttribute('aria-label', soundEnabled ? 'Turn interface sound off' : 'Turn interface sound on');
    soundBtn.title = soundEnabled ? 'Sound on' : 'Sound off';
    const slash = $('#soundSlash');
    if (slash) slash.style.display = soundEnabled ? 'none' : 'block';
    playClick();
  });

  // Visual progress indicator updates on scroll; no background requests.
  let scrollTickPending = false;
  const updateProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${maxScroll > 0 ? Math.min(100, 100 * window.scrollY / maxScroll) : 0}%`;
    scrollTickPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTickPending) {
      scrollTickPending = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  const reveals = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 24px 0px' });
    reveals.forEach((element) => observer.observe(element));
  }

  // Highlight active section in desktop navigation only.
  const navSections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window && navSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      document.querySelectorAll('.nav-desktop a').forEach((anchor) => {
        if (anchor.hash === `#${visible.target.id}`) anchor.setAttribute('aria-current', 'true');
        else anchor.removeAttribute('aria-current');
      });
    }, { rootMargin: '-22% 0px -58% 0px' });
    navSections.forEach((section) => navObserver.observe(section));
  }

  $('#copyEmail')?.addEventListener('click', async () => {
    const status = $('#copyFeedback');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText('Ahmmedanees0@gmail.com');
        if (status) status.textContent = 'Email address copied.';
      } else if (status) {
        status.textContent = 'Please select and copy the email address above.';
      }
    } catch (error) {
      if (status) status.textContent = 'Please select and copy the email address above.';
    }
    playClick();
  });

  $('#contactForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const sender = String(data.get('name') ?? '').trim();
    const address = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    if (!sender || !address || !message) return;
    const subject = encodeURIComponent(`Portfolio inquiry from ${sender}`);
    const body = encodeURIComponent(`From: ${sender}\nReply-to: ${address}\n\n${message}`);
    const mailto = `mailto:Ahmmedanees0@gmail.com?subject=${subject}&body=${body}`;
    const status = $('#formStatus');
    if (status) status.textContent = 'Opening your email app. Please send the prepared message there.';
    window.location.href = mailto;
    playClick();
  });

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

