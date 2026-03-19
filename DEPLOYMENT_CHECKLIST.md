## ✅ ЧЕКЛИСТ ДЛЯ ЗАПУСКУ СИСТЕМИ

### 📋 Перед тим як почати

- [ ] У вас є Vercel аккаунт та проект
- [ ] У вас є Supabase проект
- [ ] Git репозиторій клонований на локальний комп'ютер
- [ ] Node.js встановлений (v18+)

### 🗄️ Крок 1: Налаштування БД (5-10 хвилин)

- [ ] Перейти в Supabase Dashboard
- [ ] Відкрити SQL Editor
- [ ] Копіювати код з `/scripts/001_create_schema.sql`
- [ ] Вставити в SQL Editor
- [ ] Натиснути "Run"
- [ ] Перевірити що таблиці створені (в розділі Tables)

### 🔐 Крок 2: Row Level Security (5 хвилин)

Для кожної таблиці (`movies`, `dubbing`, `ai_dubbing_queue`):

- [ ] Перейти в **Authentication → Policies**
- [ ] Виберіть таблицю
- [ ] Натиснути **"Enable RLS"**
- [ ] Додати Policy:
  - Operation: SELECT
  - USING: `true`
- [ ] Додати Policy:
  - Operation: INSERT
  - WITH CHECK: `true`
- [ ] Додати Policy:
  - Operation: UPDATE
  - USING: `true`

### 🔑 Крок 3: Середовищні змінні (5 хвилин)

- [ ] Копіювати ключ **Project URL** з Supabase
- [ ] Копіювати **Anon Key** з Supabase Settings
- [ ] Копіювати **Service Role Key** з Supabase Settings
- [ ] Додати/оновити `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=<Project URL>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<Anon Key>
  SUPABASE_SERVICE_ROLE_KEY=<Service Role Key>
  ```
- [ ] (Optional) Додати TMDB_API_KEY з tmdb.org

### 💻 Крок 4: Локальне тестування (5-10 хвилин)

```bash
# Встановити залежності
npm install

# Запустити dev сервер
npm run dev

# У іншому терміналі, тестувати API:
node scripts/test-dubbing.js
```

- [ ] Додаток запустився на `http://localhost:3000`
- [ ] Тестовий скрипт пройшов всі перевірки
- [ ] Можна відкрити фільм і побачити дублювання

### 🚀 Крок 5: Розгортування на Vercel (5-10 хвилин)

```bash
# Коміт змін
git add .
git commit -m "Add AI dubbing system"
git push
```

- [ ] Vercel автоматично розпочав розгортання
- [ ] Розгортання завершилось успішно
- [ ] Додаток доступний на production URL

### ⏰ Крок 6: Активація Cron (5 хвилин)

- [ ] Перейти в Vercel Project Settings
- [ ] В розділі **Crons** перевірити, що cronjob налаштований
- [ ] Розпланово cronjob буде запускатися кожні 6 годин
- [ ] (Optional) Тестувати cronjob вручну:
  ```bash
  curl https://your-domain.vercel.app/api/cron/auto-search-dubbing
  ```

### ✨ Крок 7: Перша автоматична обробка

- [ ] Дочекатися першого запуску cronjob (або запустити вручну)
- [ ] Перевірити в Supabase, що нові фільми додалися в таблицю `movies`
- [ ] Перевірити що дублювання додалось в таблицю `dubbing`
- [ ] Перегляньти логи в Vercel

---

## 🎯 Як це працює після налаштування

### Сценарій 1: Користувач відкриває фільм

```
1. Користувач клікає на фільм
2. Система перевіряє чи є дублювання в базі
3. Якщо НЕМАЄ:
   - Запускає API /api/ai-dubbing-search
   - Завантажує дані з TMDB (постер, опис)
   - Шукає дублювання
   - Додає результат в базу
4. Користувач бачить дублювання та постер
```

### Сценарій 2: Cronjob запускається (кожні 6 годин)

```
1. Vercel запускає /api/cron/auto-search-dubbing
2. Система знаходить 5 фільмів без дублювання
3. Для кожного фільму:
   - Запускає AI пошук
   - Додає результат в базу
4. Звіт: обработано 5, успішно 4, помилок 1
```

---

## 🐛 Частовідповідальні проблеми

### ❌ "Таблиці не знайдені"
**Рішення:**
1. Перевіритьчи SQL був виконаний
2. Перегляньте Tables список в Supabase
3. Виконайте SQL ще раз

### ❌ "Помилка аутентифікації Supabase"
**Рішення:**
1. Перевірте URL та ключі в `.env.local`
2. Скопіюйте їх ще раз з Supabase Dashboard
3. Перезапустіть `npm run dev`

### ❌ "Media unavailable" при грі
**Рішення:**
1. Це нормально для демо версії
2. Добавте реальні видеоссилки в поле `video_url` таблиці `dubbing`
3. Див. `/DUBBING_SETUP.md` для розширення

### ❌ "Cronjob не запускається"
**Рішення:**
1. Перевірте `vercel.json` має cronjob налаштування
2. Розгорніть нову версію на Vercel
3. Перегляньте логи в Vercel Dashboard

---

## 📞 Додаткова допомога

**Файли для прочитання:**
- 📄 `/SETUP_INSTRUCTIONS.md` - покроковий гайд
- 📄 `/DUBBING_SETUP.md` - технічна документація  
- 📄 `/SYSTEM_SUMMARY.md` - огляд системи

**Корисні посилання:**
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Crons](https://vercel.com/docs/crons)
- [TMDB API](https://developer.themoviedb.org/)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🎉 Готово!

Якщо ви виконали всі кроки - ви готові до використання! 🚀

**Наступні кроки:**
1. Тестуйте систему локально
2. Розгорніть на Vercel
3. Спостерігайте як cronjob автоматично додає дублювання
4. Розширяйте з реальними базами дублювання

Успіхів! 🎬
