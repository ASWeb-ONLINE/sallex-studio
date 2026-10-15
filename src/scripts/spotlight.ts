export {};
const surfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-spotlight]'));
const enabledMedia = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const supportsMask = CSS.supports('mask-image', 'radial-gradient(black, transparent)');

function attach(surface: HTMLElement) {
  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true };
  let frame = 0;
  let active = false;
  let rect: DOMRect | undefined;
  let clientX = 0;
  let clientY = 0;
  let geometryDirty = true;

  function paint() {
    frame = 0;
    if (!active) return;
    if (geometryDirty || !rect) {
      rect = surface.getBoundingClientRect();
      geometryDirty = false;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) { leave(); return; }
    surface.style.setProperty('--pointer-x', `${x}px`);
    surface.style.setProperty('--pointer-y', `${y}px`);
    // Set position before revealing: no initial flash at the default coordinates.
    surface.setAttribute('data-active', '');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  function enter(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    active = true;
    geometryDirty = true;
    clientX = event.clientX; clientY = event.clientY;
    schedule();
  }
  function move(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    if (!active) { enter(event); return; }
    clientX = event.clientX; clientY = event.clientY;
    schedule();
  }
  function leave() {
    active = false;
    cancelAnimationFrame(frame); frame = 0;
    surface.removeAttribute('data-active');
  }
  function invalidate() { geometryDirty = true; if (active) schedule(); }
  surface.addEventListener('pointerenter', enter, options);
  surface.addEventListener('pointermove', move, options);
  surface.addEventListener('pointerleave', leave, options);
  surface.addEventListener('pointercancel', leave, options);
  window.addEventListener('scroll', invalidate, { ...options, capture: true });
  window.addEventListener('resize', invalidate, options);
  window.addEventListener('blur', leave, options);
  const observer = new ResizeObserver(invalidate);
  observer.observe(surface);
  return () => { leave(); observer.disconnect(); controller.abort(); };
}

let cleanup: (() => void)[] = [];
function sync() {
  cleanup.forEach((dispose) => dispose()); cleanup = [];
  if (supportsMask && enabledMedia.matches && !document.hidden) cleanup = surfaces.map(attach);
}
enabledMedia.addEventListener('change', sync);
document.addEventListener('visibilitychange', sync);
sync();
