export const site = {
  name: 'Sallex Studio',
  title: 'Sallex Studio - дизайн и разработка сайтов',
  description: 'Авторская веб-студия Александра Сальникова. Структура, дизайн и разработка сайтов в одном процессе.',
  author: 'Александр Сальников',
  mode: 'preview' as const,
  contactMode: 'preview' as 'preview' | 'direct',
  contacts: [] as { label: string; url: string }[],
  repository: '',
};

export const basePath = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const localPath = (path = '') => `${basePath}${path.replace(/^\//, '')}`;

export const navigation = [
  { label: 'Услуги', id: 'services' },
  { label: 'Подход', id: 'approach' },
  { label: 'О студии', id: 'about' },
  { label: 'Контакты', id: 'contact' },
];
