# Turkiy Yozma Yodgorliklar Korpusi

VII–XI asrlardagi turkiy yozma yodgorliklarning elektron korpusi. Orxun, Yenisey, uyg'ur va dastlabki islom davri matnlari — asl yozuv, transliteratsiya va tarjima bilan.

## Texnologiyalar

- **Backend:** Python · Django 4.2 · Django REST Framework · SimpleJWT
- **Frontend:** React 18 + Vite (Vercel'da yoki Django ostida `/app/`)
- **Baza:** SQLite (standart) yoki PostgreSQL
- **Tillar:** o'zbek · rus · ingliz

## Imkoniyatlar

- 15+ yodgorlik: qidiruv, filtrlash (yozuv, asr, kategoriya), saralash
- Konkordans (KWIC qidiruv), statistika, taqqoslash, lug'at, bibliografiya, vaqt chizig'i
- Eksport: JSON · CSV · TEI-XML
- Foydalanuvchi taklif yuborishi (rasm/hujjat bilan) va admin moderatsiyasi
- Admin panel (`/django-admin/`) — yodgorliklar, takliflar, kirish tarixi

## Ishga tushirish (Ubuntu / Linux)

```bash
git clone <repo-url>
cd turkiy_yozma_yodgorliklar
./backend/run.sh
```

`run.sh` avtomatik: virtual muhit yaratadi, kutubxonalarni o'rnatadi, migratsiya qiladi,
boshlang'ich ma'lumotlarni yuklaydi, admin yaratadi va serverni ishga tushiradi.

Qo'lda:

```bash
cd backend
python3 -m venv ~/venvs/turkiy_korpus
~/venvs/turkiy_korpus/bin/pip install -r requirements.txt
export DJANGO_DEBUG=True     # lokal dev (standart holatda DEBUG o'chiq)
~/venvs/turkiy_korpus/bin/python manage.py migrate
~/venvs/turkiy_korpus/bin/python manage.py seed_data
~/venvs/turkiy_korpus/bin/python manage.py runserver
```

React'ni Django ostida (`/app/`) ochish uchun build:

```bash
cd frontend
npm install
VITE_BASE=/app/ npm run build
```

React (Vite) dev server alohida:

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173 — /api so'rovlari 127.0.0.1:8000 ga proxy qilinadi
```

### Manzillar

| Sahifa | URL |
|---|---|
| Sayt (React dev) | http://localhost:5173/ |
| Sayt (Django ostida) | http://127.0.0.1:8000/app/ |
| Admin panel | http://127.0.0.1:8000/django-admin/ |
| API | http://127.0.0.1:8000/api/v2/monuments/ |
| Statistika | http://127.0.0.1:8000/api/v2/monuments/stats/ |
| Taklif yuborish | `POST` http://127.0.0.1:8000/api/v2/submit/ |
| Eksport | http://127.0.0.1:8000/api/v2/export/?format=json\|csv |

`run.sh` lokal dev uchun `admin` / `admin123` akkauntini yaratadi.
Render'da (`build.sh`) parol `DJANGO_SUPERUSER_PASSWORD` dan olinadi, demo parolli akkauntlar esa bloklanadi.

## Konfiguratsiya

Muhit o'zgaruvchilari `.env.example` da. Production uchun nusxa oling:

```bash
cp .env.example .env   # qiymatlarni to'ldiring
```

Muhim: `DJANGO_DEBUG=False`, kuchli `DJANGO_SECRET_KEY`, real `DJANGO_ALLOWED_HOSTS`.

### Yuklangan fayllar (production)

Render bepul tarifida disk vaqtinchalik — `media/` ga yozilgan rasm va hujjatlar
har deploy'da o'chadi. Buning oldini olish uchun S3-mos xotira ulang
(masalan, Cloudflare R2 — 10 GB bepul):

| O'zgaruvchi | Misol |
|---|---|
| `AWS_STORAGE_BUCKET_NAME` | `turkiy-korpus` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | R2 API token kalitlari |
| `AWS_S3_ENDPOINT_URL` | `https://<account-id>.r2.cloudflarestorage.com` |
| `AWS_S3_REGION_NAME` | `auto` |
| `AWS_S3_CUSTOM_DOMAIN` | `pub-xxxx.r2.dev` (bucket'ning ochiq domeni) |

`AWS_S3_CUSTOM_DOMAIN` berilmasa, fayl havolalari 1 soatdan keyin eskiradi —
tasdiqlangan takliflarning rasmlari saytda ko'rinishi uchun ochiq domen kerak.
Fayl nomlari tasodifiy (UUID) qilib saqlanadi.

### Mijoz IP manzili

Kirish tarixi va so'rov cheklovlari IP'ni `CLIENT_IP_HEADER` sarlavhasidan oladi
(`X-Forwarded-For`ga ishonilmaydi — uni mijoz soxtalashtira oladi).
Render'da avtomatik `True-Client-IP` ishlatiladi; proksisiz serverda bo'sh qoldiring,
Nginx ortida — `HTTP_X_REAL_IP`.

## Tuzilma

```
backend/                — Django (API + klassik sayt)
  korpus/               — asosiy ilova (modellar, API, admin, throttling)
  turkiy_korpus/        — loyiha sozlamalari
  templates/admin/      — admin panel shablonlari
  media/                — yuklangan fayllar (lokal)
  manage.py             — Django boshqaruvi
  run.sh                — Ubuntu ishga tushirish skripti
  build.sh              — Render build skripti
frontend/               — React (Vite) ilovasi
render.yaml             — Render Blueprint (rootDir: backend)
```

## Litsenziya

Ko'rsatilmagan — egasi bilan kelishilgan holda foydalaning.
