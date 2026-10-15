export {};
const menu = document.querySelector<HTMLDetailsElement>('.mobile-menu');
const summary = menu?.querySelector<HTMLElement>('summary');

if (menu && summary) {
  const close = (restoreFocus: boolean) => {
    menu.open = false;
    if (restoreFocus) summary.focus();
  };
  menu.addEventListener('toggle', () => {
    summary.setAttribute('aria-label', menu.open ? 'Закрыть меню' : 'Открыть меню');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) close(true);
  });
  menu.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.addEventListener('click', () => {
      close(false);
      const target = document.getElementById(link.hash.slice(1));
      // Move keyboard focus with the navigation, never leave it in the closed panel.
      if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    });
  });
  document.addEventListener('pointerdown', (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) close(false);
  });
  matchMedia('(min-width: 801px)').addEventListener('change', (event) => { if (event.matches) close(false); });
}
