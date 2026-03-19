## 🎬 ИНСТРУКЦІЯ ДЛЯ ЗАПУСКУ СИСТЕМИ АВТОМАТИЧНОГО ПОШУКУ УКРАЇНСЬКОГО ДУБЛЮВАННЯ

### ⚙️ Крок 1: Налаштування Supabase

1. Перейдіть в ваш Supabase Dashboard
2. Перейдіть в **SQL Editor** 
3. Натисніть **"New Query"**
4. Скопіюйте і вставте весь код з файлу `/scripts/001_create_schema.sql`
5. Натисніть **"Run"** (або Ctrl+Enter)

Це створить три таблиці:
- `movies` - для зберігання інформації про фільми
- `dubbing` - для українського дублювання
- `ai_dubbing_queue` - для отслідження обробки

### 📝 Крок 2: Налаштування середовищних змінних

В `.env.local` додайте/обновіть:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=ваша_url_з_supabase_dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key

# TMDB API (за бажанням, для завантаження постерів)
TMDB_API_KEY=ваш_tmdb_api_key
```

### 🔒 Крок 3: Увімкнення Row Level Security (RLS)

Для кожної таблиці (`movies`, `dubbing`, `ai_dubbing_queue`):

1. В Supabase Dashboard перейдіть в **Authentication → Policies**
2. Виберіть таблицю
3. Натисніть **"Enable RLS"**
4. Натисніть **"New Policy"** → **"For all users using"**
5. Виберіть операцію **SELECT** → **Permissions: USING** → `true`
6. Натисніть **"Save"**
7. Повторіть для **INSERT** і **UPDATE**

### 🚀 Крок 4: Запуск додатку

```bash
npm install
npm run dev
```

Додаток буде доступний на `http://localhost:3000`

### 🔄 Крок 5: Активація автоматичного пошуку

#### Варіант A: Локальне тестування

Відкрийте в браузері:
```
http://localhost:3000/api/cron/auto-search-dubbing
```

#### Варіант B: На Vercel (production)

1. Розгорніть на Vercel (якщо ще не зробили)
2. Vercel автоматично буде запускати `/api/cron/auto-search-dubbing` кожні 6 годин
3. Можна налаштувати частоту в `vercel.json`

### ✨ Как это работает

1. **Користувач відкриває фільм**
   - Система перевіряє чи є дублювання в базі
   - Якщо немає → запускає AI пошук

2. **AI пошук запускається**
   - API `/api/ai-dubbing-search` отримує запит
   - Завантажує дані з TMDB (постер, опис, назва)
   - Шукає українське дублювання в демо базі
   - Додає результат в базу Supabase

3. **Автоматичний пошук (cron)**
   - Кожні 6 годин система шукає фільми без дублювання
   - Автоматично додає дублювання до нових фільмів
   - Ніякої ручної роботи!

### 📊 Демо дублювання (вже в системі)

Система знає про дублювання для:
- **Avengers** → "Месники" (1+1 Кіно, Full HD, з субтитрами)
- **Avatar** → "Аватар" (Канал 1+1, 4K, з субтитрами)
- **Inception** → "Начало" (Перший Український, Full HD)
- **Interstellar** → "Інтерстеллар" (1+1 Кіно, Full HD)
- **The Matrix** → "Матриця" (Дім Кіно, HD)

### 🎯 Як розширити систему

Щоб інтегрувати реальні бази дублювання:

1. Отворіть `/app/api/ai-dubbing-search/route.ts`
2. Знайдіть функцію `simulateAIDubbingSearch()`
3. Замініть демо базу на реальні API виклики:

```typescript
// Приклад інтеграції з реальною базою
const response = await fetch('https://dubbing-database.com/api/search', {
  method: 'POST',
  body: JSON.stringify({ title, year }),
});
const realDubbing = await response.json();
return realDubbing;
```

### 🐛 Вирішення проблем

**Проблема: "Таблиці не знайдені"**
- Перевірте, чи SQL був виконаний в Supabase
- Перегляньте логи в Supabase Dashboard

**Проблема: "Помилка підключення до Supabase"**
- Перевірте URL і ключи в `.env.local`
- Переконайтеся, що Supabase проект активний

**Проблема: "Media unavailable" при програванні**
- Це нормально для демо версії
- Додайте реальні посилання на відео в таблицю `dubbing`
- Оновіть поле `video_url`

**Проблема: AI пошук не знаходить дублювання**
- Перевірте формат назви фільму (мають відповідати демо базі)
- Додайте більше прикладів в `dubbingDatabase` об'єкт
- Або інтегруйте реальну базу дублювання

### 📱 API для мобільного додатку

Ваш Vercel додаток надає REST API:

```bash
# Отримати всі фільми з дубляжем
curl https://your-domain.vercel.app/api/movies-with-dubbing

# Пошук дублювання для конкретного фільму
curl -X POST https://your-domain.vercel.app/api/ai-dubbing-search \
  -H "Content-Type: application/json" \
  -d '{"tmdbId": 550, "title": "Fight Club"}'

# Запустити автоматичний пошук
curl https://your-domain.vercel.app/api/cron/auto-search-dubbing
```

### 🎉 Готово!

Тепер у вас є повнофункціональна система для:
✅ Автоматичного пошуку українського дублювання
✅ Завантаження постерів та описів з TMDB
✅ Фонового оновлення нових фільмів
✅ Сховища всіх даних в Supabase

Бажаємо вам успіху! 🚀
