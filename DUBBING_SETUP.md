## Українська кіно база з AI дубляжем

### Система автоматичного пошуку українського дублювання

Цей проект дозволяє автоматично знаходити і додавати українське дублювання до фільмів.

#### Основні компоненти

1. **AI Dubbing Search API** (`/api/ai-dubbing-search`)
   - Пошук українського дублювання для фільму
   - Автоматичне завантаження постера, опису та назви з TMDB
   - Додавання даних до бази Supabase

2. **Movies API** (`/api/movies-with-dubbing`)
   - Отримання списку фільмів з інформацією про дублювання

3. **Auto-Search Cron** (`/api/cron/auto-search-dubbing`)
   - Автоматичний пошук дублювання для фільмів без нього
   - Розрахована на запуск через cronjob

#### Налаштування

##### 1. Створіть таблиці в Supabase

Виконайте SQL з файлу `scripts/001_create_schema.sql` в Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(3,1) DEFAULT 0,
  year INTEGER,
  duration TEXT,
  genres TEXT[] DEFAULT '{}',
  poster_url TEXT,
  backdrop_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dubbing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  title_uk TEXT NOT NULL,
  studio TEXT NOT NULL,
  quality TEXT DEFAULT 'HD',
  has_subtitles BOOLEAN DEFAULT false,
  voice_actors TEXT,
  video_url TEXT,
  source_site TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_dubbing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_dubbing_tmdb_id ON public.dubbing(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON public.ai_dubbing_queue(status);
```

##### 2. Встановіть середовищні змінні

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TMDB_API_KEY=your_tmdb_api_key (необов'язково)
```

##### 3. Увімкніть RLS (Row Level Security)

В Supabase dashboard, для кожної таблиці:
- Увімкніть RLS
- Додайте Policy для SELECT:
  ```sql
  CREATE POLICY "Enable read access for all users" ON movies FOR SELECT USING (true);
  ```

#### Використання

##### Автоматичний пошук дублювання

Коли користувач відкриває фільм, система:
1. Перевіряє чи є дублювання в базі
2. Якщо немає, запускає AI пошук через `/api/ai-dubbing-search`
3. Завантажує дані з TMDB (постер, опис, назва)
4. Зберігає в базі Supabase

##### Запуск фонового пошуку

Можна налаштувати cronjob через Vercel:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/auto-search-dubbing",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Або виконайте вручну:
```bash
curl https://your-domain.vercel.app/api/cron/auto-search-dubbing
```

#### API Endpoints

**POST /api/ai-dubbing-search**
```json
{
  "tmdbId": 550,
  "title": "Fight Club",
  "forceRefresh": false
}
```

**GET /api/movies-with-dubbing**
Повертає список фільмів з інформацією про дублювання

**GET /api/cron/auto-search-dubbing**
Запускає автоматичний пошук дублювання

#### Демо дані

Система включає демо дублювання для популярних фільмів:
- Avengers → Месники (1+1 Кіно)
- Avatar → Аватар (Канал 1+1)
- Inception → Начало (Перший Український)
- Interstellar → Інтерстеллар (1+1 Кіно)
- The Matrix → Матриця (Дім Кіно)

#### Розширення

Для інтеграції з реальними базами дублювання:

1. Оновіть `simulateAIDubbingSearch()` в `/api/ai-dubbing-search/route.ts`
2. Додайте API виклики до databases з українським дубляжем
3. Реалізуйте AI модель для пошуку через Groq або OpenAI

#### Структура файлів

```
app/
├── api/
│   ├── ai-dubbing-search/route.ts    # AI пошук дублювання
│   ├── movies-with-dubbing/route.ts  # API список фільмів
│   └── cron/
│       └── auto-search-dubbing/route.ts  # Фоновий пошук
lib/
├── dubbing.ts                         # Функції роботи з дубляжем
├── movies.ts                          # Функції роботи з фільмами
└── supabase/
    ├── client.ts
    ├── server.ts
    └── middleware.ts
scripts/
├── 001_create_schema.sql              # Схема бази даних
└── setup-db.js                        # Setup скрипт
```

#### Помилки та їхні рішення

**"Media unavailable" помилка**
- Перевірте наявність `video_url` в таблиці `dubbing`
- Додайте fallback джерела для потокового відео

**Таблиці не знайдені**
- Виконайте SQL з `scripts/001_create_schema.sql` в Supabase
- Перевірте RLS policies

**AI пошук не працює**
- Перевірте TMDB_API_KEY в `.env.local`
- Перегляньте логи API
