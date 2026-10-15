# Sallex Studio

Авторский сайт Александра Сальникова: дизайн и разработка сайтов. Завершенная одностраничная preview-версия на Astro, TypeScript и собственном CSS: светлая крупная типографика SALLEX, монохромные секции, небольшие красные акценты и локальное проявление цвета на двух схемах услуг.

**Этап: IMPLEMENTATION_AND_PREVIEW.** Разработка разрешена владельцем 15.10.2026; PREPARATION_ONLY завершен. Дизайн подготовлен для оценки владельцем, окончательное визуальное принятие не заявляется.

**Исходники:** [ASWeb-ONLINE/sallex-studio](https://github.com/ASWeb-ONLINE/sallex-studio), private. **Публичного сайта пока нет:** GitHub отклонил Pages для этого private-репозитория на текущем тарифе. Владелец решил сохранить приватность и пока не публиковать Pages. Workflow выполняет проверки; публикация отключена.

## Запуск и проверка

Node 24.19.0 (см. `.node-version`), pnpm 11.25.0 (см. `packageManager`). Версии зависимостей зафиксированы в `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm dev
# http://127.0.0.1:4321/sallex-studio/
```

```sh
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm measure
pnpm preview
```

Тесты запускают production preview автоматически, если сервер еще не работает. Для просмотра готовой сборки применяется `pnpm preview`; остановка — Ctrl+C. Если pnpm не добавлен в PATH, команды исполняются через доступный runtime: `node <путь-к-pnpm.cjs> <команда>`. В рабочем окружении разработки использован именно bundled pnpm; глобальные настройки и пакеты не менялись.

Для уже установленных зависимостей доступны прямые команды:

```sh
node node_modules/astro/bin/astro.mjs check
node node_modules/astro/bin/astro.mjs build
node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4321
node node_modules/@playwright/test/cli.js test
node scripts/measure-build.mjs
```

## Где менять содержание

| Область | Файл |
| --- | --- |
| Услуги, подход, FAQ | `src/data/content.ts` |
| Название, метаданные, автор, контакты | `src/data/site.ts` |
| Тексты первого экрана, автора и контактного блока | `src/components/Hero.astro`, `About.astro`, `Contact.astro` |
| Палитра, шрифты, радиус и интенсивность света | `src/styles/tokens.css` |
| Сетка, размеры, адаптивность | `src/styles/global.css` |
| Локальная подсветка | `src/scripts/spotlight.ts`, `src/components/SpotlightSurface.astro` |
| Копирование и ручная альтернатива | `src/scripts/contact-preview.ts` |
| Модель будущих проектов | `src/data/projects.ts` |
| Сборка и будущие пути Pages | `astro.config.mjs`, `.github/workflows/pages.yml` |

Контакты не предоставлены: `contactMode: 'preview'`, список пуст. Поле описания ничего не отправляет и не сохраняет. Кнопка реально копирует текст в буфер; при отказе браузера появляется поле ручного копирования. Для будущих прямых ссылок нужно добавить только подтвержденные контакты и переключить `contactMode` на `direct`; это не включает прием заявок.

Портфолио, кейсы, отзывы, цены, аналитика, коммерческие интеграции и backend отсутствуют. Модель проектов не импортирована в публичную страницу; пустых карточек, маршрутов и пунктов меню нет. Реальные проекты потребуют отдельной реализации представления после получения материалов и разрешения на публикацию.

## Материалы и документы

Оригинальные SVG-схемы, знак S, favicon и social preview созданы для сайта из кода. Oswald и Golos Text раздаются локально; лицензии OFL лежат в `public/licenses/`. Генератор social preview: `scripts/generate-social.mjs` (требует работающего локального preview). Чужие изображения в сайт не включены.

- [Текущее ТЗ](docs/development-spec.md), [решения](docs/decisions.md), [ход реализации](docs/implementation-plan.md).
- [Фактические проверки и снимки](docs/qa-report.md), [GitHub и публикация](docs/deployment.md).
- [Правила проекта](AGENTS.md), [материалы](materials/README.md), [реестр референсов](references/README.md).
- Подготовительные документы сохранены с пометкой исторического этапа; их ограничения не заменяют новое поручение.

Референсы и оригиналы вложений находятся в исключенной из Git `references/local-only/`. Скриншоты, сырые отчеты, резервная копия документов подготовки — в исключенной `reports/local-only/`. Эти ссылки работают только в исходной рабочей папке. В Git попадают исходники, lock-файл, безопасные документы, собственные материалы и workflow; `dist`, зависимости, секреты и локальные референсы исключены.
