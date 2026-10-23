# Frontend + Django: bitta Vercel loyiha

## Joriy deploy — 23.10.2026

- Sayt: https://turkiy-meros.vercel.app/app/
- Admin: https://turkiy-meros.vercel.app/django-admin/
- Health: https://turkiy-meros.vercel.app/api/v2/health/
- Render PostgreSQL: `turkiy-meros-db`; bepul baza muddati 22.11.2026.
- Import: 17 yodgorlik, 3 kitob, 3 lug‘at so‘zi, 2 dars, 1 kampaniya, 3 variant va sayt sozlamasi.
- Lokal SQLite backup: `.local/before-vercel-20261023-100500.sqlite3`.
- Admin kirish ma’lumoti: `.local/Vercel_admin_kirish.txt`; Gitga kiritilmaydi.
- HTTP orqali health, bosh sahifa, katalog/kitob/dars APIlari, admin sahifasi, admin token kirishi, React JS va admin CSS tekshirildi. Backendning 32 testi o‘tdi. Bu safar brauzerda to‘liq foydalanuvchi jarayonlari tekshirilmadi.
- Media va private PDF uchun tashqi bucketlar hali ulanmagan; yangi video/PDF yuklash o‘chiq.
- Deploy CLI orqali bajarildi. Vercel konfiguratsiyasi va dizayn manbalari `feat/single-service` branchida yuritiladi. Preview uchun alohida `DATABASE_URL` sozlanmaguncha preview build ishga tushmaydi; production bazasini previewga ulamang.

### Dizayn yangilanishi

23.10.2026: yashil/oltin bosh sahifa, CSS 3D bitik (pointer tilt va boshqariladigan aylanish), IntersectionObserver asosidagi scroll animatsiyasi, o‘qish progressi, jonlanadigan statistika va hajmli kitob kartalari. Alohida 3D kutubxonasi qo‘shilmadi. `prefers-reduced-motion` qo‘llanadi.

Bosh sahifadagi “Bitiktoshlar vodiysi”: scroll kamera chuqurligini boshqaradi, yodgorliklar ikki tomondan yaqinlashib o‘tadi. Boshlanish, o‘rta, yakun va orqaga yurish holatlari desktop/mobilda tekshiriladi. Sayohatni o‘tkazish havolasi bor; kamaytirilgan harakat rejimida yodgorliklar oddiy ro‘yxatga almashadi. Bu badiiy sahna, arxeologik joyning aniq rekonstruksiyasi emas.

Sayohat bosh sahifaning birinchi ekrani sifatida joylashtirildi: bronza/qum rangli yangi kirish, yagona H1, qidiruv va katalog/kitobxona havolalari sahna ichida. Oldingi alohida hero olib tashlandi. Sticky sahna menyuning haqiqiy balandligiga moslashadi; qidiruvning filtrli katalogga o‘tishi ham tekshiriladi.

Brauzer QA: `node frontend/tests/design-browser.mjs`. Desktop, 360/390 px mobil, menyu, 3D boshqaruvi, asinxron kartalarning ochilishi, progress, mavzu almashtirish, sahifalararo o‘tish va kamaytirilgan harakat tekshirildi. Natija `.local/design-qa-report.json`, tasvirlar `.local/design-*.png` ichida. Production tekshiruvi uchun `DESIGN_TEST_URL=https://turkiy-meros.vercel.app/app/` beriladi.

Bir martalik baza tayyorlash: `vercel deploy --prod --build-env VERCEL_INITIALIZE_DATABASE=1`. `bootstrap_vercel` migratsiyalar va cache jadvalini yaratadi; `deploy-data/corpus.json` mavjud va kontent bazasi bo‘sh bo‘lsa import qiladi. Mavjud kontent ustiga yozmaydi. `DJANGO_SUPERUSER_PASSWORD` berilgan va faol superadmin yo‘q bo‘lsa boshlang‘ich admin yaratiladi. Oddiy deploy uchun inicializatsiya flagi berilmaydi.

Repository Root Directory: loyiha ildizi, `frontend` yoki `backend` emas. Framework: Django. Build: `python scripts/build_vercel.py`. Node.js va Python 3.12 kerak. Root `vercel.json` ishlatiladi; `frontend/vercel.json` faqat alohida frontend loyihasi uchun.

Manzillar: `/app/` — React, `/api/v2/` — API, `/django-admin/` — admin. Bitta domen ishlatilgani uchun `VITE_API_URL` berilmaydi; build uni bo‘sh qilib belgilaydi.

## Vercel Environment Variables

- `DJANGO_SECRET_KEY`: kuchli tasodifiy maxfiy kalit.
- `DJANGO_DEBUG=False`.
- `DATABASE_URL`: tashqi PostgreSQLning SSL bilan ishlaydigan ulanish manzili; pooled URL afzal. Preview uchun alohida sinov bazasi.
- `DJANGO_ALLOWED_HOSTS`: qo‘shimcha custom domenlar, probel bilan. Vercelning joriy deploy va production hostlari avtomatik olinadi.
- `CSRF_TRUSTED_ORIGINS`: custom domenlarning `https://...` shakli, probel bilan.
- `FRONTEND_URL=/app/`.
- Ochiq media: `AWS_STORAGE_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_ENDPOINT_URL`, `AWS_S3_REGION_NAME`, `AWS_S3_CUSTOM_DOMAIN`.
- Yopiq ilmiy PDF: `PRIVATE_AWS_STORAGE_BUCKET_NAME`; public access o‘chirilgan alohida bucket.

Maxfiy kalitlarni chatga yoki Gitga joylamang. Vercel dashboarddagi Environment Variables orqali kiriting.

## Bazani tayyorlash

Xuddi shu production env bilan, ishonchli mahalliy terminal yoki bir martalik CI vazifasida quyidagilar bajariladi. Build vaqtida bazani o‘zgartirish bajarilmaydi.

```powershell
.venv/Scripts/python.exe manage.py migrate --noinput
.venv/Scripts/python.exe manage.py createcachetable
.venv/Scripts/python.exe manage.py createsuperuser
```

Namuna kerak bo‘lsa `seed_data` va `seed_mvp` alohida bajariladi. Mavjud mahalliy bazani ko‘chirish uchun avval backup va alohida import rejasi kerak; deploy uni avtomatik ko‘chirmaydi.

## Joylashtirish

Vercel CLI bilan akkauntga kirib, ildiz papkada `vercel link`, so‘ng env sozlangach `vercel deploy` bajariladi. Preview tekshirilgach `vercel deploy --prod` ishlatiladi. GitHub bilan avtomatik deploy uchun ushbu repozitoriyni Vercel loyihasiga ulang va ildiz papkani tanlang.

Tekshirish: `/api/v2/health/`, `/app/`, chuqur React havolasi, admin CSS va login, ro‘yxatdan o‘tish, ovoz, yopiq PDF ruxsatlari. Alohida preview bazasi bilan tekshiring.

## Fayl yuklash chegarasi

Vercel Function so‘rov/javobi 4.5 MB bilan cheklangan. Hozirgi admin/API orqali katta video va 20 MB PDF yuklash shu deployda ishlamaydi. Katta fayllar uchun alohida signed direct-to-storage upload jarayoni hali qo‘shilmagan. `/tmp` doimiy fayl xotirasi emas; lokal media yoqilmaydi. Yuklangan fayllar S3/R2da saqlanadi. Katta yopiq PDFni Django orqali qaytarish ham chegaraga tushadi; buning uchun vakolat tekshirilgan signed download yo‘li kerak.

Manbalar: https://vercel.com/docs/frameworks/full-stack/django va https://vercel.com/docs/functions/limitations
