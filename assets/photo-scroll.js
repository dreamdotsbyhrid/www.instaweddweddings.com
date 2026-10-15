'use strict';
// Native horizontal scrolling, with a slow seamless drift after manual input stops.
window.initPhotoScroll = function (strip) {
  if (strip.dataset.scrollReady) return;
  strip.dataset.scrollReady = 'true';
  const track = strip.querySelector('.photo-marquee-track');
  const original = track?.querySelector('.photo-marquee-group');
  if (!original || !original.children.length) return;
  const first = original.cloneNode(true);
  first.setAttribute('aria-hidden', 'true');
  first.querySelectorAll('a').forEach(a => a.tabIndex = -1);
  track.prepend(first);
  strip.classList.add('manual-photo-scroll');
  strip.tabIndex = 0;
  strip.setAttribute('role', 'region');
  strip.setAttribute('aria-label', 'Photography gallery. Swipe, drag, or use left and right arrow keys to explore.');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let drift = 0, width = 0, last = 0, resumeAt = 0, visible = true, drag = null, moved = false;
  const pause = () => { resumeAt = performance.now() + 2500; };
  const resize = () => {
    const next = original.getBoundingClientRect().width;
    if (!next) return;
    const phase = width ? (strip.scrollLeft - width) / width : 0;
    width = next;
    strip.scrollLeft = width + phase * width;
  };
  const wrap = () => {
    if (width <= strip.clientWidth) return;
    if (strip.scrollLeft < width / 2) strip.scrollLeft += width;
    else if (strip.scrollLeft > width * 1.5) strip.scrollLeft -= width;
  };
  new ResizeObserver(resize).observe(original);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(strip);
  strip.addEventListener('wheel', event => {
    if (event.ctrlKey || width <= strip.clientWidth) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault(); pause();
    strip.scrollLeft += delta * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? strip.clientWidth : 1);
    wrap();
  }, { passive: false });
  strip.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); pause();
    strip.scrollLeft += (event.key === 'ArrowRight' ? 1 : -1) * 240;
    wrap();
  });
  strip.addEventListener('touchstart', pause, { passive: true });
  strip.addEventListener('touchmove', pause, { passive: true });
  strip.addEventListener('touchend', pause, { passive: true });
  strip.addEventListener('scroll', wrap, { passive: true });
  strip.addEventListener('dragstart', event => event.preventDefault());
  strip.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    pause(); moved = false; drag = { x: event.clientX, id: event.pointerId };
  });
  strip.addEventListener('pointermove', event => {
    if (!drag) return;
    const delta = drag.x - event.clientX;
    if (!moved && Math.abs(delta) < 5) return;
    moved = true; strip.setPointerCapture(drag.id);
    strip.classList.add('is-dragging');
    strip.scrollLeft += delta; drag.x = event.clientX; pause(); wrap();
  });
  const release = () => {
    if (!drag) return;
    if (strip.hasPointerCapture(drag.id)) strip.releasePointerCapture(drag.id);
    drag = null; strip.classList.remove('is-dragging'); pause();
  };
  strip.addEventListener('pointerup', release);
  strip.addEventListener('pointercancel', release);
  strip.addEventListener('pointerleave', () => { if (!moved) release(); });
  strip.addEventListener('click', event => {
    if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
  }, true);
  const tick = time => {
    const dt = Math.min(time - (last || time), 50); last = time;
    if (visible && !document.hidden && !reduced.matches && !drag && time > resumeAt) {
      drift += dt * width / 180000;
      if (drift >= 1) { const step = Math.floor(drift); strip.scrollLeft += step; drift -= step; wrap(); }
    }
    requestAnimationFrame(tick);
  };
  resize(); requestAnimationFrame(tick);
};
