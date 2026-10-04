# Миллион элементов в списке (frontend + backend)
Монорепозиторий.

Приложение для работы со списком из 1 000 000 элементов: выбор, фильтрация по ID, добавление новых ID и сортировка выбранных перетаскиванием. Монорепозиторий: API на Express и SPA на React.

## Быстрый старт

Нужны Node.js ≥ 24.12 и pnpm 12 (версия закреплена в `packageManager`).

```bash
pnpm install
pnpm dev
```

UI — http://localhost:5173, API — http://localhost:3000. Vite проксирует `/api` на сервер.

Прод-сборка фронтенда: `pnpm build && pnpm start` (API и `vite preview` на http://localhost:4173).

| Скрипт           | Что делает                     |
| ---------------- | ------------------------------ |
| `pnpm dev`       | API и UI в режиме разработки   |
| `pnpm build`     | сборка UI                      |
| `pnpm start`     | API и собранный UI             |
| `pnpm typecheck` | `tsc --noEmit` во всех пакетах |
| `pnpm lint`      | ESLint                         |
| `pnpm format`    | Prettier                       |

## Структура

```
apps/
  server/            Express 5, DDD-слои
    src/domain/          агрегаты Catalog и Selection, доменные ошибки
    src/application/     сервисы сценариев, очереди и планировщик батчей
    src/interfaces/http/ роутеры, zod-схемы, маппинг ошибок в HTTP
  web/               React 19 + Vite 8
    src/app/             корень приложения, раскладка, QueryClient
    src/domains/         catalog (все элементы, добавление) и selection (выбранные, DnD)
    src/shared/          HTTP-клиент, работа с кэшем списков, общие компоненты
packages/
  contracts/         типы API и правила, общие для клиента и сервера
  ui/                UI-kit: дизайн-токены, брейкпоинты, компоненты, иконки
```

### API

| Метод    | Путь                                           | Ответ                                         |
| -------- | ---------------------------------------------- | --------------------------------------------- |
| `GET`    | `/api/items?query=&after=`                     | `{ ids, hasMore, total }` — невыбранные по ID |
| `POST`   | `/api/items` `{ id }`                          | `202 { appliesInMs }`; `409`, если ID есть    |
| `GET`    | `/api/selection?query=&after=`                 | `{ ids, hasMore, total }` в порядке выбора    |
| `PUT`    | `/api/selection/:id`                           | `202`; `404`, если ID не существует           |
| `DELETE` | `/api/selection/:id`                           | `202`                                         |
| `PATCH`  | `/api/selection/:id` `{ anchorId, placement }` | `202`                                         |

`after` — последний ID, который уже есть у клиента. `total` — размер списка без фильтра. `GET /api/selection` отвечает `409`, если элемента-курсора больше нет в выбранных (его снял другой пользователь): клиент перезагружает список.

Повторный `POST` с ID, который уже ждёт батча (например, из соседней вкладки), не ставится в очередь второй раз: он получает `202` с тем же `appliesInMs`, и элемент добавляется один раз.
