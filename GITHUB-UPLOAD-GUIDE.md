# 🚀 Как Завантажити на GitHub та Vercel

## 📦 Ты Отримав: `kino-ua-complete.zip`

Цей zip містить:
- ✅ Проект `kino-ua-updated`
- ✅ 6 гайдів на українській
- ✅ Всі необхідні файли

---

## 🔗 ВАРІАНТ 1: GitHub + Vercel (РЕКОМЕНДУЄМО)

### Крок 1: Розпакуй zip
```bash
unzip kino-ua-complete.zip
cd outputs/kino-ua-updated
```

### Крок 2: Ініціалізуй Git
```bash
git init
git add .
git commit -m "Initial commit: КІНО.UA with TMDB integration"
```

### Крок 3: Створи репозиторій на GitHub
```
1. Перейди на https://github.com/new
2. Введи назву: kino-ua (або інша)
3. Натисни "Create repository"
4. Скопіюй посилання (як https://github.com/YOUR_USERNAME/kino-ua.git)
```

### Крок 4: Пушнути на GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/kino-ua.git
git branch -M main
git push -u origin main
```

### Крок 5: Розгорни на Vercel
```
1. Перейди на https://vercel.com/
2. Натисни "New Project"
3. Вибери свій репозиторій з GitHub
4. Натисни "Import"
5. Додай Environment Variable:
   - Name: NEXT_PUBLIC_TMDB_API_KEY
   - Value: твій_TMDB_ключ
6. Натисни "Deploy"
```

**✅ Готово! Сайт у вас буде на адресі типу:**
```
https://kino-ua-xyz123.vercel.app
```

---

## ⚡ ВАРІАНТ 2: Vercel CLI (НАЙШВИДШЕ)

Якщо у тебе уже встановлений npm:

```bash
# 1. Розпакуй zip
unzip kino-ua-complete.zip
cd outputs/kino-ua-updated

# 2. Встановлюємо і логуємось в Vercel
npm install -g vercel
vercel login

# 3. Розгортаємо
vercel deploy

# 4. На запит про TMDB ключ - введи його
```

---

## 🐙 ВАРІАНТ 3: GitHub Desktop (ДЛЯ НОВАЧКІВ)

Якщо ти не любиш терміналь:

```
1. Завантажимо GitHub Desktop: https://desktop.github.com/
2. Розпакуй zip
3. Відкрий GitHub Desktop
4. "File" → "Add Local Repository"
5. Вибери папку kino-ua-updated
6. Натисни "Publish repository"
7. Вводи назву та описання
8. На Vercel все те ж саме
```

---

## 📱 VERCEL DEPLOY ЧЕРЕЗ ВЕБ (НАЙПРОСТІШЕ)

```
1. Розпакуй zip
2. Скопіюй папку kino-ua-updated
3. Перейди на https://vercel.com/
4. Натисни "Upload" (або drag-n-drop)
5. Перетягни папку в вікно браузера
6. Дай дозвіл
7. Додай TMDB API ключ
8. Deploy!
```

---

## 🔑 ПІСЛЯ DEPLOY

### На Vercel:
```
1. Натисни на проект
2. Settings → Environment Variables
3. Додай: NEXT_PUBLIC_TMDB_API_KEY = твій_ключ
4. Перейди на Deployments
5. Натисни на останній deploy
6. Натисни "Redeploy"
```

### Готово! Сайт тепер буде з TMDB фільмами ✅

---

## 📝 ЯКЩО ПОТІМ ХОЧЕШ ОНОВЛЕННЯ

### Якщо користуєш GitHub:
```bash
# 1. Зміни код локально
nano app/page.tsx

# 2. Коміт
git add .
git commit -m "Update: description of changes"

# 3. Push на GitHub
git push origin main

# 4. Vercel автоматично redeploy!
```

### Якщо користуєш Vercel CLI:
```bash
# Просто
vercel deploy
```

---

## ✅ ЧЕКЛИСТ ПЕРЕД DEPLOY

- [ ] Zip розпакований
- [ ] TMDB API ключ отримано
- [ ] Git встановлений (якщо через GitHub)
- [ ] npm встановлений
- [ ] GitHub акаунт створений (для GitHub варіанту)
- [ ] Vercel акаунт створений

---

## 🆘 ПОПУЛЯРНІ ПОМИЛКИ

### Помилка: "не можу розпакувати zip"
```bash
# Спробуй:
unzip -q kino-ua-complete.zip
# або
7z x kino-ua-complete.zip
```

### Помилка: "git не встановлений"
```bash
# Ubuntu/Debian:
sudo apt install git

# macOS:
brew install git

# Windows:
# Завантажи з https://git-scm.com/
```

### Помилка: "npm не встановлений"
```bash
# Скачай з https://nodejs.org/
# або:
sudo apt install nodejs npm  # Linux
brew install node            # macOS
```

### Помилка: "Permission denied"
```bash
# macOS/Linux:
chmod +x kino-ua-complete.zip
unzip kino-ua-complete.zip
```

---

## 📊 ЧАСИ DEPLOY

| Спосіб | Час | Складність |
|---|---|---|
| **Vercel Web Upload** | 1-2 хв | ⭐ Легко |
| **Vercel CLI** | 3-5 хв | ⭐⭐ Нормально |
| **GitHub + Vercel** | 5-10 хв | ⭐⭐⭐ Складніше |
| **GitHub Desktop** | 5-10 хв | ⭐⭐ Нормально |

---

## 🎯 РЕКОМЕНДУЄМО

Для швидкого старту:
1. **Vercel Web Upload** — 30 секунд!
2. Потім налаштуй TMDB ключ

Для постійної розробки:
1. **GitHub + Vercel** — auto deploy при змінах
2. Та CLI для тестування

---

## 🔗 КОРИСНІ ПОСИЛАННЯ

- 🌐 GitHub: https://github.com/new
- 🚀 Vercel: https://vercel.com/
- 📚 Git Tutorial: https://guides.github.com/
- 📖 Vercel Docs: https://vercel.com/docs

---

## 🎉 ГОТОВО!

Коли deploy закінчиться, ти матимеш:
- ✅ Свій кіно-портал в интернеті
- ✅ 500,000+ фільмів від TMDB
- ✅ Власний домен vercel.app
- ✅ Автоматичні оновлення з GitHub

**Тестуй та получай задоволення! 🍿**

---

**Питання?** Прочитай `QUICK-GUIDE.md` → Q1-Q10
