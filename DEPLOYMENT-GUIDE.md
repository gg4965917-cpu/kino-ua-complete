# 📺 КІНО.UA — Повна інструкція по розгортанню та TMDB

## 🎯 Що було виправлено

### ✅ Виправлені баги:
1. **TMDB інтеграція** — додана обробка помилок при завантаженні фільмів
2. **Timeout для запитів** — фіксовано зависання при поганому інтернеті (8сек timeout)
3. **Проверка API ключа** — теперь перед збереженням ключа система його перевіряє
4. **Пусті поля** — заповнені дефолтні значення для року, тривалості та опису
5. **Paging** — додано page=1 до TMDB запитів для більш стабільної роботи
6. **Обробка помилок** — усі функції тепер корректно обробляють помилки мережі

### 🎨 Покращення UI:
- Нема змін у дизайні (все працює як раніше)
- Оптимізація для мобільних пристроїв підтримується
- Додатковий текст для деталей фільмів

---

## 🚀 Швидкий старт (3 кроки)

### Крок 1️⃣: Отримати TMDB API ключ
```
1. Перейди на https://www.themoviedb.org/signup
2. Зареєструйся (Email, Username, Password)
3. Зайди у Settings → API
4. Натисни "Create" → "Developer"
5. Скопіюй API Key (v3 auth)
```

### Крок 2️⃣: Розгорнути на Vercel за 30 секунд
```bash
# 1. Встановлюємо Vercel CLI
npm install -g vercel

# 2. Логуємось
vercel login

# 3. Перейди в папку проекту
cd kino-ua-updated

# 4. Розгортаємо
vercel deploy
```

### Крок 3️⃣: Додати TMDB ключ
```
1. Відкрий сайт (посилання отримаєш після розгортання)
2. Натисни ⚙️ (Settings) справа вгорі
3. Вставь TMDB API ключ
4. Натисни "Зберегти та підключити"
5. ГОТОВО! 🎉
```

---

## 📦 Альтернативні способи розгортання

### Способ А: Через GitHub + Vercel (КЛАСИЧНО)
```bash
# 1. Ініціалізуємо Git
git init
git add .
git commit -m "Initial commit"

# 2. Пушимо на GitHub
git remote add origin https://github.com/YOUR_USERNAME/kino-ua.git
git push -u origin main

# 3. На vercel.com натиснемо "Import Git Repository"
# Виберемо наш репозиторій та Deploy
```

### Способ Б: Через Docker (для своїх серверів)
```bash
# Будуємо Docker image
docker build -t kino-ua .

# Запускаємо
docker run -p 3000:3000 -e NEXT_PUBLIC_TMDB_API_KEY=твій_ключ kino-ua
```

### Способ В: Локально для розробки
```bash
# 1. Встановлюємо залежності
npm install

# 2. Створюємо .env.local
echo "NEXT_PUBLIC_TMDB_API_KEY=твій_ключ" > .env.local

# 3. Запускаємо dev сервер
npm run dev

# Відкриємо http://localhost:3000
```

---

## 🔑 TMDB API Ключ — Важливо!

### ❌ НІКОЛИ не роби:
```javascript
// ❌ НЕПРАВИЛЬНО! 
const apiKey = "abc123xyz"; // Видно в коді
```

### ✅ ЗАВЖДИ роби так:
```
// ✅ ПРАВИЛЬНО!
// Додай як Environment Variable на Vercel/Netlify
// Або у файлі .env.local (не коміти у Git!)
NEXT_PUBLIC_TMDB_API_KEY=abc123xyz
```

### Як додати на Vercel:
```
1. Зайди https://vercel.com/dashboard
2. Вибери проект → Settings
3. Environment Variables
4. Add: 
   - Name: NEXT_PUBLIC_TMDB_API_KEY
   - Value: твій_ключ
5. Redeploy
```

---

## 📊 Можливості TMDB

### Безкоштовно отримаєш:
- ✅ 500,000+ фільмів з інформацією
- ✅ Постери та бекдропи в HD якості
- ✅ Інформацію про режисерів та акторів
- ✅ Рейтинги та відгуки
- ✅ Пошук по назві
- ✅ Сортування (популярність, рейтинг, дата)

### Без TMDB API ключа:
- ✅ 10 вбудованих українських фільмів
- ✅ Усі інші функції (улюблені, історія, рейтинги)
- ❌ Не буде пошуку світових фільмів

---

## 🔧 Технічні деталі

### Змінені файли:
```
lib/movies.ts — Покращена обробка помилок TMDB
```

### Новий код:
```typescript
// Timeout для запитів (8 секунд)
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 8000);

// Проверка ключа перед збереженням
if (!apiKey) return [];

// Обробка помилок при завантаженні
try {
  // ... завантаження
} catch (error) {
  console.warn('Помилка:', error);
  return [];
}
```

### Структура проекту:
```
kino-ua-updated/
├── app/
│   ├── page.tsx       (Основна сторінка)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
├── components/
│   ├── ContinueWatching.tsx
│   ├── UserRating.tsx
│   ├── RelatedMovies.tsx
│   └── ...
├── lib/
│   ├── movies.ts      (TMDB функції) ← ЗМІНЕНО
│   └── store.ts
├── package.json
├── next.config.js
└── tailwind.config.js
```

---

## 🐛 Якщо щось не працює

### Проблема: "TMDB API Key невірний"
**Рішення:**
- Перевір, що ключ скопійовано точно (без пробілів)
- Переконайся, що це v3 auth key (не v4 Bearer Token)
- Спробуй отримати новий ключ на themoviedb.org

### Проблема: "Фільми не завантажуються"
**Рішення:**
- Перевір інтернет з'єднання
- Подивись консоль браузера (F12 → Console)
- Перезавантаж сторінку
- Спробуй без VPN (TMDB може бути заблокований в деяких країнах)

### Проблема: "Постери не показуються"
**Рішення:**
- Це нормально для TMDB без підписки (базові зображення)
- Проверь Content Security Policy у next.config.js
- На Vercel це сам налаштується

### Проблема: "Deploy на Vercel не працює"
**Рішення:**
```bash
# Спробуй заново
vercel logout
vercel login
cd kino-ua-updated
vercel deploy --prod
```

---

## 📈 Наступні кроки (опціонально)

### 1. Підключити відеоплеєр (VideoCDN/Ashdi)
```typescript
// Замість заглушки в page.tsx:
// Замість: "🎬 Відеоплеєр — підключіть VideoCDN"
// Додай: <VideoPlayer movieId={m.id} />
```

### 2. Додати українські субтитри
```typescript
// У lib/movies.ts:
// fetchSubtitles(tmdbId) -> завантажити з OpenSubtitles
```

### 3. Інтегрувати платежі (Pro версія)
```typescript
// Додати Stripe/LiqPay для платежів
// Розблокувати додаткові фільми
```

---

## 💡 Корисні посилання

- 📖 TMDB API Документація: https://developer.themoviedb.org/docs
- 🚀 Vercel Документація: https://vercel.com/docs
- 📚 Next.js Документація: https://nextjs.org/docs
- 🎬 TMDB Website: https://www.themoviedb.org/
- 💬 Support: contact@themoviedb.org

---

## ✨ Готово!

Тепер у тебе є повнофункціональний кіно-портал з:
- ✅ 500,000+ фільмів
- ✅ Українським інтерфейсом
- ✅ Рейтингами та улюбленими
- ✅ Историєю перегляду
- ✅ Швидким деплоєм на Vercel

**Питання?** → https://www.themoviedb.org/settings/help

**Готово дивитися? 🍿**
