/* The only motion on the site (brief §3): a one-time count-up on the numbers,
   a gentle reveal as sections enter, nothing at all with reduced motion. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canObserve = 'IntersectionObserver' in window;

// Section reveal
const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduceMotion || !canObserve) {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

// Count-up. Numbers are rendered at their final value in HTML; only ones that
// start off-screen are reset and animated, so nothing visibly flickers.
const counters = document.querySelectorAll<HTMLElement>('[data-count-to]');
if (!reduceMotion && canObserve && counters.length) {
  const format = new Intl.NumberFormat('en-US');
  const duration = 1400;

  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.countTo);
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format.format(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const countObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target as HTMLElement);
        countObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );

  counters.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
    if (onScreen) return;
    el.textContent = '0';
    countObserver.observe(el);
  });
}
