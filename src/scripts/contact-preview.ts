export {};
const type = document.querySelector<HTMLSelectElement>('#project-type');
const description = document.querySelector<HTMLTextAreaElement>('#project-description');
const button = document.querySelector<HTMLButtonElement>('[data-copy-button]');
const status = document.querySelector<HTMLElement>('[data-copy-status]');
const fallback = document.querySelector<HTMLElement>('[data-manual-copy]');
const manual = document.querySelector<HTMLTextAreaElement>('#manual-description');

if (type && description && button && status && fallback && manual) {
  button.hidden = false;
  document.querySelectorAll<HTMLElement>('[data-project-type]').forEach((link) => {
    link.addEventListener('click', () => { type.value = link.dataset.projectType || 'unsure'; });
  });
  button.addEventListener('click', async () => {
    if (!description.value.trim()) {
      status.textContent = 'Добавьте несколько слов о задаче.';
      description.setAttribute('aria-invalid', 'true');
      description.focus();
      return;
    }
    description.removeAttribute('aria-invalid');
    const text = `Формат сайта: ${type.options[type.selectedIndex].text}\n\nО задаче:\n${description.value.trim()}`;
    status.textContent = '';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      fallback.hidden = true;
      manual.value = '';
      status.textContent = 'Описание скопировано';
    } catch {
      manual.value = text;
      fallback.hidden = false;
      status.textContent = 'Автоматическое копирование недоступно. Скопируйте текст ниже.';
      manual.focus();
      manual.select();
    }
  });
  description.addEventListener('input', () => {
    description.removeAttribute('aria-invalid');
    status.textContent = '';
    fallback.hidden = true;
    manual.value = '';
  });
}
