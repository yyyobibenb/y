# Деплой на Render с Python + Node.js

## Как работает система

### 1. Автоматический запуск
- Node.js сервер запускается обычно: `npm run dev` или `npm start`
- Когда нужны данные Flashscore, Node.js **автоматически** вызывает Python скрипт
- Никаких отдельных сервисов не нужно - всё в одном процессе

### 2. Архитектура
```
Node.js Server (основной процесс)
    ↓ (вызывает когда нужно)
Python Script (flashscore_data_fetcher.py)
    ↓ (возвращает JSON)
Node.js получает данные и сохраняет в базу
```

## Настройка для Render

### 1. Создать Web Service на Render
- Repository: твой GitHub репозиторий
- Environment: **Node.js** (не Python!)
- Build Command: `npm install && pip install flashscore-scraper==0.0.7 pandas requests`
- Start Command: `npm start`

### 2. Environment Variables на Render
```
NODE_ENV=production
DATABASE_URL=твой_postgres_url_от_render
FLASHSCORE_MICROSERVICE_URL=http://localhost:8000
```

### 3. Render автоматически:
- Установит Node.js и npm пакеты
- Установит Python и pip пакеты в build команде
- Запустит Node.js сервер
- Python будет доступен для вызова из Node.js

### 4. Что происходит при запуске:
1. Render запускает `npm start`
2. Node.js сервер стартует на порту 5000
3. Cron jobs начинают работать автоматически
4. Когда нужны данные → Node.js вызывает Python скрипт
5. Python скрипт работает и возвращает JSON
6. Node.js получает данные и обновляет базу

## Проверка работы

### Локально (в Replit):
```bash
# Проверить что Python скрипт работает
cd server/scripts
python flashscore_data_fetcher.py --sport football --limit 3

# Включить API в админке
# Зайти в админку → Settings → включить "Use API for Match Data"
```

### На Render:
- Логи покажут вызовы Python скрипта
- В админке будут появляться новые матчи каждые 5 минут
- Коэффициенты будут обновляться каждые 30 секунд

## Преимущества этого подхода:

✅ **Один процесс** - не нужно настраивать отдельные сервисы
✅ **Автоматический запуск** - Python стартует только когда нужно
✅ **Простой деплой** - один репозиторий, одна настройка
✅ **Экономия ресурсов** - Python не висит в памяти постоянно
✅ **Надёжность** - если Python упадёт, Node.js продолжит работать с fallback данными

## Альтернативные варианты:

### Вариант 1: Отдельный Python сервис (сложнее)
- Создать отдельный Python web service на Render
- Настроить HTTP API между Node.js и Python
- Больше настроек, больше ресурсов

### Вариант 2: Docker (ещё сложнее)
- Один Docker контейнер с Node.js + Python
- Нужен Dockerfile и docker-compose
- Render поддерживает, но сложнее настройки

**Рекомендую первый вариант** - он уже настроен и работает!