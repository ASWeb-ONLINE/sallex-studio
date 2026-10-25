# GitHub и размещение

## Состояние на 25 октября 2026 года

[Репозиторий исходников](https://github.com/ASWeb-ONLINE/sallex-studio) — **public**. При начале проверки GitHub API уже вернул public-видимость и Pages с источником GitHub Actions; исполнитель не менял видимость. Новое поручение владельца разрешает завершить публикацию и дальнейшее редактирование через GitHub. Оно заменяет решение 15.10.2026 отложить Pages.

[Адрес Pages, полученный из API](https://asweb-online.github.io/sallex-studio/). При начале проверки URL отвечал 404: переменная PAGES_ENABLED отсутствовала, поэтому два прежних успешных workflow проверяли код, но пропускали публикацию. Завершение выпуска проверяется по успешному deploy и живой странице; фактический результат — в [QA](qa-report.md).

Платные возможности не включаются. Исходники и опубликованная страница доступны публично. Noindex/nofollow сохраняется для preview; это просьба поисковым роботам, не контроль доступа.

## Как открывать и обновлять сайт

GitHub хранит исходники; Pages показывает собранную страницу по постоянной ссылке. Ссылка указана в README, а после успешной публикации — и в поле Website блока About репозитория. Локальный сервер нужен только для разработки и не требуется посетителю.

Изменения через Codex выполняются в этой же рабочей копии: проверка состояния Git → правки нужных файлов → локальные проверки и просмотр → обычный commit/push в main. Затем GitHub Actions автоматически проверяет и публикует обновление. Отдельный архив, ручная загрузка dist или второй репозиторий не нужны. Будущая сессия Codex должна иметь доступ к рабочей копии и авторизованному GitHub.

## Проверки и публикация GitHub Actions

Workflow `.github/workflows/pages.yml` запускается на push в main, pull request и вручную:

1. Checkout без сохранения токена в рабочем дереве; Node из `.node-version`, pnpm 11.25.0, frozen lockfile.
2. Astro check. Для публикации — чтение реальных метаданных Pages через configure-pages.
3. Статическая сборка, установка Chromium, 20 браузерных тестов production-сборки и измерение файлов.
4. При `PAGES_ENABLED=true`, только для main и вне pull request — загрузка исключительно dist и deploy в github-pages.

Официальные actions закреплены полными SHA. Job check получает `contents: read` и `pages: read` для получения настроек Pages; `pages: write` и `id-token: write` есть только у deploy. Секреты в коде не требуются. Локальные референсы, снимки, данные исследований и сырые отчеты в dist не входят.

## Адреса и проверка выпуска

`astro.config.mjs` читает `SITE_URL` и `BASE_PATH`. Для проекта base — `/sallex-studio/`, в CI он строится из имени репозитория. Configure-pages возвращает origin `https://asweb-online.github.io` для SITE_URL. Внутренние ссылки, ресурсы, favicon, social preview и возврат из 404 используют base. SPA fallback не нужен.

После каждого выпуска:

1. Дождаться успешных check и deploy одного SHA в [Actions](https://github.com/ASWeb-ONLINE/sallex-studio/actions).
2. Открыть адрес из результата deploy или Pages API.
3. Сверить `meta[name=build-revision]` с SHA, проверить стили/шрифты/графику, desktop/mobile, меню, FAQ, подсветку и копирование.
4. Проверить неизвестный маршрут и возврат на главную. Не принимать старую кешированную страницу за новый выпуск.

Для браузерных тестов опубликованной версии в PowerShell:

```powershell
$env:TEST_ORIGIN = 'https://asweb-online.github.io'
$env:BASE_PATH = '/sallex-studio/'
$env:VISUAL_PASS = 'published'
node node_modules/@playwright/test/cli.js test
Remove-Item Env:TEST_ORIGIN, Env:BASE_PATH, Env:VISUAL_PASS
```

## Исправления и сохранность

Перед commit проверять diff и индекс. Не включать посторонние незакоммиченные материалы: при проверке 25.10.2026 в рабочей папке были отдельные исследования OSM, не относящиеся к выпуску сайта. Они должны сохраняться локально, пока их включение в репозиторий не согласовано отдельно.

Исправление выпускается новым commit. Для отмены отдельного ошибочного изменения применять `git revert <commit>` после проверки состояния, затем тесты и push. Не использовать force push, переписывание истории или замену remote. Отмена первого коммита удаляет весь сайт, поэтому исходную версию следует исправлять конкретными правками.

Техническая основа: [GitHub — настройка публикации](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Astro — GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).
